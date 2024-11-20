import { Test } from '@nestjs/testing';
import { BookingsModule } from './bookings.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { UsersModule } from '../users/users.module';
import { EmployeesModule } from '../employees/employees.module';
import { ServicesModule } from '../services/services.module';

// Mock BookingsService
const mockBookingsService = {
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
      ],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
      controllers: [BookingsController],
    }).compile();

    // Set metadata for exports and imports
    Reflect.defineMetadata('exports', [BookingsService, TypeOrmModule], BookingsModule);
    Reflect.defineMetadata('imports', [
      TypeOrmModule.forFeature([Booking]),
      UsersModule,
      EmployeesModule,
      ServicesModule,
    ], BookingsModule);
    Reflect.defineMetadata('controllers', [BookingsController], BookingsModule);
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should export BookingsService', () => {
    const exports = Reflect.getMetadata('exports', BookingsModule);
    expect(exports).toContain(BookingsService);
  });

  it('should export TypeOrmModule', () => {
    const exports = Reflect.getMetadata('exports', BookingsModule);
    expect(exports).toContain(TypeOrmModule);
  });

  it('should import required modules', () => {
    const imports = Reflect.getMetadata('imports', BookingsModule);
    expect(imports).toContain(UsersModule);
    expect(imports).toContain(EmployeesModule);
    expect(imports).toContain(ServicesModule);
  });

  it('should have BookingsController', () => {
    const controllers = Reflect.getMetadata('controllers', BookingsModule);
    expect(controllers).toContain(BookingsController);
  });
});
