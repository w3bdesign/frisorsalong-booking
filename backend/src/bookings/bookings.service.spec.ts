import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { UsersService } from '../users/users.service';
import { EmployeesService } from '../employees/employees.service';
import { ServicesService } from '../services/services.service';
import { OrdersService } from '../orders/orders.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { Employee } from '../employees/entities/employee.entity';
import { Service } from '../services/entities/service.entity';
import { ShopCode } from '../shops/entities/shop-code.entity';

type MockType<T> = {
  [P in keyof T]?: jest.Mock;
};

describe('BookingsService', () => {
  let service: BookingsService;
  let usersService: MockType<UsersService>;
  let employeesService: MockType<EmployeesService>;
  let servicesService: MockType<ServicesService>;
  let bookingRepository: MockType<Repository<Booking>>;

  const mockBookingRepository: MockType<Repository<Booking>> = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUsersService: MockType<UsersService> = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEmployeesService: MockType<EmployeesService> = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    isAvailable: jest.fn(),
  };

  const mockServicesService: MockType<ServicesService> = {
    findOne: jest.fn(),
  };

  const mockOrdersService: MockType<OrdersService> = {
    createFromBooking: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingRepository = module.get(getRepositoryToken(Booking));
    usersService = module.get(UsersService);
    employeesService = module.get(EmployeesService);
    servicesService = module.get(ServicesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWalkIn', () => {
    const mockShop: ShopCode = {
      id: 'shop-1',
      code: 'SHOP1',
      shopName: 'Test Shop',
      isActive: true,
      dailyBookingLimit: 100,
      lastBookingTime: new Date(),
      todayBookingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockEmployee: Employee = {
      id: 'emp-1',
      user: new User(),
      isActive: true,
      specializations: ['haircut', 'coloring'],
      availability: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }],
      },
      services: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockService: Service = {
      id: 'service-1',
      name: 'Test Service',
      description: 'Test Description',
      price: 100,
      duration: 60,
      isActive: true,
      employees: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a walk-in booking successfully', async () => {
      const createWalkInDto = {
        serviceId: 'service-1',
        firstName: 'John',
        phoneNumber: '1234567890',
        isPaid: true,
      };

      const mockUser = {
        id: 'user-1',
        email: `walkin_${Date.now()}@temp.com`,
        firstName: createWalkInDto.firstName,
        lastName: 'Walk-in',
        phoneNumber: createWalkInDto.phoneNumber,
        role: UserRole.CUSTOMER,
      };

      mockUsersService.create?.mockResolvedValue(mockUser);
      mockServicesService.findOne?.mockResolvedValue(mockService);
      mockEmployeesService.findAll?.mockResolvedValue([mockEmployee]);
      mockBookingRepository.find?.mockResolvedValue([]);
      mockBookingRepository.create?.mockReturnValue({
        id: 'booking-1',
        customer: mockUser,
        employee: mockEmployee,
        service: mockService,
        startTime: expect.any(Date),
        endTime: expect.any(Date),
        status: BookingStatus.CONFIRMED,
      });
      mockBookingRepository.save?.mockImplementation((booking) => Promise.resolve(booking));

      const result = await service.createWalkIn(createWalkInDto, mockShop);

      expect(result).toBeDefined();
      expect(result.status).toBe(BookingStatus.CONFIRMED);
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockServicesService.findOne).toHaveBeenCalled();
      expect(mockEmployeesService.findAll).toHaveBeenCalled();
      expect(mockBookingRepository.create).toHaveBeenCalled();
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when service is not found', async () => {
      const createWalkInDto = {
        serviceId: 'non-existent-service',
        firstName: 'John',
        phoneNumber: '1234567890',
        isPaid: true,
      };

      mockServicesService.findOne?.mockResolvedValue(null);

      await expect(service.createWalkIn(createWalkInDto, mockShop))
        .rejects.toThrow(new NotFoundException('Service not found'));
    });

    it('should throw BadRequestException when no employees are available', async () => {
      const createWalkInDto = {
        serviceId: 'service-1',
        firstName: 'John',
        phoneNumber: '1234567890',
        isPaid: true,
      };

      mockServicesService.findOne?.mockResolvedValue(mockService);
      mockEmployeesService.findAll?.mockResolvedValue([]);

      await expect(service.createWalkIn(createWalkInDto, mockShop))
        .rejects.toThrow(new BadRequestException('No employees available'));
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when booking is not found', async () => {
      const bookingId = 'non-existent-id';
      mockBookingRepository.findOne?.mockResolvedValue(null);

      await expect(service.findOne(bookingId))
        .rejects.toThrow(new NotFoundException(`Booking with ID ${bookingId} not found`));

      expect(mockBookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookingId },
        relations: ['customer', 'employee', 'employee.user', 'service'],
      });
    });
  });
});
