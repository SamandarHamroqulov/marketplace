import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
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

  async findAll(query: ProductQueryDto = {}) {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images');

    if (query.search) {
      qb.andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId: query.categoryId });
    }

    if (query.brand) {
      qb.andWhere('product.brand ILIKE :brand', { brand: query.brand });
    }

    if (query.minPrice !== undefined) {
      qb.andWhere('product.price >= :minPrice', { minPrice: query.minPrice });
    }

    if (query.maxPrice !== undefined) {
      qb.andWhere('product.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    if (query.inStock !== undefined) {
      qb.andWhere('product.inStock = :inStock', { inStock: query.inStock });
    }

    switch (query.sort) {
      case 'price_asc':
        qb.orderBy('product.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('product.price', 'DESC');
        break;
      case 'title':
        qb.orderBy('product.title', 'ASC');
        break;
      default:
        qb.orderBy('product.createdAt', 'DESC');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
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

  async findRelated(id: string, limit = 4) {
    const product = await this.findOne(id);
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images')
      .where('product.id != :id', { id });

    if (product.category?.id) {
      qb.andWhere('category.id = :categoryId', { categoryId: product.category.id });
    } else if (product.brand) {
      qb.andWhere('product.brand = :brand', { brand: product.brand });
    }

    return qb.orderBy('product.createdAt', 'DESC').take(limit).getMany();
  }

  async getBrands() {
    const rows = await this.productRepo
      .createQueryBuilder('product')
      .select('product.brand', 'brand')
      .addSelect('COUNT(*)', 'count')
      .where('product.brand IS NOT NULL')
      .groupBy('product.brand')
      .orderBy('count', 'DESC')
      .getRawMany();

    return rows.map((r) => ({
      name: r.brand,
      count: Number(r.count),
    }));
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
