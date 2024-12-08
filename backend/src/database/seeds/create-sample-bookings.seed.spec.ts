import { DataSource, Repository, EntityTarget } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Service } from '../../services/entities/service.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { createSampleBookings } from './create-sample-bookings.seed';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

jest.mock('bcrypt');
jest.mock('@faker-js/faker', () => ({
  faker: {
    person: {
      firstName: jest.fn().mockReturnValue('John'),
      lastName: jest.fn().mockReturnValue('Doe'),
    },
    internet: {
      email: jest.fn().mockReturnValue('john.doe@example.com'),
    },
    string: {
      numeric: jest.fn().mockReturnValue('12345678'),
    },
    helpers: {
      arrayElement: jest.fn(),
      maybe: jest.fn(),
    },
    date: {
      between: jest.fn(),
    },
    lorem: {
      sentence: jest.fn().mockReturnValue('Sample note'),
    },
  },
}));

interface RepositoryMapping {
  'User': Repository<User>;
  'Employee': Repository<Employee>;
  'Service': Repository<Service>;
  'Booking': Repository<Booking>;
}

describe('createSampleBookings', () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<User>>;
  let mockEmployeeRepository: Partial<Repository<Employee>>;
  let mockServiceRepository: Partial<Repository<Service>>;
  let mockBookingRepository: Partial<Repository<Booking>>;
  const originalEnv = process.env;
  const originalRandom = Math.random;

  beforeEach(() => {
    // Mock repositories with proper typing
    mockUserRepository = {
      save: jest.fn().mockImplementation(data => Promise.resolve({ id: 'user-1', ...data })),
    };

    mockEmployeeRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockServiceRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    mockBookingRepository = {
      save: jest.fn().mockImplementation(bookings => 
        Promise.resolve(Array.isArray(bookings) 
          ? bookings.map((b, i) => ({ id: `booking-${i}`, ...b }))
          : ({ id: 'booking-1', ...bookings }))
      ),
    };

    // Mock DataSource with proper typing
    const mockGetRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
      const repositories: RepositoryMapping = {
        'User': mockUserRepository as Repository<User>,
        'Employee': mockEmployeeRepository as Repository<Employee>,
        'Service': mockServiceRepository as Repository<Service>,
        'Booking': mockBookingRepository as Repository<Booking>,
      };

      const entityName = typeof entity === 'function' ? entity.name : 'Unknown';
      const repository = repositories[entityName as keyof RepositoryMapping];

      if (!repository) {
        throw new Error(`Repository not mocked for entity: ${entityName}`);
      }

      return repository as Repository<T>;
    };

    mockDataSource = {
      getRepository: jest.fn().mockImplementation(mockGetRepository),
    };

    // Mock bcrypt
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    // Setup test environment variables
    process.env = {
      ...originalEnv,
      EMPLOYEE_EMAIL: 'employee@example.com',
    };

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset faker mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    Math.random = originalRandom;
    jest.clearAllMocks();
  });

  it('should create sample customers and bookings when employee and services exist', async () => {
    // Mock employee
    const mockEmployee = {
      id: 'employee-1',
      user: { email: 'employee@example.com' },
    };
    (mockEmployeeRepository.findOne as jest.Mock).mockResolvedValue(mockEmployee);

    // Mock services
    const mockServices = [
      { id: 'service-1', name: 'Haircut', duration: 30, price: 30 },
      { id: 'service-2', name: 'Styling', duration: 45, price: 40 },
    ];
    (mockServiceRepository.find as jest.Mock).mockResolvedValue(mockServices);

    // Mock faker array element to return first items
    const mockArrayElement = faker.helpers.arrayElement as jest.Mock;
    mockArrayElement
      .mockReturnValueOnce(mockServices[0])  // First service
      .mockReturnValue({ id: 'customer-1' }); // Customer for subsequent calls

    // Mock date generation
    const mockDate = new Date('2024-01-01T10:00:00Z');
    (faker.date.between as jest.Mock).mockReturnValue(mockDate);

    // Mock maybe function to always return a note
    (faker.helpers.maybe as jest.Mock).mockImplementation((callback: () => string) => callback());

    await createSampleBookings(mockDataSource as DataSource);

    // Verify customers were created
    expect(mockUserRepository.save).toHaveBeenCalledTimes(10);
    expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: UserRole.CUSTOMER,
    }));

    // Verify bookings were created
    const saveBookingMock = mockBookingRepository.save as jest.Mock;
    expect(saveBookingMock).toHaveBeenCalled();
    const savedBookings = saveBookingMock.mock.calls[0][0] as Booking[];
    expect(savedBookings).toHaveLength(20);
    expect(savedBookings[0]).toEqual(expect.objectContaining({
      employee: mockEmployee,
      service: mockServices[0],
      startTime: mockDate,
      endTime: expect.any(Date),
      notes: 'Sample note',
    }));

    // Verify success message was logged
    expect(console.log).toHaveBeenCalledWith('Sample bookings created successfully');
  });

  it('should throw error when employee is not found', async () => {
    (mockEmployeeRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(createSampleBookings(mockDataSource as DataSource)).rejects.toThrow(
      'Employee not found. Please run initial data seed first.',
    );

    // Verify no bookings were created
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when no services exist', async () => {
    // Mock employee exists but no services
    const mockEmployee = {
      id: 'employee-1',
      user: { email: 'employee@example.com' },
    };
    (mockEmployeeRepository.findOne as jest.Mock).mockResolvedValue(mockEmployee);
    (mockServiceRepository.find as jest.Mock).mockResolvedValue([]);

    await expect(createSampleBookings(mockDataSource as DataSource)).rejects.toThrow(
      'No services found. Please run initial data seed first.',
    );

    // Verify no bookings were created
    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it('should create bookings with cancelled status and cancellation details', async () => {
    // Mock employee and services
    const mockEmployee = {
      id: 'employee-1',
      user: { email: 'employee@example.com' },
    };
    const mockServices = [{ id: 'service-1', duration: 30, price: 30 }];
    (mockEmployeeRepository.findOne as jest.Mock).mockResolvedValue(mockEmployee);
    (mockServiceRepository.find as jest.Mock).mockResolvedValue(mockServices);

    // Mock faker to return service and customer
    const mockArrayElement = faker.helpers.arrayElement as jest.Mock;
    mockArrayElement
      .mockReturnValueOnce(mockServices[0])  // Service
      .mockReturnValue({ id: 'customer-1' }); // Customer

    // Mock Math.random to force a cancelled booking
    Math.random = jest.fn().mockReturnValue(0.95); // This will select CANCELLED status (> 0.9)

    const mockStartDate = new Date('2024-01-01T10:00:00Z');
    const mockCancelDate = new Date('2024-01-01T09:00:00Z');
    const mockDateBetween = faker.date.between as jest.Mock;
    mockDateBetween
      .mockReturnValueOnce(mockStartDate)  // Booking start time
      .mockReturnValue(mockCancelDate);    // Cancellation time

    await createSampleBookings(mockDataSource as DataSource);

    // Verify cancelled booking was created with correct details
    const saveBookingMock = mockBookingRepository.save as jest.Mock;
    const savedBookings = saveBookingMock.mock.calls[0][0] as Booking[];
    const cancelledBooking = savedBookings.find((b: Booking) => b.status === BookingStatus.CANCELLED);
    
    expect(cancelledBooking).toBeDefined();
    if (cancelledBooking) {
      expect(cancelledBooking).toEqual(expect.objectContaining({
        status: BookingStatus.CANCELLED,
        cancelledAt: mockCancelDate,
        cancellationReason: 'Sample note',
      }));
    }
  });

  it('should handle database errors', async () => {
    const dbError = new Error('Database error');
    (mockEmployeeRepository.findOne as jest.Mock).mockRejectedValue(dbError);

    await expect(createSampleBookings(mockDataSource as DataSource)).rejects.toThrow(dbError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error creating sample bookings:', dbError);
  });

  it('should throw error when bookings save operation fails', async () => {
    // Mock employee and services
    const mockEmployee = {
      id: 'employee-1',
      user: { email: 'employee@example.com' },
    };
    const mockServices = [{ id: 'service-1', duration: 30, price: 30 }];
    (mockEmployeeRepository.findOne as jest.Mock).mockResolvedValue(mockEmployee);
    (mockServiceRepository.find as jest.Mock).mockResolvedValue(mockServices);

    // Mock bookingRepository.save to return null
    (mockBookingRepository.save as jest.Mock).mockResolvedValue(null);

    await expect(createSampleBookings(mockDataSource as DataSource)).rejects.toThrow(
      'Failed to save bookings - no bookings returned from save operation'
    );
  });
});
