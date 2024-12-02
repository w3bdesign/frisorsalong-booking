import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { EmployeesService } from '../employees/employees.service';
import { NotFoundException } from '@nestjs/common';
import { Employee } from '../employees/entities/employee.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;
  let bookingRepository: Repository<Booking>;
  let employeesService: EmployeesService;

  const mockOrder = {
    id: 'order-1',
    totalAmount: 100,
    completedAt: new Date(),
    booking: {
      id: 'booking-1',
      customer: { id: 'customer-1' },
      employee: { 
        id: 'employee-1',
        user: { id: 'user-1' }
      },
      service: { id: 'service-1' },
      totalPrice: 100,
    },
  } as Order;

  const mockBooking = {
    id: 'booking-1',
    customer: { id: 'customer-1' },
    employee: { 
      id: 'employee-1',
      user: { id: 'user-1' }
    },
    service: { id: 'service-1' },
    totalPrice: 100,
    status: BookingStatus.CONFIRMED,
  } as Booking;

  const mockEmployee = {
    id: 'employee-1',
    user: { id: 'user-1' },
  } as Employee;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockBookingRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockEmployeesService = {
    findByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrderRepository,
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    employeesService = module.get<EmployeesService>(EmployeesService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromBooking', () => {
    it('should create an order from a confirmed booking', async () => {
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue({ ...mockBooking, status: BookingStatus.COMPLETED });
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);

      const result = await service.createFromBooking('booking-1');

      expect(result).toEqual(mockOrder);
      expect(bookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'booking-1' },
        relations: ['customer', 'employee', 'service'],
      });
      expect(bookingRepository.save).toHaveBeenCalledWith({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      });
      expect(orderRepository.create).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.createFromBooking('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const mockOrders = [mockOrder];
      mockOrderRepository.find.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result).toEqual(mockOrders);
      expect(orderRepository.find).toHaveBeenCalledWith({
        relations: [
          'booking',
          'booking.customer',
          'booking.employee',
          'booking.employee.user',
          'booking.service',
        ],
        order: { completedAt: 'DESC' },
      });
    });
  });

  describe('findAllByEmployee', () => {
    it('should return orders for a specific employee', async () => {
      mockEmployeesService.findByUserId.mockResolvedValue(mockEmployee);
      mockOrderRepository.find.mockResolvedValue([mockOrder]);

      const result = await service.findAllByEmployee('user-1');

      expect(result).toEqual([mockOrder]);
      expect(employeesService.findByUserId).toHaveBeenCalledWith('user-1');
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: {
          booking: {
            employee: {
              id: mockEmployee.id,
            },
          },
        },
        relations: [
          'booking',
          'booking.customer',
          'booking.employee',
          'booking.employee.user',
          'booking.service',
        ],
        order: { completedAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne('order-1');

      expect(result).toEqual(mockOrder);
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        relations: [
          'booking',
          'booking.customer',
          'booking.employee',
          'booking.employee.user',
          'booking.service',
        ],
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByEmployee', () => {
    it('should return an order for a specific employee', async () => {
      mockEmployeesService.findByUserId.mockResolvedValue(mockEmployee);
      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOneByEmployee('order-1', 'user-1');

      expect(result).toEqual(mockOrder);
      expect(employeesService.findByUserId).toHaveBeenCalledWith('user-1');
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'order-1',
          booking: {
            employee: {
              id: mockEmployee.id,
            },
          },
        },
        relations: [
          'booking',
          'booking.customer',
          'booking.employee',
          'booking.employee.user',
          'booking.service',
        ],
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockEmployeesService.findByUserId.mockResolvedValue(mockEmployee);
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOneByEmployee('non-existent', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
