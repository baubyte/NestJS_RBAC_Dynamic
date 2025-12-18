import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RefreshToken } from '../entities/refresh-token.entity';
import { envs } from 'src/config/envs';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    super({
      secretOrKey: envs.jwtRefreshSecret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return (request?.cookies?.refreshToken as string | undefined) || '';
        },
      ]),
      passReqToCallback: true,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(req: Request, payload: Record<string, unknown>) {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Buscar el refresh token en la base de datos
    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ['user'],
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verificar si el token está revocado
    if (storedToken.is_revoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    // Verificar si el token ha expirado
    if (new Date() > new Date(storedToken.expires_at)) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Verificar si el usuario está activo
    if (!storedToken.user.is_active) {
      throw new UnauthorizedException('User is inactive, talk with an admin');
    }

    return {
      user: storedToken.user,
      tokenId: storedToken.id,
      refreshToken,
    };
  }
}
