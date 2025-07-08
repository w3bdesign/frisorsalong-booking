import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { User, UserRole } from '../../users/entities/user.entity';
import { Request } from 'express';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

type MockConfigService = {
  get: jest.Mock<string | undefined, [string]>;
};

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: MockConfigService;

  const mockConfigService: MockConfigService = {
    get: jest.fn((key: string) => key === 'JWT_SECRET' ? 'test-secret' : undefined),
  };

  const mockUsersRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should use the secret from config service', () => {
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    expect(configService.get('JWT_SECRET')).toBe('test-secret');
  });

  describe('validate', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer test-token'
      }
    } as Request;

    const mockPayload: JwtPayload = {
      sub: 'user-123',
      email: 'test@example.com'
    };

    const mockUser: Partial<User> = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
    };

    it('should return user when payload is valid', async () => {
      mockUsersRepository.findOne.mockResolvedValue(mockUser);

      const result = await strategy.validate(mockRequest, mockPayload);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      });

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPayload.sub },
        select: ['id', 'email', 'firstName', 'lastName', 'role'],
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(strategy.validate(mockRequest, mockPayload))
        .rejects
        .toThrow(new UnauthorizedException('User not found'));

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPayload.sub },
        select: ['id', 'email', 'firstName', 'lastName', 'role'],
      });
    });

    it('should throw UnauthorizedException when payload is invalid', async () => {
      const invalidPayload = {} as JwtPayload;

      await expect(strategy.validate(mockRequest, invalidPayload))
        .rejects
        .toThrow(new UnauthorizedException('Invalid token payload'));

      expect(mockUsersRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when payload is missing required fields', async () => {
      const incompletePayload: Partial<JwtPayload> = { iat: 123456789 };

      await expect(strategy.validate(mockRequest, incompletePayload as JwtPayload))
        .rejects
        .toThrow(new UnauthorizedException('Invalid token payload'));

      expect(mockUsersRepository.findOne).not.toHaveBeenCalled();
    });

    it('should handle repository errors gracefully', async () => {
      const dbError = new Error('Database connection failed');
      mockUsersRepository.findOne.mockRejectedValue(dbError);

      await expect(strategy.validate(mockRequest, mockPayload))
        .rejects
        .toThrow(expect.objectContaining({
          name: 'UnauthorizedException',
          message: 'Database connection failed'
        }));

      expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPayload.sub },
        select: ['id', 'email', 'firstName', 'lastName', 'role'],
      });
    });
  });
});
