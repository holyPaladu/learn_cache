import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async checkCacheSize() {
    const keys = ['users', 'user_ids'];
    let totalSize = 0;

    for (const key of keys) {
      const cachedData = await this.cacheManager.get(key);
      if (cachedData) {
        const size = Buffer.byteLength(JSON.stringify(cachedData));
        totalSize += size;
        console.log(`📏 Размер '${key}': ${size} байт`);
      } else {
        console.log(`❌ Ключ '${key}' отсутствует в кэше`);
      }
    }
    console.log(`📊 Общий размер кэша: ${totalSize} байт`);
  }

  //? BAZE SERVICE
  async findOneUser(id: number) {
    const user = this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async createUser(data: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  //! TEST WITH CACHE

  // Простое кэширование всех ползавателей
  async getAllUsers(): Promise<User[]> {
    console.time('getAllUsers');
    const cachedUsers = await this.cacheManager.get('users');
    if (cachedUsers) {
      console.log('✅ Данные получены из кэша');
      console.timeEnd('getAllUsers');
      return cachedUsers as User[];
    }

    console.log('⏳ Данные загружаются из базы...');
    const users = await this.userRepository.find();
    console.log('💾 Сохраняем данные в кэш');
    await this.cacheManager.set('users', users, 60 * 1000);
    console.timeEnd('getAllUsers');
    return users;
  }

  // Save only id on cache test for speed
  // При 1000 ползавателях у меня кэш сравнение
  /*
    По памяти =>
    users = 139174 байт
    user_ids = 3904 байт
    TOTAL = 35.6 разница

    По скорости =>
    users = 3.634 ms
    user_ids = 43.83 ms
    TOTAL = 12 разница

    Но есть запрос в бд при user_ids по индексу
    которое не сильно нагружает
  */
  async getAllUsersTest(): Promise<User[]> {
    console.time('getAllUsers');

    // 1️⃣ Получаем кэшированные ID пользователей
    const cachedUserIds = await this.cacheManager.get<number[]>('user_ids');

    if (cachedUserIds) {
      console.log('✅ ID пользователей получены из кэша:');

      // 2️⃣ Загружаем пользователей по этим ID
      const users = await this.userRepository.findBy({ id: In(cachedUserIds) });

      console.timeEnd('getAllUsers');
      return users;
    }

    console.log('⏳ Загружаем пользователей из базы...');
    // 3️⃣ Загружаем всех пользователей и кэшируем только их ID
    const users = await this.userRepository.find();
    const userIds = users.map((user) => user.id);

    console.log('💾 Сохраняем ID пользователей в кэш:');
    await this.cacheManager.set('user_ids', userIds, 60 * 1000); // 60 сек

    console.timeEnd('getAllUsers');
    return users;
  }

  // WRITE-THROUGH Caching
  /* 
    Эта стратегия особенно полезна, если:
      ✔ Данные часто запрашиваются.
      ✔ Важно, чтобы кэш всегда содержал актуальную информацию.
  */
  async updateUser(userId: number, updateData: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.preload({
      id: userId,
      ...updateData,
    });
    if (!user) throw new NotFoundException('User not found');

    // Обновляем в БД
    await this.userRepository.save(user);

    // Обновляем кэш сразу
    const cacheKey = `user_${userId}`;
    await this.cacheManager.set(cacheKey, user, 5 * 60 * 1000);

    return user;
  }
  // Cache Aside (Lazy Loading)
  /* 
    Как дополнение к тому что сверху то есть 
    в кэш ложем только то что часто просмотривается 
    и а не все что клиенты обновляли
  */
  async getUser(userId: number) {
    const cacheKey = `user_${userId}`;
    const cacheUser = await this.cacheManager.get<User>(cacheKey);
    if (cacheUser) return cacheUser;

    const user = await this.findOneUser(userId);
    await this.cacheManager.set(cacheKey, user, 5 * 60 * 1000);
    return user;
  }
}
