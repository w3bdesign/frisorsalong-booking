import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');
      expect(result).toEqual(mockUser);

      const findOneCalls = (userRepository.findOne as jest.Mock).mock.calls;
      const lastCall = findOneCalls[findOneCalls.length - 1];
      expect(lastCall?.[0]).toEqual({
        where: { id: 'user-1' },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);

      const findOneCalls = (userRepository.findOne as jest.Mock).mock.calls;
      const lastCall = findOneCalls[findOneCalls.length - 1];
      expect(lastCall?.[0]).toEqual({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    const createUserData = {
      email: 'new@example.com',
      firstName: 'Jane',
      lastName: 'Doe',
      password: 'password123',
    };

    it('should create and return a new user', async () => {
      mockUserRepository.create.mockReturnValue(createUserData);
      mockUserRepository.save.mockResolvedValue({ id: 'new-user', ...createUserData });

      const result = await service.create(createUserData);
      expect(result).toEqual({ id: 'new-user', ...createUserData });

      const createCalls = (userRepository.create as jest.Mock).mock.calls;
      const saveCalls = (userRepository.save as jest.Mock).mock.calls;
      
      expect(createCalls[createCalls.length - 1]?.[0]).toEqual(createUserData);
      expect(saveCalls[saveCalls.length - 1]?.[0]).toEqual(createUserData);
    });
  });

  describe('update', () => {
    const updateData = {
      firstName: 'Updated',
      lastName: 'Name',
    };

    it('should update and return the user', async () => {
      const updatedUser = { ...mockUser, ...updateData };
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(updatedUser);

      const result = await service.update('user-1', updateData);
      expect(result).toEqual(updatedUser);

      const updateCalls = (userRepository.update as jest.Mock).mock.calls;
      const findOneCalls = (userRepository.findOne as jest.Mock).mock.calls;

      expect(updateCalls[updateCalls.length - 1]).toEqual(['user-1', updateData]);
      expect(findOneCalls[findOneCalls.length - 1]?.[0]).toEqual({
        where: { id: 'user-1' },
      });
    });

    it('should throw NotFoundException when user not found during update', async () => {
      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', updateData)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
