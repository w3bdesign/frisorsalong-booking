import { DataSource, Repository } from 'typeorm';
import { createSampleOrders } from './create-sample-orders.seed';
import { Order } from '../../orders/entities/order.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';

describe('createSampleOrders', () => {
  let mockDataSource: DataSource;
  let mockBookingRepository: Partial<Repository<Booking>>;
  let mockOrderRepository: Partial<Repository<Order>>;

  beforeEach(() => {
    mockBookingRepository = {
      find: jest.fn(),
      save: jest.fn(),
    };

    mockOrderRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    mockDataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === Booking) return mockBookingRepository as Repository<Booking>;
        if (entity === Order) return mockOrderRepository as Repository<Order>;
        return {} as Repository<any>;
      }),
    } as unknown as DataSource;
  });

  it('should create orders for confirmed bookings successfully', async () => {
    const mockBookings = [
      {
        id: 'booking1',
        totalPrice: 100,
        status: BookingStatus.CONFIRMED,
        customer: { id: 'cust1' },
        employee: { id: 'emp1' },
        service: { id: 'service1' },
      },
      {
        id: 'booking2',
        totalPrice: 150,
        status: BookingStatus.CONFIRMED,
        customer: { id: 'cust2' },
        employee: { id: 'emp2' },
        service: { id: 'service2' },
      },
    ];

    const mockOrder = {
      id: 'order1',
      booking: mockBookings[0],
      totalAmount: mockBookings[0].totalPrice,
    };

    mockBookingRepository.find = jest.fn().mockResolvedValue(mockBookings);
    mockOrderRepository.create = jest.fn().mockReturnValue(mockOrder);
    mockOrderRepository.save = jest.fn().mockResolvedValue(mockOrder);
    mockBookingRepository.save = jest.fn().mockImplementation((booking) => Promise.resolve({
      ...booking,
      status: BookingStatus.COMPLETED,
    }));

    await createSampleOrders(mockDataSource);

    expect(mockBookingRepository.find).toHaveBeenCalledWith({
      where: { status: BookingStatus.CONFIRMED },
      relations: ['customer', 'employee', 'service'],
    });
    expect(mockOrderRepository.create).toHaveBeenCalled();
    expect(mockOrderRepository.save).toHaveBeenCalled();
    expect(mockBookingRepository.save).toHaveBeenCalled();
  });

  it('should handle case when no confirmed bookings exist', async () => {
    mockBookingRepository.find = jest.fn().mockResolvedValue([]);

    await expect(createSampleOrders(mockDataSource)).rejects.toThrow('No orders were created successfully');
  });

  it('should handle invalid booking data', async () => {
    const mockBookings = [
      {
        id: 'booking1',
        // Missing totalPrice
        status: BookingStatus.CONFIRMED,
        customer: { id: 'cust1' },
        employee: { id: 'emp1' },
        service: { id: 'service1' },
      },
    ];

    mockBookingRepository.find = jest.fn().mockResolvedValue(mockBookings);

    await expect(createSampleOrders(mockDataSource)).rejects.toThrow('No orders were created successfully');
  });

  it('should handle database error when fetching bookings', async () => {
    mockBookingRepository.find = jest.fn().mockRejectedValue(new Error('Database error'));

    await expect(createSampleOrders(mockDataSource)).rejects.toThrow('Database error');
  });

  it('should handle non-array response from booking repository', async () => {
    mockBookingRepository.find = jest.fn().mockResolvedValue(null);

    await expect(createSampleOrders(mockDataSource)).rejects.toThrow('Failed to fetch confirmed bookings');
  });

  it('should handle order creation failure', async () => {
    const mockBookings = [
      {
        id: 'booking1',
        totalPrice: 100,
        status: BookingStatus.CONFIRMED,
        customer: { id: 'cust1' },
        employee: { id: 'emp1' },
        service: { id: 'service1' },
      },
    ];

    mockBookingRepository.find = jest.fn().mockResolvedValue(mockBookings);
    mockOrderRepository.create = jest.fn().mockReturnValue(null);

    await expect(createSampleOrders(mockDataSource)).rejects.toThrow('No orders were created successfully');
  });

  it('should handle order save failure', async () => {
    const mockBookings = [
      {
        id: 'booking1',
        totalPrice: 100,
        status: BookingStatus.CONFIRMED,
        customer: { id: 'cust1' },
        employee: { id: 'emp1' },
        service: { id: 'service1' },
      },
    ];

    const mockOrder = {
      id: 'order1',
      booking: mockBookings[0],
      totalAmount: mockBookings[0].totalPrice,
    };

    mockBookingRepository.find = jest.fn().mockResolvedValue(mockBookings);
    mockOrderRepository.create = jest.fn().mockReturnValue(mockOrder);
    mockOrderRepository.save = jest.fn().mockResolvedValue(null);

    await expect(createSampleOrders(mockDataSource)).rejects.toThrow('No orders were created successfully');
  });

  it('should handle booking status update failure but continue processing', async () => {
    const mockBookings = [
      {
        id: 'booking1',
        totalPrice: 100,
        status: BookingStatus.CONFIRMED,
        customer: { id: 'cust1' },
        employee: { id: 'emp1' },
        service: { id: 'service1' },
      },
    ];

    const mockOrder = {
      id: 'order1',
      booking: mockBookings[0],
      totalAmount: mockBookings[0].totalPrice,
    };

    mockBookingRepository.find = jest.fn().mockResolvedValue(mockBookings);
    mockOrderRepository.create = jest.fn().mockReturnValue(mockOrder);
    mockOrderRepository.save = jest.fn().mockResolvedValue(mockOrder);
    mockBookingRepository.save = jest.fn().mockRejectedValue(new Error('Failed to update status'));

    // Should not throw since order was created successfully
    await createSampleOrders(mockDataSource);

    expect(mockBookingRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      id: 'booking1',
      status: BookingStatus.COMPLETED,
    }));
  });

  it('should limit number of orders to 20', async () => {
    const mockBookings = Array(25).fill(null).map((_, index) => ({
      id: `booking${index + 1}`,
      totalPrice: 100,
      status: BookingStatus.CONFIRMED,
      customer: { id: `cust${index + 1}` },
      employee: { id: `emp${index + 1}` },
      service: { id: `service${index + 1}` },
    }));

    const mockOrder = {
      id: 'order1',
      booking: mockBookings[0],
      totalAmount: mockBookings[0].totalPrice,
    };

    mockBookingRepository.find = jest.fn().mockResolvedValue(mockBookings);
    mockOrderRepository.create = jest.fn().mockReturnValue(mockOrder);
    mockOrderRepository.save = jest.fn().mockResolvedValue(mockOrder);
    mockBookingRepository.save = jest.fn().mockImplementation((booking) => Promise.resolve({
      ...booking,
      status: BookingStatus.COMPLETED,
    }));

    await createSampleOrders(mockDataSource);

    // Should only create 20 orders even though 25 bookings exist
    expect(mockOrderRepository.create).toHaveBeenCalledTimes(20);
  });
});
