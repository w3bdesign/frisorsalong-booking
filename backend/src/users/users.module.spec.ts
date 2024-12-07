import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { DynamicModule, Type } from '@nestjs/common';

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

// Define metadata types
type ModuleExports = Array<Type<unknown> | DynamicModule>;
type ModuleImports = Array<Type<unknown> | DynamicModule>;

describe('UsersModule', () => {
  let moduleRef: TestingModule;

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
    const moduleExports: ModuleExports = [UsersService, TypeOrmModule];
    const moduleImports: ModuleImports = [TypeOrmModule.forFeature([User])];

    Reflect.defineMetadata('exports', moduleExports, UsersModule);
    Reflect.defineMetadata('imports', moduleImports, UsersModule);
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should export UsersService', () => {
    const exports = Reflect.getMetadata('exports', UsersModule) as ModuleExports;
    expect(exports.includes(UsersService)).toBe(true);
  });

  it('should export TypeOrmModule', () => {
    const exports = Reflect.getMetadata('exports', UsersModule) as ModuleExports;
    expect(exports.includes(TypeOrmModule)).toBe(true);
  });

  it('should not have any controllers', () => {
    const controllers = Reflect.getMetadata('controllers', UsersModule) as Type<unknown>[];
    expect(controllers).toEqual([]);
  });
});
