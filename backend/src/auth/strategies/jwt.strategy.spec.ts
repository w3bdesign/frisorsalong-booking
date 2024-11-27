import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;
  let usersRepository: Repository<User>;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret'),
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
    configService = module.get<ConfigService>(ConfigService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should use the secret from config service', () => {
    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
  });

  describe('validate', () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer test-token'
      }
    };
    const mockPayload = { sub: 'user-123' };
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer',
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
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPayload.sub },
        select: ['id', 'email', 'firstName', 'lastName', 'role'],
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUsersRepository.findOne.mockResolvedValue(null);

      await expect(strategy.validate(mockRequest, mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when payload is invalid', async () => {
      await expect(strategy.validate(mockRequest, {})).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
