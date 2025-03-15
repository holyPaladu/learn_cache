import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    private cacheManager: Cache,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
