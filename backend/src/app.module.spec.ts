import { Test } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule } from '@nestjs/common';

// Mock the ConfigService
const mockConfigService = {
  get: jest.fn((key) => {
    if (key === 'cache') {
      return {
        host: 'localhost',
        port: 6379,
        ttl: 300,
      };
    }
    if (key === 'database') {
      return {
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'test',
        password: 'test',
        database: 'test',
        synchronize: false,
      };
    }
    return null;
  }),
};

// Create mock repository before using it
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock @nestjs/cache-manager first
jest.mock('@nestjs/cache-manager', () => {
  return {
    CacheModule: {
      register: jest.fn().mockReturnValue({
        module: class MockCacheModule {},
      }),
      registerAsync: jest.fn().mockReturnValue({
        module: class MockCacheModule {},
      }),
    },
  };
});

// Then mock @nestjs/typeorm
jest.mock('@nestjs/typeorm', () => {
  return {
    TypeOrmModule: {
      forRootAsync: jest.fn().mockReturnValue({
        module: class MockTypeOrmModule {},
      }),
      forFeature: jest.fn().mockReturnValue({
        module: class MockTypeOrmFeatureModule {},
      }),
    },
    getRepositoryToken: jest.fn().mockReturnValue('MockRepository'),
    InjectRepository: jest.fn().mockReturnValue(() => mockRepository),
  };
});

// Mock feature modules
jest.mock('./auth/auth.module', () => ({
  AuthModule: class MockAuthModule {},
}));

jest.mock('./users/users.module', () => ({
  UsersModule: class MockUsersModule {},
}));

jest.mock('./employees/employees.module', () => ({
  EmployeesModule: class MockEmployeesModule {},
}));

jest.mock('./services/services.module', () => ({
  ServicesModule: class MockServicesModule {},
}));

jest.mock('./bookings/bookings.module', () => ({
  BookingsModule: class MockBookingsModule {},
}));

jest.mock('./orders/orders.module', () => ({
  OrdersModule: class MockOrdersModule {},
}));

// Mock entities
jest.mock('./users/entities/user.entity', () => ({
  User: class MockUser {},
}));

jest.mock('./employees/entities/employee.entity', () => ({
  Employee: class MockEmployee {},
}));

jest.mock('./services/entities/service.entity', () => ({
  Service: class MockService {},
}));

jest.mock('./bookings/entities/booking.entity', () => ({
  Booking: class MockBooking {},
}));

jest.mock('./orders/entities/order.entity', () => ({
  Order: class MockOrder {},
}));

describe('AppModule', () => {
  let app;
  let configService;
  let typeOrmModule;
  let cacheModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(ConfigService)
    .useValue(mockConfigService)
    .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    
    configService = moduleRef.get<ConfigService>(ConfigService);
    typeOrmModule = require('@nestjs/typeorm').TypeOrmModule;
    cacheModule = require('@nestjs/cache-manager').CacheModule;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  it('should configure cache with correct default values', () => {
    const cacheConfig = configService.get('cache');
    expect(cacheConfig).toBeDefined();
    expect(cacheConfig.ttl).toBe(300);
    expect(cacheConfig.host).toBe('localhost');
    expect(cacheConfig.port).toBe(6379);
  });

  it('should configure CacheModule with register method', () => {
    expect(cacheModule.register).toHaveBeenCalledWith({
      isGlobal: true,
      ttl: 300,
    });
  });

  it('should configure TypeOrmModule with correct database settings', () => {
    const dbConfig = configService.get('database');
    expect(typeOrmModule.forRootAsync).toHaveBeenCalled();
    
    // Get the factory function from the forRootAsync call
    const options = typeOrmModule.forRootAsync.mock.calls[0][0] as TypeOrmModuleAsyncOptions;
    const factoryFn = options.useFactory;
    
    // Execute the factory function with our mocked ConfigService
    const config = factoryFn(mockConfigService);
    
    // Verify the configuration matches what's in app.module.ts
    expect(config).toEqual({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'test',
      password: 'test',
      database: 'test',
      synchronize: false,
    });
  });

  it('should configure TypeOrmModule with correct injection', () => {
    expect(typeOrmModule.forRootAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        imports: [ConfigModule],
        inject: [ConfigService],
      })
    );
  });
});
