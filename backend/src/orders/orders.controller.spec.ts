import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { UserRole } from '../users/entities/user.entity';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  const mockOrdersService = {
    createFromBooking: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
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
    it('should return an array of orders', async () => {
      const mockOrders: Partial<Order>[] = [
        { id: '1', totalAmount: 100 },
        { id: '2', totalAmount: 200 },
      ];

      mockOrdersService.findAll.mockResolvedValue(mockOrders);

      const result = await controller.findAll();

      expect(result).toEqual(mockOrders);
      expect(mockOrdersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const orderId = 'order-id';
      const mockOrder: Partial<Order> = {
        id: orderId,
        totalAmount: 100,
      };

      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(orderId);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(orderId);
    });
  });
});
