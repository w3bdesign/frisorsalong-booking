import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/entities/booking.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  let orderRepository: Repository<Order>;
  let bookingsService: BookingsService;

  const mockOrderRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockBookingsService = {
    findOne: jest.fn(),
    update: jest.fn(),
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
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    orderRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    bookingsService = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFromBooking', () => {
    it('should create an order from a confirmed booking', async () => {
      const bookingId = 'some-uuid';
      const mockBooking = {
        id: bookingId,
        status: BookingStatus.CONFIRMED,
        totalPrice: 100,
      };
      const mockOrder = {
        id: 'order-uuid',
        booking: mockBooking,
        totalAmount: 100,
        completedAt: expect.any(Date),
      };

      mockBookingsService.findOne.mockResolvedValue(mockBooking);
      mockOrderRepository.create.mockReturnValue(mockOrder);
      mockOrderRepository.save.mockResolvedValue(mockOrder);
      mockBookingsService.update.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      });

      const result = await service.createFromBooking(bookingId);

      expect(result).toEqual(mockOrder);
      expect(mockBookingsService.findOne).toHaveBeenCalledWith(bookingId);
      expect(mockBookingsService.update).toHaveBeenCalledWith(bookingId, {
        status: BookingStatus.COMPLETED,
      });
    });

    it('should throw NotFoundException if booking does not exist', async () => {
      mockBookingsService.findOne.mockResolvedValue(null);

      await expect(service.createFromBooking('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if booking is not confirmed', async () => {
      const mockBooking = {
        id: 'some-uuid',
        status: BookingStatus.PENDING,
      };

      mockBookingsService.findOne.mockResolvedValue(mockBooking);

      await expect(service.createFromBooking('some-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const mockOrders = [
        { id: '1', totalAmount: 100 },
        { id: '2', totalAmount: 200 },
      ];

      mockOrderRepository.find.mockResolvedValue(mockOrders);

      const result = await service.findAll();

      expect(result).toEqual(mockOrders);
      expect(mockOrderRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an order by id', async () => {
      const mockOrder = { id: '1', totalAmount: 100 };

      mockOrderRepository.findOne.mockResolvedValue(mockOrder);

      const result = await service.findOne('1');

      expect(result).toEqual(mockOrder);
      expect(mockOrderRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['booking'],
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockOrderRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});