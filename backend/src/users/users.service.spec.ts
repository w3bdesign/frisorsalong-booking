import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { NotFoundException } from '@nestjs/common';

type JestMock = jest.Mock;
type MockCalls = Array<Array<unknown>>;

describe('UsersService', () => {
  let service: UsersService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-1');
      expect(result).toEqual(mockUser);

      const findOneMock = mockUserRepository.findOne as JestMock;
      const calls = findOneMock.mock.calls as MockCalls;
      const lastCall = calls[calls.length - 1];
      
      if (!lastCall) {
        throw new Error('Expected findOne to be called');
      }

      const lastCallArgs = lastCall[0] as FindOneOptions<User>;
      expect(lastCallArgs).toEqual({
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

      const findOneMock = mockUserRepository.findOne as JestMock;
      const calls = findOneMock.mock.calls as MockCalls;
      const lastCall = calls[calls.length - 1];
      
      if (!lastCall) {
        throw new Error('Expected findOne to be called');
      }

      const lastCallArgs = lastCall[0] as FindOneOptions<User>;
      expect(lastCallArgs).toEqual({
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

      const createMock = mockUserRepository.create as JestMock;
      const saveMock = mockUserRepository.save as JestMock;
      
      const createCalls = createMock.mock.calls as MockCalls;
      const saveCalls = saveMock.mock.calls as MockCalls;
      
      const lastCreateCall = createCalls[createCalls.length - 1];
      const lastSaveCall = saveCalls[saveCalls.length - 1];
      
      if (!lastCreateCall || !lastSaveCall) {
        throw new Error('Expected create and save to be called');
      }

      const lastCreateArgs = lastCreateCall[0] as Partial<User>;
      const lastSaveArgs = lastSaveCall[0] as Partial<User>;
      
      expect(lastCreateArgs).toEqual(createUserData);
      expect(lastSaveArgs).toEqual(createUserData);
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

      const updateMock = mockUserRepository.update as JestMock;
      const findOneMock = mockUserRepository.findOne as JestMock;

      const updateCalls = updateMock.mock.calls as MockCalls;
      const findOneCalls = findOneMock.mock.calls as MockCalls;

      const lastUpdateCall = updateCalls[updateCalls.length - 1];
      const lastFindOneCall = findOneCalls[findOneCalls.length - 1];

      if (!lastUpdateCall || !lastFindOneCall) {
        throw new Error('Expected update and findOne to be called');
      }

      expect(lastUpdateCall).toEqual(['user-1', updateData]);
      expect(lastFindOneCall[0]).toEqual({
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
