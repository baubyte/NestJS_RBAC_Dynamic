import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { envs } from 'src/config/envs';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([User]),

    PassportModule.register({ defaultStrategy: 'jwt' }),

    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => {
        return {
          secret: envs.jwtSecret,
          signOptions: {
            expiresIn: parseInt(envs.jwtExpiresIn, 10),
          },
        };
      },
    }),
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule, AuthService],
})
export class AuthModule {}
