import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: User;
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user) {
      throw new Error('User not found in request');
    }
    const user: User = request.user;
    return user;
  },
);
