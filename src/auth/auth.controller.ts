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

  /**
   * Ejemplo 1: Solo autenticación (sin validar roles ni permisos)
   * Cualquier usuario autenticado puede acceder
   */
  @Get('verify')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkStatus(user);
  }

  /**
   * Ejemplo 2: Validar solo roles
   * Solo usuarios con rol 'admin' o 'super-user' pueden acceder
   */
  @Get('admin/dashboard')
  @Auth({ roles: ['admin', 'super-user'] })
  getAdminDashboard() {
    return { message: 'Admin Dashboard - Accessible by admin or super-user' };
  }

  /**
   * Ejemplo 3: Validar solo permisos (retrocompatible)
   * Solo usuarios con permiso 'users.read' pueden acceder
   */
  @Get('users/list')
  @Auth('users.read')
  getUsersList() {
    return { message: 'Users list - Requires users.read permission' };
  }

  /**
   * Ejemplo 4: Validar permisos (sintaxis con objeto)
   * Solo usuarios con ambos permisos pueden acceder
   */
  @Get('users/export')
  @Auth({ permissions: ['users.read', 'users.export'] })
  exportUsers() {
    return { message: 'Export users - Requires users.read AND users.export' };
  }

  /**
   * Ejemplo 5: Validar roles Y permisos (ambos requeridos)
   * El usuario debe tener rol admin/super-user Y el permiso users.delete
   */
  @Get('users/delete-all')
  @Auth({
    roles: ['admin', 'super-user'],
    permissions: ['users.delete'],
  })
  deleteAllUsers() {
    return {
      message:
        'Delete all users - Requires admin/super-user role AND users.delete permission',
    };
  }
}
