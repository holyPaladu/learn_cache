import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [UsersModule, TypeOrmModule.forRoot(databaseConfig)],
  controllers: [],
  providers: [],
})
export class AppModule {}
