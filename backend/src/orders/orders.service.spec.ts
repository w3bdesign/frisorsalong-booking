import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
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

  const mockOrder: Order = {
    id: 'order-1',
    totalAmount: 100,
    completedAt: new Date(),
    booking: {
      id: 'booking-1',
      customer: { id: 'customer-1' },
      employee: { 
        id: 'employee-1',
        user: { id: 'user-1' }
      } as Employee,
      service: { id: 'service-1' },
      totalPrice: 100,
      status: BookingStatus.COMPLETED,
    } as Booking,
  } as Order;

  const mockBooking: Booking = {
    id: 'booking-1',
    customer: { id: 'customer-1' },
    employee: { 
      id: 'employee-1',
      user: { id: 'user-1' }
    } as Employee,
    service: { id: 'service-1' },
    totalPrice: 100,
    status: BookingStatus.CONFIRMED,
  } as Booking;

  const mockEmployee: Employee = {
    id: 'employee-1',
    user: { id: 'user-1' },
  } as Employee;

  interface OrderWhere {
    id?: string;
    booking?: {
      employee?: {
        id?: string;
      };
    };
  }

  const mockOrderRepository = {
    create: jest.fn().mockImplementation((dto: Partial<Order>): Order => ({
      ...dto,
      id: 'order-1',
    } as Order)),
    save: jest.fn().mockImplementation((order: Order): Promise<Order> => Promise.resolve(order)),
    find: jest.fn().mockImplementation((): Promise<Order[]> => Promise.resolve([mockOrder])),
    findOne: jest.fn().mockImplementation((options: FindOneOptions<Order>): Promise<Order | null> => {
      if (!options.where) return Promise.resolve(null);

      const whereCondition = options.where as OrderWhere;
      
      // Check if this is a findOneByEmployee call
      if (whereCondition.id === 'order-1' && 
          whereCondition.booking?.employee?.id === 'employee-1') {
        return Promise.resolve(mockOrder);
      }
      
      // Check if this is a regular findOne call
      if (whereCondition.id === 'order-1' && !whereCondition.booking) {
        return Promise.resolve(mockOrder);
      }
      
      return Promise.resolve(null);
    }),
  };

  const mockBookingRepository = {
    findOne: jest.fn().mockImplementation((): Promise<Booking> => Promise.resolve(mockBooking)),
    save: jest.fn().mockImplementation((booking: Booking): Promise<Booking> => Promise.resolve(booking)),
  };

  const mockEmployeesService = {
    findByUserId: jest.fn().mockImplementation((): Promise<Employee> => Promise.resolve(mockEmployee)),
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
    const checkService = (): void => {
      expect(service).toBeDefined();
    };
    checkService();
  });

  describe('createFromBooking', () => {
    it('should create an order from a confirmed booking', async () => {
      const result = await service.createFromBooking('booking-1');

      const checkResult = (): void => {
        expect(result).toMatchObject({
          id: expect.any(String),
          totalAmount: mockOrder.totalAmount,
          completedAt: expect.any(Date),
          booking: {
            ...mockOrder.booking,
            status: BookingStatus.COMPLETED,
          },
        });
      };

      const checkCalls = (): void => {
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
      };

      checkResult();
      checkCalls();
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      const findOneSpy = jest.spyOn(bookingRepository, 'findOne').mockResolvedValueOnce(null);

      const testFn = async (): Promise<void> => {
        await service.createFromBooking('non-existent');
      };

      const checkError = async (): Promise<void> => {
        await expect(testFn()).rejects.toThrow(NotFoundException);
      };

      const checkSpy = (): void => {
        expect(findOneSpy).toHaveBeenCalled();
      };

      await checkError();
      checkSpy();
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const result = await service.findAll();

      const checkResult = (): void => {
        expect(result).toEqual([mockOrder]);
      };

      const checkCalls = (): void => {
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
      };

      checkResult();
      checkCalls();
    });
  });

  describe('findAllByEmployee', () => {
    it('should return orders for a specific employee', async () => {
      const result = await service.findAllByEmployee('user-1');

      const checkResult = (): void => {
        expect(result).toEqual([mockOrder]);
      };

      const checkCalls = (): void => {
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
      };

      checkResult();
      checkCalls();
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const result = await service.findOne('order-1');

      const checkResult = (): void => {
        expect(result).toEqual(mockOrder);
      };

      const checkCalls = (): void => {
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
      };

      checkResult();
      checkCalls();
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const findOneSpy = jest.spyOn(orderRepository, 'findOne').mockResolvedValueOnce(null);

      const testFn = async (): Promise<void> => {
        await service.findOne('non-existent');
      };

      const checkError = async (): Promise<void> => {
        await expect(testFn()).rejects.toThrow(NotFoundException);
      };

      const checkSpy = (): void => {
        expect(findOneSpy).toHaveBeenCalled();
      };

      await checkError();
      checkSpy();
    });
  });

  describe('findOneByEmployee', () => {
    it('should return an order for a specific employee', async () => {
      const result = await service.findOneByEmployee('order-1', 'user-1');

      const checkResult = (): void => {
        expect(result).toEqual(mockOrder);
      };

      const checkCalls = (): void => {
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
      };

      checkResult();
      checkCalls();
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const findOneSpy = jest.spyOn(orderRepository, 'findOne').mockResolvedValueOnce(null);

      const testFn = async (): Promise<void> => {
        await service.findOneByEmployee('non-existent', 'user-1');
      };

      const checkError = async (): Promise<void> => {
        await expect(testFn()).rejects.toThrow(NotFoundException);
      };

      const checkSpy = (): void => {
        expect(findOneSpy).toHaveBeenCalled();
      };

      await checkError();
      checkSpy();
    });
  });
});
