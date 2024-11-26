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
  let bookingsService;
  let ordersService;

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

    bookingsService = moduleRef.get(BookingsService);
    ordersService = moduleRef.get(OrdersService);
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should have required dependencies', () => {
    expect(bookingsService).toBeDefined();
    expect(ordersService).toBeDefined();
  });

  it('should have BookingsController', () => {
    const controller = moduleRef.get(BookingsController);
    expect(controller).toBeDefined();
  });

  it('should export BookingsService', () => {
    const exports = Reflect.getMetadata('exports', BookingsModule);
    expect(exports).toContain(BookingsService);
  });
});
