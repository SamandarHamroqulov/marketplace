import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async clearCache(id?: string) {
    await this.cacheManager.del('/api/products/all');
    if (id) {
      await this.cacheManager.del(`/api/products/${id}`);
    }
  }

  async create(createProductDto: CreateProductDto, ownerId: string, files: Express.Multer.File[]) {
    const product = this.productRepo.create({
      ...createProductDto,
      category: { id: createProductDto.categoryId } as any,
      owner: { id: ownerId } as any,
      images: files?.map(file => ({ imageUrl: file.path })),
    });
    const savedProduct = await this.productRepo.save(product);
    await this.clearCache();
    return savedProduct;
  }

  async findAll() {
    return await this.productRepo.find({
      relations: ['category', 'images'],
    });
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'owner', 'images', 'reviews'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, requester: any, files?: Express.Multer.File[]) {
    const product = await this.findOne(id);
    
    if (product.owner.id !== requester.id && requester.role !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to update this product');
    }

    const updatedProduct = this.productRepo.merge(product, {
      ...updateProductDto,
      category: updateProductDto.categoryId ? ({ id: updateProductDto.categoryId } as any) : product.category,
      images: (files && files.length > 0) ? files.map(file => ({ imageUrl: file.path })) : product.images,
    });

    const result = await this.productRepo.save(updatedProduct);
    await this.clearCache(id);
    return result;
  }

  async remove(id: string, requester: any) {
    const product = await this.findOne(id);

    if (product.owner.id !== requester.id && requester.role !== Role.ADMIN) {
      throw new ForbiddenException('You are not authorized to remove this product');
    }

    await this.productRepo.remove(product);
    await this.clearCache(id);
    return { message: 'Product removed successfully' };
  }
}
