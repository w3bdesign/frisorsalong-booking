import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  getSchemaPath,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto";
import { AuthResponse, UserResponse } from "./interfaces/auth.interface";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { GetUser } from "./decorators/get-user.decorator";
import { User } from "../users/entities/user.entity";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: "User successfully registered",
    schema: {
      properties: {
        user: {
          $ref: getSchemaPath(RegisterDto),
          properties: {
            id: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        token: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: "Email already exists",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @ApiOperation({ summary: "Login user" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "User successfully logged in",
    schema: {
      properties: {
        user: {
          $ref: getSchemaPath(RegisterDto),
          properties: {
            id: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        token: { type: "string" },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Invalid credentials",
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error",
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({
    status: 200,
    description: "Returns the authenticated user's profile",
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - invalid or expired token",
  })
  getProfile(@GetUser() user: User): UserResponse {
    // The JwtStrategy already validates the token and fetches user data.
    // The user object attached to the request does not contain the password.
    return user as UserResponse;
  }
}
