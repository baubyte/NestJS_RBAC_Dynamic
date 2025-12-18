import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

import { User } from './entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { Role } from 'src/access-control/entities';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { envs } from 'src/config/envs';
import { CommonModule } from 'src/common/common.module';
import jwtConfig from 'src/config/jwt.config';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  imports: [
    CommonModule,
    ConfigModule.forFeature(jwtConfig),
    TypeOrmModule.forFeature([User, Role, RefreshToken]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.register({
      secret: envs.jwtAccessSecret,
    }),
  ],
  exports: [
    TypeOrmModule,
    JwtStrategy,
    RefreshTokenStrategy,
    PassportModule,
    JwtModule,
    AuthService,
  ],
})
export class AuthModule {}
