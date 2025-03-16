import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Имя пользователя' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Имя пользователя' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Email пользователя',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
