import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UserRole } from "../users/entities/user.entity";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

describe("AuthController", () => {
  let controller: AuthController;

  const mockUser = {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: UserRole.CUSTOMER,
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
});
