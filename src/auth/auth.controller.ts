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
}
