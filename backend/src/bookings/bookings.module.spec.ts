import { Test } from '@nestjs/testing';
import { BookingsModule } from './bookings.module';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { DynamicModule, ForwardReference, Module, Type } from '@nestjs/common';

describe('BookingsModule', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn(),
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'JWT_SECRET':
          return 'test-secret';
        case 'JWT_EXPIRATION':
          return '1h';
        default:
          return null;
      }
    }),
  };

  const setupTestModule = async () => {
    const module = await Test.createTestingModule({
      imports: [
        {
          module: class MockTypeOrmModule {},
          providers: [
            {
              provide: getRepositoryToken(Booking),
              useValue: mockRepository,
            },
            {
              provide: DataSource,
              useValue: mockDataSource,
            },
          ],
          exports: [getRepositoryToken(Booking)],
        },
        BookingsModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .overrideProvider(getRepositoryToken(Booking))
      .useValue(mockRepository)
      .compile();

    return module;
  };

  it('should compile the module', async () => {
    const module = await setupTestModule();
    expect(module).toBeDefined();
  });

  it('should register providers and controllers', async () => {
    const module = await setupTestModule();
    expect(module.get(BookingsService)).toBeDefined();
    expect(module.get(BookingsController)).toBeDefined();
  });

  it('should have correct module metadata', () => {
    const imports = Reflect.getMetadata('imports', BookingsModule);
    
    // Check TypeOrmModule.forFeature
    const hasTypeOrmFeature = imports.some((item: unknown) => {
      if (item && typeof item === 'object' && 'module' in item) {
        return (item as { module: unknown }).module === TypeOrmModule;
      }
      return false;
    });
    expect(hasTypeOrmFeature).toBe(true);

    // Check forwardRef imports
    const forwardRefImports = imports.filter((item: unknown) => {
      if (!item || typeof item !== 'function') return false;
      const fnStr = item.toString().replace(/\s+/g, '');
      return fnStr.includes('forwardRef') && (
        fnStr.includes('EmployeesModule') || 
        fnStr.includes('OrdersModule')
      );
    });

    expect(forwardRefImports).toHaveLength(2);
    const forwardRefStrings = forwardRefImports.map(fn => 
      fn.toString().replace(/\s+/g, '')
    );
    expect(forwardRefStrings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('EmployeesModule'),
        expect.stringContaining('OrdersModule')
      ])
    );

    // Check regular module imports
    const moduleNames = imports
      .map((item: unknown) => {
        if (typeof item === 'function') {
          const fnStr = item.toString().replace(/\s+/g, '');
          if (fnStr.includes('forwardRef')) {
            const match = fnStr.match(/\(\)\s*=>\s*(\w+)/);
            return match ? match[1] : null;
          }
          return item.name;
        }
        if (item && typeof item === 'object' && 'name' in item) {
          return String((item as { name: unknown }).name);
        }
        return null;
      })
      .filter((name): name is string => Boolean(name));

    expect(moduleNames).toContain('ServicesModule');
    expect(moduleNames).toContain('ShopsModule');
    expect(moduleNames).toContain('AuthModule');
    expect(moduleNames).toContain('EmployeesModule');
    expect(moduleNames).toContain('OrdersModule');
  });

  it('should export BookingsService and TypeOrmModule', () => {
    const exports = Reflect.getMetadata('exports', BookingsModule);
    expect(exports).toContain(BookingsService);
    
    const hasTypeOrmExport = exports.some((exp: unknown) => 
      exp === TypeOrmModule || 
      (exp && typeof exp === 'object' && 'module' in exp && 
       (exp as { module: unknown }).module === TypeOrmModule)
    );
    expect(hasTypeOrmExport).toBe(true);
  });
});
