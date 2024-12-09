import { Test } from '@nestjs/testing';
import { BookingsModule } from './bookings.module';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { DynamicModule, ForwardReference, Type } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { EmployeesModule } from '../employees/employees.module';
import { ServicesModule } from '../services/services.module';
import { OrdersModule } from '../orders/orders.module';
import { ShopsModule } from '../shops/shops.module';
import { AuthModule } from '../auth/auth.module';

describe('BookingsModule', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const mockDataSource = {
    createQueryRunner: jest.fn(),
    options: {
      entities: [Booking],
    },
  };

  const setupTestModule = async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          entities: [Booking],
        }),
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        BookingsModule,
      ],
    })
      .overrideProvider(DataSource)
      .useValue(mockDataSource)
      .overrideModule(UsersModule)
      .useModule(class MockUsersModule {})
      .overrideModule(EmployeesModule)
      .useModule(class MockEmployeesModule {})
      .overrideModule(ServicesModule)
      .useModule(class MockServicesModule {})
      .overrideModule(OrdersModule)
      .useModule(class MockOrdersModule {})
      .overrideModule(ShopsModule)
      .useModule(class MockShopsModule {})
      .overrideModule(AuthModule)
      .useModule(class MockAuthModule {})
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
    const hasTypeOrmFeature = imports.some((item: unknown) => 
      item && typeof item === 'object' && 'module' in item && 
      (item as { module: unknown }).module === TypeOrmModule
    );
    expect(hasTypeOrmFeature).toBe(true);

    // Check forwardRef imports
    const forwardRefCount = imports.reduce((count: number, item: unknown) => {
      if (typeof item === 'function') {
        const str = item.toString();
        if (str.includes('forwardRef') && 
           (str.includes('EmployeesModule') || str.includes('OrdersModule'))) {
          return count + 1;
        }
      }
      return count;
    }, 0);
    expect(forwardRefCount).toBe(2);

    // Check regular module imports
    const moduleNames = imports
      .map((item: unknown) => {
        if (typeof item === 'function') {
          const match = item.toString().match(/forwardRef\(\(\) => (\w+)\)/);
          return match ? match[1] : item.name;
        }
        return item && typeof item === 'object' && 'name' in item ? 
          String((item as { name: unknown }).name) : null;
      })
      .filter((name): name is string => Boolean(name));

    expect(moduleNames).toContain('EmployeesModule');
    expect(moduleNames).toContain('OrdersModule');
    expect(moduleNames).toContain('ServicesModule');
    expect(moduleNames).toContain('ShopsModule');
    expect(moduleNames).toContain('AuthModule');
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
