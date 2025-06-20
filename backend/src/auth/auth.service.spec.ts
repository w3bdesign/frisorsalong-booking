import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { UserRole } from "../users/entities/user.entity";

import * as bcrypt from "bcrypt";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe("AuthService", () => {
  let service: AuthService;

  const mockUser = {
    id: "1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    password: "hashedPassword",
    role: UserRole.CUSTOMER,
  };

  const mockUsersService = {
    findByEmail: jest.fn().mockImplementation(() => Promise.resolve(null)),
    create: jest.fn().mockImplementation(() => Promise.resolve(mockUser)),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue("jwt_token"),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("register", () => {
    const registerDto = {
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      role: UserRole.CUSTOMER,
    };

    it("should successfully register a new user", async () => {
      const result = await service.register(registerDto);

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
      expect(result.user).not.toHaveProperty("password");
      expect(mockUsersService.create).toHaveBeenCalled();
    });

    it("should throw ConflictException if email already exists", async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrowError(
        expect.objectContaining({
          message: "E-postadressen er allerede i bruk",
        })
      );
    });
  });

  describe("login", () => {
    const loginDto = {
      email: "test@example.com",
      password: "password123",
    };

    beforeEach(() => {
      // Setup bcrypt mock before each test
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    });

    it("should successfully login a user", async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("user");
      expect(result.user).not.toHaveProperty("password");
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(null);

      await expect(service.login(loginDto)).rejects.toThrowError(
        expect.objectContaining({
          message: "Ugyldige innloggingsdetaljer",
        })
      );
    });

    it("should throw UnauthorizedException if password is invalid", async () => {
      mockUsersService.findByEmail.mockResolvedValueOnce(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrowError(
        expect.objectContaining({
          message: "Ugyldige innloggingsdetaljer",
        })
      );
    });
  });
});
