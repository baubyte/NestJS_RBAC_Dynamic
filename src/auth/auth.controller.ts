import { Controller, Get, Post, Body, Res, Req } from '@nestjs/common';
import type { Request, Response } from 'express';

import { GetUser } from './decorators/get-user.decorator';
import { GetRefreshToken } from './decorators/get-refresh-user.decorator';
import { Auth } from './decorators/auth.decorator';
import { RefreshAuth } from './decorators/refresh-auth.decorator';
import { User } from './entities/user.entity';

import { AuthService } from './auth.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(
    @Body() createUserDto: CreateUserDTO,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.authService.create(createUserDto, res, req);
  }

  @Post('login')
  login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.authService.login(loginUserDto, res, req);
  }

  @Post('refresh')
  @RefreshAuth()
  async refresh(
    @GetUser() user: User,
    @GetRefreshToken('tokenId') tokenId: string,
    @GetRefreshToken('refreshToken') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.authService.refreshAccessToken(
      user,
      tokenId,
      refreshToken,
      res,
      req,
    );
  }

  @Post('logout')
  @RefreshAuth()
  async logout(
    @GetRefreshToken('tokenId') tokenId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(tokenId, res);
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
