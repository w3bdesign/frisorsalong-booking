import { DataSource, Repository, EntityTarget } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Service } from '../../services/entities/service.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';
import { createSampleBookings } from './create-sample-bookings.seed';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

jest.mock("bcrypt");
jest.mock("@faker-js/faker", () => ({
  faker: {
    person: {
      firstName: jest.fn().mockReturnValue("John"),
      lastName: jest.fn().mockReturnValue("Doe"),
    },
    internet: {
      email: jest.fn().mockReturnValue("john.doe@example.com"),
    },
    string: {
      numeric: jest.fn().mockReturnValue("12345678"),
    },
    helpers: {
      arrayElement: jest.fn(),
      maybe: jest.fn(),
    },
    date: {
      between: jest.fn(),
    },
    lorem: {
      sentence: jest.fn().mockReturnValue("Sample note"),
    },
  },
}));

type SupportedEntity = User | Employee | Service | Booking;

interface RepositoryMapping {
  User: Repository<User>;
  Employee: Repository<Employee>;
  Service: Repository<Service>;
  Booking: Repository<Booking>;
}

describe("createSampleBookings", () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<User>>;
  let mockEmployeeRepository: Partial<Repository<Employee>>;
  let mockServiceRepository: Partial<Repository<Service>>;
  let mockBookingRepository: Partial<Repository<Booking>>;
  const originalEnv = process.env;
  const originalRandom = Math.random;

  beforeEach(() => {
    mockUserRepository = {
      save: jest.fn().mockImplementation((data: Partial<User>): Promise<User> =>
        Promise.resolve({ id: "user-1", ...data } as User)
      ),
    };

    mockEmployeeRepository = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    mockServiceRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    mockBookingRepository = {
      save: jest.fn().mockImplementation((bookings: Partial<Booking> | Partial<Booking>[]): Promise<Booking | Booking[]> =>
        Promise.resolve(
          Array.isArray(bookings)
            ? bookings.map((b, i) => ({ id: `booking-${i}`, ...b } as Booking))
            : { id: "booking-1", ...bookings } as Booking
        )
      ),
    };

    const repositories: RepositoryMapping = {
      User: mockUserRepository as Repository<User>,
      Employee: mockEmployeeRepository as Repository<Employee>,
      Service: mockServiceRepository as Repository<Service>,
      Booking: mockBookingRepository as Repository<Booking>,
    };

    const mockGetRepository = <T extends SupportedEntity>(entity: EntityTarget<T>): Repository<T> => {
      const entityName = typeof entity === "function" ? entity.name : "Unknown";
      const repository = repositories[entityName as keyof RepositoryMapping];

      if (!repository) {
        throw new Error(`Repository not mocked for entity: ${entityName}`);
      }

      return repository as Repository<T>;
    };

    mockDataSource = {
      getRepository: jest.fn().mockImplementation(mockGetRepository),
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");

    process.env = {
      ...originalEnv,
      EMPLOYEE_EMAIL: "employee@example.com",
    };

    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});

    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
    Math.random = originalRandom;
    jest.clearAllMocks();
  });

  it("should create sample customers and bookings when employee and services exist", async () => {
    const mockEmployee = {
      id: "employee-1",
      user: { email: "employee@example.com" },
    };
    (mockEmployeeRepository.findOne as jest.Mock).mockResolvedValue(mockEmployee);

    const mockServices = [
      { id: "service-1", name: "Haircut", duration: 30, price: 30 },
      { id: "service-2", name: "Styling", duration: 45, price: 40 },
    ];
    (mockServiceRepository.find as jest.Mock).mockResolvedValue(mockServices);

    const mockArrayElement = faker.helpers.arrayElement as jest.Mock;
    mockArrayElement
      .mockReturnValueOnce(mockServices[0])
      .mockReturnValue({ id: "customer-1" });

    const mockDate = new Date("2024-01-01T10:00:00Z");
    (faker.date.between as jest.Mock).mockReturnValue(mockDate);

    (faker.helpers.maybe as jest.Mock).mockImplementation(
      (callback: () => string) => callback()
    );

    await createSampleBookings(mockDataSource as DataSource);

    const saveBookingMock = mockBookingRepository.save as jest.Mock;
    const mockCalls = saveBookingMock.mock.calls as [Booking[]][];

    if (!Array.isArray(mockCalls) || mockCalls.length === 0) {
      throw new Error("Expected at least one booking save call");
    }

    const savedBookings = mockCalls[0][0];
    if (!Array.isArray(savedBookings)) {
      throw new Error("Expected an array of bookings");
    }

    expect(savedBookings).toHaveLength(20);
    expect(savedBookings[0]).toEqual(
      expect.objectContaining({
        employee: mockEmployee,
        service: mockServices[0],
        startTime: mockDate,
        endTime: expect.any(Date),
        notes: "Sample note",
      })
    );

    expect(console.log).toHaveBeenCalledWith("Sample bookings created successfully");
  });

  it("should throw error when employee is not found", async () => {
    (mockEmployeeRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(createSampleBookings(mockDataSource as DataSource)).rejects.toThrow(
      "Employee not found. Please run initial data seed first."
    );

    expect(mockBookingRepository.save).not.toHaveBeenCalled();
  });

  it("should create bookings with cancelled status and cancellation details", async () => {
    const mockEmployee = {
      id: "employee-1",
      user: { email: "employee@example.com" },
    };
    const mockServices = [{ id: "service-1", duration: 30, price: 30 }];
    (mockEmployeeRepository.findOne as jest.Mock).mockResolvedValue(mockEmployee);
    (mockServiceRepository.find as jest.Mock).mockResolvedValue(mockServices);

    const mockArrayElement = faker.helpers.arrayElement as jest.Mock;
    mockArrayElement
      .mockReturnValueOnce(mockServices[0])
      .mockReturnValue({ id: "customer-1" });

    Math.random = jest.fn().mockReturnValue(0.95);

    const mockStartDate = new Date("2024-01-01T10:00:00Z");
    const mockCancelDate = new Date("2024-01-01T09:00:00Z");
    const mockDateBetween = faker.date.between as jest.Mock;
    mockDateBetween
      .mockReturnValueOnce(mockStartDate)
      .mockReturnValue(mockCancelDate);

    await createSampleBookings(mockDataSource as DataSource);

    const saveBookingMock = mockBookingRepository.save as jest.Mock;
    const mockCalls = saveBookingMock.mock.calls as [Booking[]][];

    if (!Array.isArray(mockCalls) || mockCalls.length === 0) {
      throw new Error("Expected at least one booking save call");
    }

    const savedBookings = mockCalls[0][0];
    if (!Array.isArray(savedBookings)) {
      throw new Error("Expected an array of bookings");
    }

    const cancelledBooking = savedBookings.find(
      (b) => b.status === BookingStatus.CANCELLED
    );

    expect(cancelledBooking).toBeDefined();
    if (cancelledBooking) {
      expect(cancelledBooking).toEqual(
        expect.objectContaining({
          status: BookingStatus.CANCELLED,
          cancelledAt: mockCancelDate,
          cancellationReason: "Sample note",
        })
      );
    }
  });
});
