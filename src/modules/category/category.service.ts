import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async clearCache() {
    await this.cacheManager.del('/api/categories/all');
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepo.create({
      ...createCategoryDto,
      parent: createCategoryDto.parentId ? { id: createCategoryDto.parentId } as any : null,
    });
    const result = await this.categoryRepo.save(category);
    await this.clearCache();
    return result;
  }

  async findAll() {
    return await this.categoryRepo.find({ relations: ['products'] });
  }

  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    this.categoryRepo.merge(category, {
      ...updateCategoryDto,
      parent: updateCategoryDto.parentId ? { id: updateCategoryDto.parentId } as any : category.parent,
    });
    const result = await this.categoryRepo.save(category);
    await this.clearCache();
    return result;
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepo.remove(category);
    await this.clearCache();
    return { message: 'Category removed successfully' };
  }
}
