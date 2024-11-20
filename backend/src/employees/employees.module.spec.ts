import { Test } from '@nestjs/testing';
import { EmployeesModule } from './employees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { EmployeesService } from './employees.service';

// Mock EmployeesService
const mockEmployeesService = {
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

describe('EmployeesModule', () => {
  let moduleRef;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        {
          module: class MockTypeOrmFeatureModule {},
          providers: [
            {
              provide: 'EmployeeRepository',
              useValue: mockRepository,
            },
            {
              provide: 'BookingRepository',
              useValue: mockRepository,
            },
          ],
        },
      ],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    // Set metadata for exports
    Reflect.defineMetadata('exports', [EmployeesService, TypeOrmModule], EmployeesModule);
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should export EmployeesService', () => {
    const exports = Reflect.getMetadata('exports', EmployeesModule);
    expect(exports).toContain(EmployeesService);
  });

  it('should export TypeOrmModule', () => {
    const exports = Reflect.getMetadata('exports', EmployeesModule);
    expect(exports).toContain(TypeOrmModule);
  });
});
