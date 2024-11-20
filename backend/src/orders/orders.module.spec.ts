import { Test } from '@nestjs/testing';
import { OrdersModule } from './orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { BookingsModule } from '../bookings/bookings.module';

// Mock OrdersService
const mockOrdersService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  createFromBooking: jest.fn(),
};

// Mock repository
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
};

// Mock TypeOrmModule
const MockTypeOrmModule = {
  forFeature: jest.fn().mockReturnValue({
    module: class MockTypeOrmFeatureModule {},
  }),
};

// Mock BookingsModule
jest.mock('../bookings/bookings.module', () => ({
  BookingsModule: class MockBookingsModule {},
}));

describe('OrdersModule', () => {
  let moduleRef;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        {
          module: class MockTypeOrmFeatureModule {},
          providers: [
            {
              provide: 'OrderRepository',
              useValue: mockRepository,
            },
          ],
        },
        BookingsModule,
      ],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    // Set metadata for exports and imports
    Reflect.defineMetadata('exports', [OrdersService, TypeOrmModule], OrdersModule);
    Reflect.defineMetadata('imports', [
      TypeOrmModule.forFeature([Order]),
      BookingsModule,
    ], OrdersModule);
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should export OrdersService', () => {
    const exports = Reflect.getMetadata('exports', OrdersModule);
    expect(exports).toContain(OrdersService);
  });

  it('should export TypeOrmModule', () => {
    const exports = Reflect.getMetadata('exports', OrdersModule);
    expect(exports).toContain(TypeOrmModule);
  });

  it('should import required modules', () => {
    const imports = Reflect.getMetadata('imports', OrdersModule);
    expect(imports).toContain(BookingsModule);
  });
});
