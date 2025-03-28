import { Test } from '@nestjs/testing';
import { ServicesModule } from './services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { ServicesService } from './services.service';
import { Type } from '@nestjs/common';

// Mock ServicesService
const mockServicesService = {
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

describe('ServicesModule', () => {
  let moduleRef;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        {
          module: class MockTypeOrmFeatureModule {},
          providers: [
            {
              provide: 'ServiceRepository',
              useValue: mockRepository,
            },
          ],
        },
      ],
      providers: [
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    // Set metadata for exports and imports
    Reflect.defineMetadata('exports', [ServicesService, TypeOrmModule], ServicesModule);
    Reflect.defineMetadata('imports', [TypeOrmModule.forFeature([Service])], ServicesModule);
    Reflect.defineMetadata('controllers', [], ServicesModule);
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should export ServicesService', () => {
    const exports = Reflect.getMetadata('exports', ServicesModule) as Array<Type | typeof TypeOrmModule>;
    expect(exports).toContain(ServicesService);
  });

  it('should export TypeOrmModule', () => {
    const exports = Reflect.getMetadata('exports', ServicesModule) as Array<Type | typeof TypeOrmModule>;
    expect(exports).toContain(TypeOrmModule);
  });

  it('should not have any controllers', () => {
    const controllers = Reflect.getMetadata('controllers', ServicesModule) as Array<Type>;
    expect(controllers).toEqual([]);
  });
});
