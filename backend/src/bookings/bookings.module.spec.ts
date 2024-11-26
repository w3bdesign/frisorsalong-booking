import { Test } from '@nestjs/testing';
import { BookingsModule } from './bookings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { UsersModule } from '../users/users.module';
import { EmployeesModule } from '../employees/employees.module';
import { ServicesModule } from '../services/services.module';
import { OrdersModule } from '../orders/orders.module';
import { OrdersService } from '../orders/orders.service';
import { forwardRef } from '@nestjs/common';

// Mock BookingsService
const mockBookingsService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

// Mock OrdersService
const mockOrdersService = {
  createFromBooking: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
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

// Mock feature modules
jest.mock('../users/users.module', () => ({
  UsersModule: class MockUsersModule {},
}));

jest.mock('../employees/employees.module', () => ({
  EmployeesModule: class MockEmployeesModule {},
}));

jest.mock('../services/services.module', () => ({
  ServicesModule: class MockServicesModule {},
}));

jest.mock('../orders/orders.module', () => ({
  OrdersModule: class MockOrdersModule {},
}));

describe('BookingsModule', () => {
  let moduleRef;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        {
          module: class MockTypeOrmFeatureModule {},
          providers: [
            {
              provide: 'BookingRepository',
              useValue: mockRepository,
            },
          ],
        },
        UsersModule,
        EmployeesModule,
        ServicesModule,
        forwardRef(() => OrdersModule),
      ],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
      controllers: [BookingsController],
    }).compile();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should export BookingsService', () => {
    const exports = Reflect.getMetadata('exports', BookingsModule);
    expect(exports).toContain(BookingsService);
  });

  it('should have required dependencies', () => {
    // Get the module metadata directly from the BookingsModule class
    const metadata = Reflect.getMetadata('imports', BookingsModule);
    
    // Check for basic modules
    expect(metadata).toEqual(
      expect.arrayContaining([
        UsersModule,
        EmployeesModule,
        ServicesModule,
      ])
    );
    
    // Check for forwardRef(() => OrdersModule)
    const hasOrdersModule = metadata.some(imp => 
      typeof imp === 'function' && 
      imp.toString().includes('forwardRef')
    );
    expect(hasOrdersModule).toBeTruthy();
  });

  it('should have BookingsController', () => {
    const controllers = Reflect.getMetadata('controllers', BookingsModule);
    expect(controllers).toContain(BookingsController);
  });
});
