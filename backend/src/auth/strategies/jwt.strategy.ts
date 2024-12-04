import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Request } from "express";

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Type assertion to ensure type safety
    const jwtExtractor = ExtractJwt.fromAuthHeaderAsBearerToken();
    if (!jwtExtractor || typeof jwtExtractor !== 'function') {
      throw new Error("Failed to initialize JWT extractor");
    }

    super({
      jwtFromRequest: jwtExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<SafeUser> {
    try {
      // Log the incoming request headers
      console.log("JWT Strategy - Headers:", request.headers);
      console.log(
        "JWT Strategy - Authorization:",
        request.headers.authorization
      );
      console.log("JWT Strategy - Payload:", payload);

      if (!payload || !payload.sub) {
        console.log("JWT Strategy - Invalid payload");
        throw new UnauthorizedException("Invalid token payload");
      }

      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        select: ["id", "email", "firstName", "lastName", "role"],
      });

      if (!user) {
        console.log("JWT Strategy - User not found:", payload.sub);
        throw new UnauthorizedException("User not found");
      }

      console.log("JWT Strategy - Found User:", user);

      // Return a plain object instead of the entity
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      };
    } catch (error) {
      console.error("JWT Strategy - Validation error:", error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        error instanceof Error ? error.message : "Token validation failed"
      );
    }
  }
}
