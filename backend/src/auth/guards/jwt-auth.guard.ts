import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
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

    const token = parts[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    // Add debug logging
    console.log('JWT Auth Guard - Token:', token);
    
    return super.canActivate(context);
  }

  handleRequest(err: Error | null, user: User | null, info: Error | unknown): User {
    // Add debug logging
    const errorMessage = err instanceof Error ? err.message : err;
    console.log('JWT Auth Guard - Error:', errorMessage);
    console.log('JWT Auth Guard - User:', user);
    console.log('JWT Auth Guard - Info:', info instanceof Error ? info.message : info);

    // Handle specific JWT errors
    if (info instanceof Error) {
      if (info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format');
      }
      if (info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
    }

    if (err) {
      throw err;
    }

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return user;
  }
}
