import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import { User } from 'src/users/entities/user.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'test',
  entities: [User],
  synchronize: true,
};
