import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Check if Authorization header exists and is properly formatted
    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header must start with "Bearer "');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not provided');
    }

    // Add debug logging
    console.log('JWT Auth Guard - Token:', token);
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Add debug logging
    console.log('JWT Auth Guard - Error:', err?.message || err);
    console.log('JWT Auth Guard - User:', user);
    console.log('JWT Auth Guard - Info:', info?.message || info);

    // Handle specific JWT errors
    if (info instanceof Error) {
      if (info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format');
      }
      if (info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
    }

    if (err || !user) {
      throw err || new UnauthorizedException('User not authenticated');
    }

    return user;
  }
}
