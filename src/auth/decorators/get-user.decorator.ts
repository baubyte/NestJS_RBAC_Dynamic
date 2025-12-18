import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../entities/user.entity';

/**
 * Decorador para extraer el usuario del request
 *
 * Funciona tanto con @Auth() como con @RefreshAuth():
 * - Con @Auth(): extrae directamente request.user
 * - Con @RefreshAuth(): extrae request.user.user (del payload del refresh token)
 *
 * @param data - Propiedad específica del User a extraer
 * @returns El User completo o una propiedad específica
 *
 * @example
 * ```typescript
 * @Get('profile')
 * @Auth()
 * getProfile(@GetUser() user: User) {
 *   return user;
 * }
 *
 * @Post('refresh')
 * @RefreshAuth()
 * refresh(@GetUser() user: User) {
 *   // También funciona con RefreshAuth
 *   return user;
 * }
 * ```
 */
export const GetUser = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ): User | User[keyof User] | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const requestUser = request.user as
      | User
      | { user: User; tokenId: string; refreshToken: string };

    if (!requestUser) {
      throw new InternalServerErrorException('User not found in request');
    }

    // Si request.user tiene la propiedad 'user', significa que viene de RefreshAuth
    const user = 'user' in requestUser ? requestUser.user : requestUser;

    if (data) {
      if (data in user) {
        return user[data as keyof User];
      }
      return undefined;
    }
    return user;
  },
);
