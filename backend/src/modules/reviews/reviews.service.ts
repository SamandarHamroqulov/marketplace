import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async clearCache(productId?: string) {
    if (productId) {
      await this.cacheManager.del(`/api/reviews?productId=${productId}`);
    }
    await this.cacheManager.del('/api/reviews');
  }

  async create(createReviewDto: CreateReviewDto, userId: string) {
    const review = this.reviewRepo.create({
      ...createReviewDto,
      user: { id: userId } as any,
      product: { id: createReviewDto.productId } as any,
    });

    const savedReview = await this.reviewRepo.save(review);
    await this.clearCache(createReviewDto.productId);
    return savedReview;
  }

  async findAll(productId?: string) {
    return await this.reviewRepo.find({
      where: productId ? { product: { id: productId } } : {},
      relations: ['user', 'product'],
    });
  }

  async findOne(id: string) {
    const review = await this.reviewRepo.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, userId: string) {
    const review = await this.findOne(id);

    if (review.user.id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    Object.assign(review, updateReviewDto);
    const result = await this.reviewRepo.save(review);
    await this.clearCache(review.product.id);
    return result;
  }

  async remove(id: string, userId: string) {
    const review = await this.findOne(id);

    if (review.user.id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const productId = review.product.id;
    await this.reviewRepo.remove(review);
    await this.clearCache(productId);
    return { message: 'Review deleted successfully' };
  }
}
