import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Decorador para extraer tokenId o refreshToken del payload del RefreshAuth
 *
 * Para extraer el User, usa @GetUser() que funciona en ambos contextos
 *
 * @param data - 'tokenId' o 'refreshToken'
 * @returns El tokenId o refreshToken según lo solicitado
 *
 * @example
 * ```typescript
 * @Post('logout')
 * @RefreshAuth()
 * async logout(
 *   @GetUser() user: User,
 *   @GetRefreshToken('tokenId') tokenId: string
 * ) {
 *   return this.authService.logout(tokenId);
 * }
 * ```
 */
export const GetRefreshToken = createParamDecorator(
  (data: 'tokenId' | 'refreshToken', ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const refreshData = request.user as {
      tokenId: string;
      refreshToken: string;
    };

    if (!refreshData || !refreshData[data]) {
      throw new InternalServerErrorException(
        `${data} not found in refresh token payload`,
      );
    }

    return refreshData[data];
  },
);
