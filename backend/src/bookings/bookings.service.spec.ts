import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingsService } from './bookings.service';
import { Booking, BookingStatus } from './entities/booking.entity';
import { UsersService } from '../users/users.service';
import { EmployeesService } from '../employees/employees.service';
import { ServicesService } from '../services/services.service';
import { OrdersService } from '../orders/orders.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateWalkInBookingDto } from './dto/create-walk-in-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';

describe('BookingsService', () => {
  let service: BookingsService;
  let bookingRepository: Repository<Booking>;
  let usersService: UsersService;
  let employeesService: EmployeesService;
  let servicesService: ServicesService;
  let ordersService: OrdersService;

  const mockBookingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockEmployeesService = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    isAvailable: jest.fn(),
  };

  const mockServicesService = {
    findOne: jest.fn(),
  };

  const mockOrdersService = {
    create: jest.fn(),
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
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    usersService = module.get<UsersService>(UsersService);
    employeesService = module.get<EmployeesService>(EmployeesService);
    servicesService = module.get<ServicesService>(ServicesService);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWalkIn', () => {
    const mockShop = {
      id: 'shop1',
      code: 'SHOP1',
      shopName: 'Test Shop',
      isActive: true,
      dailyBookingLimit: 100,
      lastBookingTime: new Date(),
      todayBookingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const mockService = { id: 'service1', duration: 30, price: 50 };
    const mockEmployee = { id: 'emp1', isActive: true };
    const mockCustomer = { id: 'cust1' };
    const createWalkInDto: CreateWalkInBookingDto = {
      serviceId: 'service1',
      firstName: 'John',
      phoneNumber: '1234567890',
      isPaid: true,
    };

    it('should create a walk-in booking successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockCustomer);
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.findAll.mockResolvedValue([mockEmployee]);
      mockBookingRepository.find.mockResolvedValue([]);
      mockBookingRepository.create.mockReturnValue({});
      mockBookingRepository.save.mockResolvedValue({ id: 'booking1' });

      const result = await service.createWalkIn(createWalkInDto, mockShop);

      expect(result).toBeDefined();
      expect(mockUsersService.create).toHaveBeenCalled();
      expect(mockServicesService.findOne).toHaveBeenCalledWith(createWalkInDto.serviceId);
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when service not found', async () => {
      mockServicesService.findOne.mockResolvedValue(null);

      await expect(service.createWalkIn(createWalkInDto, mockShop))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw BadRequestException when no active employees', async () => {
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.findAll.mockResolvedValue([]);

      await expect(service.createWalkIn(createWalkInDto, mockShop))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    const mockCustomer = { id: 'cust1' };
    const mockEmployee = { id: 'emp1' };
    const mockService = { id: 'service1', duration: 30, price: 50 };
    const createBookingDto: CreateBookingDto = {
      customerId: 'cust1',
      employeeId: 'emp1',
      serviceId: 'service1',
      startTime: new Date().toISOString(),
      notes: 'Test booking',
    };

    it('should create a booking successfully', async () => {
      mockUsersService.findOne.mockResolvedValue(mockCustomer);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.isAvailable.mockResolvedValue(true);
      mockBookingRepository.create.mockReturnValue({});
      mockBookingRepository.save.mockResolvedValue({ id: 'booking1' });

      const result = await service.create(createBookingDto);

      expect(result).toBeDefined();
      expect(mockUsersService.findOne).toHaveBeenCalledWith(createBookingDto.customerId);
      expect(mockEmployeesService.findOne).toHaveBeenCalledWith(createBookingDto.employeeId);
      expect(mockServicesService.findOne).toHaveBeenCalledWith(createBookingDto.serviceId);
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.create(createBookingDto))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw BadRequestException when employee not available', async () => {
      mockUsersService.findOne.mockResolvedValue(mockCustomer);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.isAvailable.mockResolvedValue(false);

      await expect(service.create(createBookingDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return a booking when found', async () => {
      const mockBooking = { id: 'booking1' };
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOne('booking1');

      expect(result).toBe(mockBooking);
      expect(mockBookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'booking1' },
        relations: ['customer', 'employee', 'employee.user', 'service'],
      });
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('booking1'))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const mockBooking = {
      id: 'booking1',
      service: { id: 'service1' },
      employee: { id: 'emp1' },
    };
    const updateDto: UpdateBookingDto = {
      startTime: new Date().toISOString(),
    };

    it('should update booking successfully', async () => {
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockServicesService.findOne.mockResolvedValue({ duration: 30 });
      mockEmployeesService.isAvailable.mockResolvedValue(true);
      mockBookingRepository.save.mockResolvedValue({ ...mockBooking, ...updateDto });

      const result = await service.update('booking1', updateDto);

      expect(result).toBeDefined();
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when employee not available for new time', async () => {
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockServicesService.findOne.mockResolvedValue({ duration: 30 });
      mockEmployeesService.isAvailable.mockResolvedValue(false);

      await expect(service.update('booking1', updateDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel booking successfully', async () => {
      const mockBooking = { id: 'booking1' };
      const reason = 'Test reason';
      const expectedSavedBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELLED,
        cancelledAt: expect.any(Date),
        cancellationReason: reason,
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockImplementation(booking => Promise.resolve(booking));

      const result = await service.cancel('booking1', reason);

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(result.cancellationReason).toBe(reason);
      expect(mockBookingRepository.save).toHaveBeenCalledWith(expectedSavedBooking);
    });
  });

  describe('findUpcoming', () => {
    it('should return upcoming bookings', async () => {
      const mockBookings = [{ id: 'booking1' }, { id: 'booking2' }];
      mockBookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.findUpcoming();

      expect(result).toEqual(mockBookings);
      expect(mockBookingRepository.find).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.any(Object),
        relations: ['customer', 'employee', 'employee.user', 'service'],
        order: { startTime: 'ASC' },
      }));
    });
  });

  describe('getUpcomingCount', () => {
    it('should return upcoming count and customers', async () => {
      const mockBookings = [
        { 
          id: 'booking1',
          customer: { firstName: 'John' },
          service: { duration: 30 },
        },
        {
          id: 'booking2',
          customer: { firstName: 'Jane' },
          service: { duration: 45 },
        },
      ];
      mockBookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.getUpcomingCount();

      expect(result.count).toBe(2);
      expect(result.customers).toHaveLength(2);
      expect(result.customers[1].estimatedWaitingTime).toBe(30); // First booking's duration
    });
  });
});
