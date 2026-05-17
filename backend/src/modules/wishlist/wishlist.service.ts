import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepo: Repository<Wishlist>,
  ) {}

  async getWishlist(userId: string) {
    const items = await this.wishlistRepo.find({
      where: { user: { id: userId } },
      relations: ['product', 'product.images', 'product.category'],
    });
    return items;
  }

  async addToWishlist(userId: string, productId: string) {
    const existing = await this.wishlistRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }
    const item = this.wishlistRepo.create({
      user: { id: userId } as any,
      product: { id: productId } as any,
    });
    return this.wishlistRepo.save(item);
  }

  async removeFromWishlist(userId: string, productId: string) {
    const item = await this.wishlistRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (item) {
      await this.wishlistRepo.remove(item);
    }
    return { message: 'Removed from wishlist' };
  }

  async toggleWishlist(userId: string, productId: string) {
    const existing = await this.wishlistRepo.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (existing) {
      await this.wishlistRepo.remove(existing);
      return { inWishlist: false };
    }
    const item = this.wishlistRepo.create({
      user: { id: userId } as any,
      product: { id: productId } as any,
    });
    await this.wishlistRepo.save(item);
    return { inWishlist: true };
  }
}
