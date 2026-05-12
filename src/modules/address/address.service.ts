import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  private getCacheKey(userId: string) {
    return `user_${userId}_addresses`;
  }

  async create(createAddressDto: CreateAddressDto, userId: string) {
    if (createAddressDto.isDefault) {
      await this.addressRepo.update({ user: { id: userId } }, { isDefault: false });
    }

    const address = this.addressRepo.create({
      ...createAddressDto,
      user: { id: userId } as any,
    });

    const result = await this.addressRepo.save(address);
    await this.cacheManager.del(this.getCacheKey(userId));
    return result;
  }

  async findAll(userId: string) {
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.cacheManager.get<Address[]>(cacheKey);
    if (cached) return cached;

    const addresses = await this.addressRepo.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });

    await this.cacheManager.set(cacheKey, addresses, 3600000); // 1 hour
    return addresses;
  }

  async findOne(id: string, userId: string) {
    const address = await this.addressRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }

    return address;
  }

  async remove(id: string, userId: string) {
    const address = await this.findOne(id, userId);
    await this.addressRepo.remove(address);
    await this.cacheManager.del(this.getCacheKey(userId));
    return { message: 'Address deleted successfully' };
  }
}
