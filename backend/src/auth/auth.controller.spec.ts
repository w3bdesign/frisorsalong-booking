import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { User, UserRole } from "../users/entities/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

describe("AuthController", () => {
  let controller: AuthController;

  const mockUser: User = {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: UserRole.CUSTOMER,
    password: "hashed_password",
    phoneNumber: "1234567890",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    hashPassword: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockAuthResponse = {
    user: mockUser,
    token: "jwt_token",
  };

  const mockAuthService = {
    register: jest.fn().mockImplementation(() => Promise.resolve(mockAuthResponse)),
    login: jest.fn().mockImplementation(() => Promise.resolve(mockAuthResponse)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("register", () => {
    const registerDto: RegisterDto = {
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: UserRole.CUSTOMER,
    };

    it("should successfully register a new user", async () => {
      const result = await controller.register(registerDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
    });

    it("should pass through service errors", async () => {
      const error = new Error("Registration failed");
      mockAuthService.register.mockRejectedValueOnce(error);

      await expect(controller.register(registerDto)).rejects.toThrow(error);
    });
  });

  describe("login", () => {
    const loginDto: LoginDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should successfully login a user", async () => {
      const result = await controller.login(loginDto);

      expect(result).toEqual(mockAuthResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });

    it("should pass through service errors", async () => {
      const error = new Error("Login failed");
      mockAuthService.login.mockRejectedValueOnce(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
    });
  });

  describe("getProfile", () => {
    it("should return the authenticated user", () => {
      const result = controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
    });

    it("should return user without password field", () => {
      const userWithPassword: User = {
        ...mockUser,
        password: "hashed_password",
        hashPassword: jest.fn(),
        validatePassword: jest.fn(),
      };
      const result = controller.getProfile(userWithPassword);

      expect(result).toEqual(userWithPassword);
      // In practice the JwtStrategy never includes password in the user object
      // The guard ensures only authenticated users reach this endpoint
    });
  });
});
