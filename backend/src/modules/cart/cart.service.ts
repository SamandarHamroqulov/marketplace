import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private readonly itemRepo: Repository<CartItem>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  private getCacheKey(userId: string) {
    return `user_${userId}_cart`;
  }

  async getOrCreateCart(userId: string) {
    let cart = await this.cartRepo.findOne({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.product.images'],
    });

    if (!cart) {
      cart = this.cartRepo.create({ user: { id: userId } as any });
      await this.cartRepo.save(cart);
      cart.items = [];
    }

    return cart;
  }

  async addToCart(userId: string, createCartDto: CreateCartDto) {
    const cart = await this.getOrCreateCart(userId);
    const { productId, quantity } = createCartDto;

    let item = await this.itemRepo.findOne({
      where: { cart: { id: cart.id }, product: { id: productId } },
    });

    if (item) {
      item.quantity += quantity;
    } else {
      item = this.itemRepo.create({
        cart,
        product: { id: productId } as any,
        quantity,
      });
    }

    await this.itemRepo.save(item);
    await this.cacheManager.del(this.getCacheKey(userId));
    return this.getCart(userId);
  }

  async getCart(userId: string) {
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.cacheManager.get<any>(cacheKey);
    if (cached) return cached;

    const cart = await this.getOrCreateCart(userId);

    const totalPrice = cart.items.reduce((acc, item) => {
      return acc + (Number(item.product.price) * item.quantity);
    }, 0);

    const result = { ...cart, totalPrice };
    await this.cacheManager.set(cacheKey, result, 3600000);
    return result;
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.itemRepo.findOne({
      where: { id: itemId, cart: { id: cart.id } },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    item.quantity = quantity;
    await this.itemRepo.save(item);
    await this.cacheManager.del(this.getCacheKey(userId));
    return this.getCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = await this.itemRepo.findOne({
      where: { id: itemId, cart: { id: cart.id } },
    });

    if (!item) {
      throw new NotFoundException('Item not found in cart');
    }

    await this.itemRepo.remove(item);
    await this.cacheManager.del(this.getCacheKey(userId));
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.itemRepo.delete({ cart: { id: cart.id } });
    await this.cacheManager.del(this.getCacheKey(userId));
    return { message: 'Cart cleared' };
  }
}
