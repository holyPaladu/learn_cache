import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getAllUsers(): Promise<User[]> {
    const cachedUsers = await this.cacheManager.get('users');
    if (cachedUsers) {
      console.log('Возвращаем данные из кэша');
      return cachedUsers as User[];
    }
    const users = await this.userRepository.find();
    console.log(`Сохраняем в кэш`);
    await this.cacheManager.set('users', users, 60 * 1000);
    return users;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }
}
