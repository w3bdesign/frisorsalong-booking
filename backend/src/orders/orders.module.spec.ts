import { Test, TestingModule } from '@nestjs/testing';
import { OrdersModule } from './orders.module';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { DynamicModule, Type } from '@nestjs/common';
import { Repository } from 'typeorm';

interface MockOrdersService {
  findAll: jest.Mock;
  findOne: jest.Mock;
  createFromBooking: jest.Mock;
}

// Mock OrdersService
const mockOrdersService: MockOrdersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  createFromBooking: jest.fn(),
};

// Mock repository
const mockRepository: Partial<Repository<Order>> = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

// Mock EmployeesModule
jest.mock('../employees/employees.module', () => ({
  EmployeesModule: class MockEmployeesModule {
    static readonly moduleName = 'EmployeesModule';
    readonly _brand = 'EmployeesModule';
  },
}));

// Mock SharedModule
jest.mock('../shared/shared.module', () => ({
  SharedModule: class MockSharedModule {
    static readonly moduleName = 'SharedModule';
    readonly _brand = 'SharedModule';
  },
}));

describe('OrdersModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        {
          module: class MockTypeOrmModule {
            static readonly moduleName = 'TypeOrmModule';
            readonly _brand = 'TypeOrmModule';
          },
          providers: [
            {
              provide: 'OrderRepository',
              useValue: mockRepository,
            },
          ],
        },
      ],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should have correct module metadata', () => {
    const rawImports: unknown = Reflect.getMetadata('imports', OrdersModule) ?? [];
    const imports = rawImports as (Type<unknown> | DynamicModule)[];

    // Should have 3 imports: SharedModule, EmployeesModule, AuthModule
    expect(imports.length).toBe(3);

    // Get all module names
    const moduleNames = imports
      .map((item): string | null => {
        if (typeof item === "function") {
          return (item as { name: string }).name;
        }
        return null;
      })
      .filter((name): name is string => Boolean(name));

    // AuthModule is not mocked, so its name remains
    expect(moduleNames).toContain('AuthModule');
    // Verify we have 3 module imports total
    expect(moduleNames.length).toBe(3);
  });

  it('should export OrdersService', () => {
    const exports = Reflect.getMetadata('exports', OrdersModule) as unknown[];
    expect(exports).toContain(OrdersService);
  });
});
