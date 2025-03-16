import { Body, Controller, Get, Post, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateUserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { NoFilesInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/cache/memory')
  async getAllCacheByKey() {
    return this.usersService.checkCacheSize();
  }
  @Get('/all')
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return users;
  }
  @Get('/all/test/ids')
  async getAllUsersTestIds() {
    const users = await this.usersService.getAllUsersTest();
    return users;
  }

  @ApiOperation({ summary: 'Создать пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан', type: User })
  @UseInterceptors(NoFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateUserDto })
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }
}
