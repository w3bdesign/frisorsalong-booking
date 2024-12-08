import { Test, TestingModule } from "@nestjs/testing";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { Order } from "./entities/order.entity";
import { User, UserRole } from "../users/entities/user.entity";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

describe("OrdersController", () => {
  let controller: OrdersController;

  const createMockUser = (data: Partial<User>): User => {
    const defaultUser: User = {
      id: "default-id",
      firstName: "Default",
      lastName: "User",
      email: "default@example.com",
      password: "password",
      role: UserRole.CUSTOMER,
      phoneNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      hashPassword: async (): Promise<void> => {
        const salt = await bcrypt.genSalt();
        defaultUser.password = await bcrypt.hash(defaultUser.password, salt);
      },
      validatePassword: async (password: string): Promise<boolean> => {
        return bcrypt.compare(password, defaultUser.password);
      },
      ...data,
    };
    return defaultUser;
  };

  const mockAdminUser = createMockUser({
    id: "admin-id",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    role: UserRole.ADMIN,
  });

  const mockEmployeeUser = createMockUser({
    id: "employee-id",
    email: "employee@example.com",
    firstName: "Employee",
    lastName: "User",
    role: UserRole.EMPLOYEE,
  });

  const mockOrdersService = {
    createFromBooking: jest
      .fn()
      .mockImplementation(
        (): Promise<Order> =>
          Promise.resolve({ id: "order-id", totalAmount: 100 } as Order)
      ),
    findAll: jest
      .fn()
      .mockImplementation(
        (): Promise<Order[]> =>
          Promise.resolve([{ id: "1", totalAmount: 100 } as Order])
      ),
    findAllByEmployee: jest
      .fn()
      .mockImplementation(
        (): Promise<Order[]> =>
          Promise.resolve([{ id: "1", totalAmount: 100 } as Order])
      ),
    findOne: jest
      .fn()
      .mockImplementation(
        (id: string): Promise<Order> =>
          Promise.resolve({ id, totalAmount: 100 } as Order)
      ),
    findOneByEmployee: jest
      .fn()
      .mockImplementation(
        (orderId: string): Promise<Order> =>
          Promise.resolve({ id: orderId, totalAmount: 100 } as Order)
      ),
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

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create an order from a booking", async () => {
      const bookingId = "booking-id";
      const mockOrder: Partial<Order> = {
        id: "order-id",
        totalAmount: 100,
      };

      mockOrdersService.createFromBooking.mockResolvedValue(mockOrder);

      const result = await controller.create(bookingId);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.createFromBooking).toHaveBeenCalledWith(
        bookingId
      );
    });
  });

  describe("findAll", () => {
    const mockOrders: Partial<Order>[] = [
      { id: "1", totalAmount: 100 },
      { id: "2", totalAmount: 200 },
    ];

    it("should return all orders for admin user", async () => {
      mockOrdersService.findAll.mockResolvedValue(mockOrders);

      const result = await controller.findAll(mockAdminUser);

      expect(result).toEqual(mockOrders);
      expect(mockOrdersService.findAll).toHaveBeenCalled();
      expect(mockOrdersService.findAllByEmployee).not.toHaveBeenCalled();
    });

    it("should return employee-specific orders for employee user", async () => {
      mockOrdersService.findAllByEmployee.mockResolvedValue([mockOrders[0]]);

      const result = await controller.findAll(mockEmployeeUser);

      expect(result).toEqual([mockOrders[0]]);
      expect(mockOrdersService.findAll).not.toHaveBeenCalled();
      expect(mockOrdersService.findAllByEmployee).toHaveBeenCalledWith(
        mockEmployeeUser.id
      );
    });
  });

  describe("findAllByEmployee", () => {
    const mockOrders: Partial<Order>[] = [{ id: "1", totalAmount: 100 }];

    it("should allow admin to access any employee orders", async () => {
      const employeeId = "other-employee-id";
      mockOrdersService.findAllByEmployee.mockResolvedValue(mockOrders);

      const result = await controller.findAllByEmployee(
        employeeId,
        mockAdminUser
      );

      expect(result).toEqual(mockOrders);
      expect(mockOrdersService.findAllByEmployee).toHaveBeenCalledWith(
        employeeId
      );
    });

    it("should allow employee to access their own orders", async () => {
      mockOrdersService.findAllByEmployee.mockResolvedValue(mockOrders);

      const result = await controller.findAllByEmployee(
        mockEmployeeUser.id,
        mockEmployeeUser
      );

      expect(result).toEqual(mockOrders);
      expect(mockOrdersService.findAllByEmployee).toHaveBeenCalledWith(
        mockEmployeeUser.id
      );
    });

    it("should not allow employee to access other employee orders", async () => {
      const otherEmployeeId = "other-employee-id";

      await expect(
        controller.findAllByEmployee(otherEmployeeId, mockEmployeeUser)
      ).rejects.toThrow(UnauthorizedException);

      expect(mockOrdersService.findAllByEmployee).not.toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    const orderId = "order-id";
    const mockOrder: Partial<Order> = {
      id: orderId,
      totalAmount: 100,
    };

    it("should return any order for admin user", async () => {
      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(orderId, mockAdminUser);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(orderId);
      expect(mockOrdersService.findOneByEmployee).not.toHaveBeenCalled();
    });

    it("should return employee-specific order for employee user", async () => {
      mockOrdersService.findOneByEmployee.mockResolvedValue(mockOrder);

      const result = await controller.findOne(orderId, mockEmployeeUser);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.findOne).not.toHaveBeenCalled();
      expect(mockOrdersService.findOneByEmployee).toHaveBeenCalledWith(
        orderId,
        mockEmployeeUser.id
      );
    });
  });
});
