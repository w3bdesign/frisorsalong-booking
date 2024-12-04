import { Test, TestingModule } from '@nestjs/testing';
import { BookingsService } from './bookings.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository,  In  } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { UsersService } from '../users/users.service';
import { EmployeesService } from '../employees/employees.service';
import { ServicesService } from '../services/services.service';
import { OrdersService } from '../orders/orders.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateWalkInBookingDto } from './dto/create-walk-in-booking.dto';
import { UserRole } from '../users/entities/user.entity';
import { ShopCode } from '../shops/entities/shop-code.entity';

describe('BookingsService', () => {
  let service: BookingsService;


  const mockBookingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
    create: jest.fn(),
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
    const createWalkInDto: CreateWalkInBookingDto = {
      serviceId: 'service-id',
      firstName: 'John',
      phoneNumber: '1234567890',
      isPaid: true,
    };

    const mockShop: ShopCode = {
      id: 'shop-id',
      code: 'SHOP1',
      shopName: 'Test Shop',
      isActive: true,
      dailyBookingLimit: 100,
      lastBookingTime: new Date(),
      todayBookingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockService = { id: 'service-id', duration: 60, price: 100 };
    const mockEmployee = { id: 'employee-id', isActive: true };
    const mockCustomer = { 
      id: 'customer-id',
      firstName: 'John',
      lastName: 'Walk-in',
      email: expect.stringMatching(/^walkin_\d+@temp.com$/),
      phoneNumber: '1234567890',
      role: UserRole.CUSTOMER
    };

    it('should create a walk-in booking successfully', async () => {
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.findAll.mockResolvedValue([mockEmployee]);
      mockUsersService.create.mockResolvedValue(mockCustomer);
      mockBookingRepository.find.mockResolvedValue([]); // No existing bookings
      mockBookingRepository.create.mockReturnValue({ id: 'booking-id' });
      mockBookingRepository.save.mockResolvedValue({ id: 'booking-id' });

      const result = await service.createWalkIn(createWalkInDto, mockShop);

      expect(result).toHaveProperty('id', 'booking-id');
      expect(mockUsersService.create).toHaveBeenCalledWith(expect.objectContaining({
        firstName: 'John',
        lastName: 'Walk-in',
        phoneNumber: '1234567890',
        role: UserRole.CUSTOMER
      }));
    });

    it('should throw NotFoundException when service not found', async () => {
      mockServicesService.findOne.mockResolvedValue(null);

      await expect(service.createWalkIn(createWalkInDto, mockShop))
        .rejects.toThrow(new NotFoundException('Service not found'));
    });

    it('should throw BadRequestException when no active employees available', async () => {
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.findAll.mockResolvedValue([{ ...mockEmployee, isActive: false }]);

      await expect(service.createWalkIn(createWalkInDto, mockShop))
        .rejects.toThrow(new BadRequestException('No employees available'));
    });

    it('should assign booking to employee with least pending bookings', async () => {
      const mockEmployees = [
        { id: 'emp1', isActive: true },
        { id: 'emp2', isActive: true }
      ];
      
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.findAll.mockResolvedValue(mockEmployees);
      mockUsersService.create.mockResolvedValue(mockCustomer);
      
      // Mock emp1 having 2 bookings and emp2 having 1 booking
      mockBookingRepository.find
        .mockResolvedValueOnce([{}, {}]) // emp1's bookings
        .mockResolvedValueOnce([{}]); // emp2's bookings
      
      mockBookingRepository.create.mockReturnValue({ id: 'booking-id' });
      mockBookingRepository.save.mockResolvedValue({ id: 'booking-id' });

      await service.createWalkIn(createWalkInDto, mockShop);

      // Verify the booking was created with emp2 (who had fewer bookings)
      expect(mockBookingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          employee: mockEmployees[1]
        })
      );
    });
  });

  describe('create', () => {
    const createBookingDto: CreateBookingDto = {
      customerId: 'customer-id',
      employeeId: 'employee-id',
      serviceId: 'service-id',
      startTime: new Date().toISOString(),
      notes: 'Test booking',
    };

    const mockCustomer = { id: 'customer-id' };
    const mockEmployee = { id: 'employee-id' };
    const mockService = { id: 'service-id', duration: 60, price: 100 };

    it('should create a booking successfully', async () => {
      mockUsersService.findOne.mockResolvedValue(mockCustomer);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.isAvailable.mockResolvedValue(true);
      mockBookingRepository.create.mockReturnValue({ id: 'booking-id' });
      mockBookingRepository.save.mockResolvedValue({ id: 'booking-id' });

      const result = await service.create(createBookingDto);
      expect(result).toEqual({ id: 'booking-id' });
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        new NotFoundException('Customer not found'),
      );
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockUsersService.findOne.mockResolvedValue(mockCustomer);
      mockEmployeesService.findOne.mockResolvedValue(null);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        new NotFoundException('Employee not found'),
      );
    });

    it('should throw NotFoundException when service not found', async () => {
      mockUsersService.findOne.mockResolvedValue(mockCustomer);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockServicesService.findOne.mockResolvedValue(null);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        new NotFoundException('Service not found'),
      );
    });

    it('should throw BadRequestException when employee is not available', async () => {
      mockUsersService.findOne.mockResolvedValue(mockCustomer);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.isAvailable.mockResolvedValue(false);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        new BadRequestException('Employee is not available at this time'),
      );
    });
  });

  describe('findOne', () => {
    const mockBooking = {
      id: 'booking-id',
      customer: { id: 'customer-id' },
      employee: { id: 'employee-id', user: { id: 'user-id' } },
      service: { id: 'service-id' },
    };

    it('should return a booking when it exists', async () => {
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOne('booking-id');
      expect(result).toEqual(mockBooking);
      expect(mockBookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'booking-id' },
        relations: ['customer', 'employee', 'employee.user', 'service'],
      });
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        new NotFoundException('Booking with ID non-existent-id not found'),
      );
    });
  });

  describe('update', () => {
    const mockBooking = {
      id: 'booking-id',
      customer: { id: 'customer-id' },
      employee: { id: 'employee-id' },
      service: { id: 'service-id', duration: 60 },
      startTime: new Date(),
      endTime: new Date(),
    };

    const updateBookingDto: UpdateBookingDto = {
      startTime: new Date().toISOString(),
    };

    it('should update booking with new start time successfully', async () => {
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockServicesService.findOne.mockResolvedValue({ id: 'service-id', duration: 60 });
      mockEmployeesService.isAvailable.mockResolvedValue(true);
      mockBookingRepository.save.mockResolvedValue({ ...mockBooking, ...updateBookingDto });

      const result = await service.update('booking-id', updateBookingDto);
      expect(result).toBeDefined();
      expect(mockEmployeesService.isAvailable).toHaveBeenCalled();
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when employee is not available for new time', async () => {
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockServicesService.findOne.mockResolvedValue({ id: 'service-id', duration: 60 });
      mockEmployeesService.isAvailable.mockResolvedValue(false);

      await expect(service.update('booking-id', updateBookingDto)).rejects.toThrow(
        new BadRequestException('Employee is not available at this time'),
      );
    });
  });

  describe('cancel', () => {
    const mockBooking = {
      id: 'booking-id',
      status: BookingStatus.PENDING,
    };

    it('should cancel a booking successfully', async () => {
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockImplementation((booking) => Promise.resolve(booking));

      const result = await service.cancel('booking-id', 'Test cancellation');
      
      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(result.cancellationReason).toBe('Test cancellation');
      expect(result.cancelledAt).toBeDefined();
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel('non-existent-id', 'reason')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCustomer', () => {
    const mockBookings = [
      { id: 'booking-1', customer: { id: 'customer-id' } },
      { id: 'booking-2', customer: { id: 'customer-id' } },
    ];

    it('should return all bookings for a customer', async () => {
      mockBookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.findByCustomer('customer-id');
      
      expect(result).toEqual(mockBookings);
      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        where: { customer: { id: 'customer-id' } },
        relations: ['customer', 'employee', 'employee.user', 'service'],
        order: { startTime: 'DESC' },
      });
    });
  });

  describe('findByEmployee', () => {
    const mockBookings = [
      { id: 'booking-1', employee: { id: 'employee-id' } },
      { id: 'booking-2', employee: { id: 'employee-id' } },
    ];

    it('should return all bookings for an employee', async () => {
      mockBookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.findByEmployee('employee-id');
      
      expect(result).toEqual(mockBookings);
      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        where: { employee: { id: 'employee-id' } },
        relations: ['customer', 'employee', 'employee.user', 'service'],
        order: { startTime: 'DESC' },
      });
    });
  });

  describe('findUpcoming', () => {
    const mockBookings = [
      { id: 'booking-1', startTime: new Date(), status: BookingStatus.PENDING },
      { id: 'booking-2', startTime: new Date(), status: BookingStatus.CONFIRMED },
    ];

    it('should return upcoming bookings', async () => {
      mockBookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.findUpcoming();
      
      expect(result).toEqual(mockBookings);
      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        where: {
          startTime: expect.any(Object),
          status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        },
        relations: ['customer', 'employee', 'employee.user', 'service'],
        order: { startTime: 'ASC' },
      });
    });

    it('should handle no upcoming bookings and log debug info', async () => {
      const allBookings = [
        { 
          id: 'past-booking',
          startTime: new Date('2023-01-01'),
          status: BookingStatus.COMPLETED
        }
      ];
      
      mockBookingRepository.find
        .mockResolvedValueOnce([]) // First call for upcoming bookings
        .mockResolvedValueOnce(allBookings); // Second call for all bookings (debug)

      const result = await service.findUpcoming();
      
      expect(result).toEqual([]);
      expect(mockBookingRepository.find).toHaveBeenCalledTimes(2);
    });
  });

  describe('getUpcomingCount', () => {
    it('should return count and customer details of upcoming bookings', async () => {
      const mockBookings = [
        {
          customer: { firstName: 'John' },
          service: { duration: 30 }
        },
        {
          customer: { firstName: 'Jane' },
          service: { duration: 45 }
        }
      ];

      mockBookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.getUpcomingCount();
      
      expect(result).toEqual({
        count: 2,
        customers: [
          { firstName: 'John', estimatedWaitingTime: 0 },
          { firstName: 'Jane', estimatedWaitingTime: 30 }
        ]
      });

      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        where: {
          startTime: expect.any(Object),
          status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
        },
        relations: ['customer', 'service'],
        order: { startTime: 'ASC' },
      });
    });

    it('should return empty result when no upcoming bookings exist', async () => {
      mockBookingRepository.find.mockResolvedValue([]);

      const result = await service.getUpcomingCount();
      
      expect(result).toEqual({
        count: 0,
        customers: []
      });
      
      expect(mockBookingRepository.find).toHaveBeenCalled();
    });
  });
});
