import { Test, TestingModule } from '@nestjs/testing';
import { OrdersModule } from './orders.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { BookingsModule } from '../bookings/bookings.module';
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

// Mock BookingsModule
jest.mock('../bookings/bookings.module', () => ({
  BookingsModule: class MockBookingsModule {},
}));

describe('OrdersModule', () => {
  let moduleRef: TestingModule;

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
    const exports = Reflect.getMetadata('exports', OrdersModule) as Array<unknown>;
    expect(exports).toContain(OrdersService);
  });

  it('should export TypeOrmModule', () => {
    const exports = Reflect.getMetadata('exports', OrdersModule) as Array<unknown>;
    expect(exports).toContain(TypeOrmModule);
  });

  it('should import required modules', () => {
    const imports = Reflect.getMetadata('imports', OrdersModule) as Array<unknown>;
    expect(imports).toContain(BookingsModule);
  });
});
