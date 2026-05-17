import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepo.create(createUserDto);

    return await this.userRepo.save(user);
  }

  async findAll() {
    return await this.userRepo.find();
  }

  async findOne(id: string) {
    return await this.userRepo.findOneBy({ id });
  }
  async findByEmail(email: string) {
    return await this.userRepo.findOneBy({ email })
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepo.update(id, updateUserDto);

    return await this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) {
      return null;
    }

    return await this.userRepo.remove(user);
  }
}