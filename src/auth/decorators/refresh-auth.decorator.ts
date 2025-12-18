import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Decorador para proteger endpoints que requieren Refresh Token
 *
 * Valida el refresh token desde la cookie httpOnly
 *
 * @example
 * ```typescript
 * @Post('refresh')
 * @RefreshAuth()
 * async refresh(@Req() req: Request) {
 *   // req.user contiene: { user: User, tokenId: string, refreshToken: string }
 * }
 * ```
 */
export function RefreshAuth() {
  return applyDecorators(UseGuards(AuthGuard('jwt-refresh')));
}
