import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "../../users/entities/user.entity";
import { Request } from "express";
import { Observable } from 'rxjs';

interface JwtError extends Error {
  name: 'JsonWebTokenError' | 'TokenExpiredError';
}

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    // Check if Authorization header exists and is properly formatted
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    if (typeof authHeader !== 'string') {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header must start with "Bearer "');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const [, token] = parts;
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedException('Token not provided');
    }

    // Add debug logging
    console.log('JWT Auth Guard - Token:', token);
    
    try {
      const result = super.canActivate(context);
      
      if (result instanceof Observable) {
        return result;
      }
      
      if (result instanceof Promise) {
        return result;
      }
      
      return result;
    } catch (error) {
      this.logger.error('Error in canActivate:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }

  handleRequest<TUser = User>(
    err: Error | null,
    user: TUser | false,
    info: JwtError | null
  ): TUser {
    // Add debug logging
    const errorMessage = err instanceof Error ? err.message : String(err);
    const infoMessage = info instanceof Error ? info.message : String(info);

    console.log('JWT Auth Guard - Error:', errorMessage);
    console.log('JWT Auth Guard - User:', user);
    console.log('JWT Auth Guard - Info:', infoMessage);

    // Handle specific JWT errors
    if (info instanceof Error) {
      switch (info.name) {
        case 'JsonWebTokenError':
          throw new UnauthorizedException('Invalid token format');
        case 'TokenExpiredError':
          throw new UnauthorizedException('Token has expired');
      }
    }

    if (err) {
      throw err instanceof Error ? err : new UnauthorizedException(String(err));
    }

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return user;
  }
}
