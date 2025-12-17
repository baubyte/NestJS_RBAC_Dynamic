import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../entities/user.entity';

export const GetUser = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ): User | User[keyof User] | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as User;
    if (!user) {
      throw new InternalServerErrorException('User not found in request');
    }
    if (data) {
      if (data in user) {
        return user[data as keyof User];
      }
      return undefined;
    }
    return user;
  },
);
