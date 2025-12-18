import { Controller, Get, Post, Body } from '@nestjs/common';

import { GetUser } from './decorators/get-user.decorator';
import { Auth } from './decorators/auth.decorator';
import { User } from './entities/user.entity';

import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDTO) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  @Get('verify')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkStatus(user);
  }

  @Get('users/list')
  @Auth('users.read')
  getUsersList() {
    return { message: 'Users list - Requires users.read permission' };
  }

  @Get('users/export')
  @Auth({ permissions: ['users.read', 'users.export'] })
  exportUsers() {
    return { message: 'Export users - Requires users.read AND users.export' };
  }
  @Get('users/delete-all')
  @Auth({
    roles: ['super-admin'],
    permissions: ['users.delete'],
  })
  deleteAllUsers() {
    return {
      message:
        'Delete all users - Requires super-admin role AND users.delete permission',
    };
  }
}
