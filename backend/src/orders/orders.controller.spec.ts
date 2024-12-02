import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const createMockUser = (data: Partial<User>): User => ({
    id: 'default-id',
    firstName: 'Default',
    lastName: 'User',
    email: 'default@example.com',
    password: 'password',
    role: UserRole.CUSTOMER,
    phoneNumber: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    hashPassword: async function() {
      if (this.password) {
        const salt = await bcrypt.genSalt();
        this.password = await bcrypt.hash(this.password, salt);
      }
    },
    validatePassword: async function(password: string) {
      return bcrypt.compare(password, this.password);
    },
    ...data
  });

  const mockAdminUser = createMockUser({
    id: 'admin-id',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
  });

  const mockEmployeeUser = createMockUser({
    id: 'employee-id',
    email: 'employee@example.com',
    firstName: 'Employee',
    lastName: 'User',
    role: UserRole.EMPLOYEE,
  });

  const mockOrdersService = {
    createFromBooking: jest.fn(),
    findAll: jest.fn(),
    findAllByEmployee: jest.fn(),
    findOne: jest.fn(),
    findOneByEmployee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    service = module.get<OrdersService>(OrdersService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order from a booking', async () => {
      const bookingId = 'booking-id';
      const mockOrder: Partial<Order> = {
        id: 'order-id',
        totalAmount: 100,
      };

      mockOrdersService.createFromBooking.mockResolvedValue(mockOrder);

      const result = await controller.create(bookingId);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.createFromBooking).toHaveBeenCalledWith(bookingId);
    });
  });

  describe('findAll', () => {
    const mockOrders: Partial<Order>[] = [
      { id: '1', totalAmount: 100 },
      { id: '2', totalAmount: 200 },
    ];

    it('should return all orders for admin user', async () => {
      mockOrdersService.findAll.mockResolvedValue(mockOrders);

      const result = await controller.findAll(mockAdminUser);

      expect(result).toEqual(mockOrders);
      expect(mockOrdersService.findAll).toHaveBeenCalled();
      expect(mockOrdersService.findAllByEmployee).not.toHaveBeenCalled();
    });

    it('should return employee-specific orders for employee user', async () => {
      mockOrdersService.findAllByEmployee.mockResolvedValue([mockOrders[0]]);

      const result = await controller.findAll(mockEmployeeUser);

      expect(result).toEqual([mockOrders[0]]);
      expect(mockOrdersService.findAll).not.toHaveBeenCalled();
      expect(mockOrdersService.findAllByEmployee).toHaveBeenCalledWith(mockEmployeeUser.id);
    });
  });

  describe('findAllByEmployee', () => {
    const mockOrders: Partial<Order>[] = [
      { id: '1', totalAmount: 100 },
    ];

    it('should allow admin to access any employee orders', async () => {
      const employeeId = 'other-employee-id';
      mockOrdersService.findAllByEmployee.mockResolvedValue(mockOrders);

      const result = await controller.findAllByEmployee(employeeId, mockAdminUser);

      expect(result).toEqual(mockOrders);
      expect(mockOrdersService.findAllByEmployee).toHaveBeenCalledWith(employeeId);
    });

    it('should allow employee to access their own orders', async () => {
      mockOrdersService.findAllByEmployee.mockResolvedValue(mockOrders);

      const result = await controller.findAllByEmployee(mockEmployeeUser.id, mockEmployeeUser);

      expect(result).toEqual(mockOrders);
      expect(mockOrdersService.findAllByEmployee).toHaveBeenCalledWith(mockEmployeeUser.id);
    });

    it('should not allow employee to access other employee orders', async () => {
      const otherEmployeeId = 'other-employee-id';

      await expect(
        controller.findAllByEmployee(otherEmployeeId, mockEmployeeUser)
      ).rejects.toThrow(UnauthorizedException);

      expect(mockOrdersService.findAllByEmployee).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const orderId = 'order-id';
    const mockOrder: Partial<Order> = {
      id: orderId,
      totalAmount: 100,
    };

    it('should return any order for admin user', async () => {
      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(orderId, mockAdminUser);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(orderId);
      expect(mockOrdersService.findOneByEmployee).not.toHaveBeenCalled();
    });

    it('should return employee-specific order for employee user', async () => {
      mockOrdersService.findOneByEmployee.mockResolvedValue(mockOrder);

      const result = await controller.findOne(orderId, mockEmployeeUser);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.findOne).not.toHaveBeenCalled();
      expect(mockOrdersService.findOneByEmployee).toHaveBeenCalledWith(orderId, mockEmployeeUser.id);
    });
  });
});
