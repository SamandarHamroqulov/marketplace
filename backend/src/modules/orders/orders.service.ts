import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { AddressService } from '../address/address.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { calculateOrderTotals } from 'src/common/utils/checkout-pricing';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>,
    private readonly cartService: CartService,
    private readonly addressService: AddressService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  private getCacheKey(userId: string) {
    return `user_${userId}_orders`;
  }

  async createOrderFromCart(userId: string, checkoutDto: CheckoutDto) {
    const cartData = await this.cartService.getCart(userId);

    if (!cartData.items || cartData.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let shippingAddress: string;

    if (checkoutDto.addressId) {
      const address = await this.addressService.findOne(checkoutDto.addressId, userId);
      shippingAddress = `${address.addressLine}, ${address.city} (${address.zipCode || 'N/A'}) - Phone: ${address.phoneNumber || 'N/A'}`;
    } else if (checkoutDto.newAddress) {
      const address = await this.addressService.create(checkoutDto.newAddress, userId);
      shippingAddress = `${address.addressLine}, ${address.city} (${address.zipCode || 'N/A'}) - Phone: ${address.phoneNumber || 'N/A'}`;
    } else {
      throw new BadRequestException('Shipping address is required');
    }

    const pricing = calculateOrderTotals(cartData.totalPrice, checkoutDto.shippingMethod);

    const order = this.orderRepo.create({
      user: { id: userId } as any,
      totalPrice: pricing.totalPrice,
      subtotal: pricing.subtotal,
      taxAmount: pricing.taxAmount,
      shippingFee: pricing.shippingFee,
      shippingMethod: checkoutDto.shippingMethod || 'free',
      shippingAddress,
      items: cartData.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      })),
    });

    const savedOrder = await this.orderRepo.save(order);
    await this.cartService.clearCart(userId);
    await this.cacheManager.del(this.getCacheKey(userId));

    return savedOrder;
  }

  async findAll(userId: string) {
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.cacheManager.get<Order[]>(cacheKey);
    if (cached) return cached;

    const orders = await this.orderRepo.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
    });

    await this.cacheManager.set(cacheKey, orders, 3600000);
    return orders;
  }

  async findOne(id: string, userId: string) {
    return await this.orderRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['items', 'items.product', 'items.product.images'],
    });
  }

  async findAllAdmin() {
    return this.orderRepo.find({
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
}
