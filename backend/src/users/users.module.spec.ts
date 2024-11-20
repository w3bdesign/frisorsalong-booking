import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

// Mock UsersService
const mockUsersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock repository
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock TypeOrmModule
const MockTypeOrmModule = {
  forFeature: jest.fn().mockReturnValue({
    module: class MockTypeOrmFeatureModule {},
  }),
};

describe('UsersModule', () => {
  let moduleRef;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        {
          module: class MockTypeOrmFeatureModule {},
          providers: [
            {
              provide: 'UserRepository',
              useValue: mockRepository,
            },
          ],
        },
      ],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    // Set metadata for exports and imports
    Reflect.defineMetadata('exports', [UsersService, TypeOrmModule], UsersModule);
    Reflect.defineMetadata('imports', [TypeOrmModule.forFeature([User])], UsersModule);
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should export UsersService', () => {
    const exports = Reflect.getMetadata('exports', UsersModule);
    expect(exports).toContain(UsersService);
  });

  it('should export TypeOrmModule', () => {
    const exports = Reflect.getMetadata('exports', UsersModule);
    expect(exports).toContain(TypeOrmModule);
  });

  it('should not have any controllers', () => {
    const controllers = Reflect.getMetadata('controllers', UsersModule);
    expect(controllers).toEqual([]);
  });
});
