import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/all')
  async getAllUsers() {
    const users = await this.usersService.getAllUsers();
    return users;
  }
}
