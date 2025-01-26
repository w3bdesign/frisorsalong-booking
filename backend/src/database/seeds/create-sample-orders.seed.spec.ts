import { DataSource, Repository } from 'typeorm';
import { createSampleOrders } from './create-sample-orders.seed';
import { Order } from '../../orders/entities/order.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';

describe('createSampleOrders', () => {
  let mockDataSource: DataSource;
  let mockBookingRepository: Partial<Repository<Booking>>;
  let mockOrderRepository: Partial<Repository<Order>>;

  interface MockBooking {
    id: string;
    totalPrice: number;
    status: BookingStatus;
    customer: { id: string };
    employee: { id: string };
    service: { id: string };
  }

  interface MockOrder {
    id: string;
    booking: MockBooking;
    totalAmount: number;
  }

  interface TestFixture {
    bookings: MockBooking[];
    order: MockOrder;
    setupMocks: () => void;
  }

  const createMockBooking = (id: string, totalPrice = 100): MockBooking => ({
    id: `booking${id}`,
    totalPrice,
    status: BookingStatus.CONFIRMED,
    customer: { id: `cust${id}` },
    employee: { id: `emp${id}` },
    service: { id: `service${id}` },
  });

  const createMockOrder = (booking: MockBooking): MockOrder => ({
    id: 'order1',
    booking,
    totalAmount: booking.totalPrice,
  });

  const createTestFixture = (bookings: MockBooking[]): TestFixture => {
    const order = createMockOrder(bookings[0]);
    return {
      bookings,
      order,
      setupMocks: () => {
        mockBookingRepository.find = jest.fn().mockResolvedValue(bookings);
        mockOrderRepository.create = jest.fn().mockReturnValue(order);
        mockOrderRepository.save = jest.fn().mockResolvedValue(order);
        mockBookingRepository.save = jest.fn().mockImplementation((booking) => Promise.resolve({
          ...booking,
          status: BookingStatus.COMPLETED,
        }));
      },
    };
  };

  const expectOrderCreationSuccess = () => {
    expect(mockBookingRepository.find).toHaveBeenCalledWith({
      where: { status: BookingStatus.CONFIRMED },
      relations: ['customer', 'employee', 'service'],
    });
    expect(mockOrderRepository.create).toHaveBeenCalled();
    expect(mockOrderRepository.save).toHaveBeenCalled();
    expect(mockBookingRepository.save).toHaveBeenCalled();
  };

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
      getRepository: jest.fn((entity: new () => Booking | Order) => {
        if (entity === Booking) return mockBookingRepository as Repository<Booking>;
        if (entity === Order) return mockOrderRepository as Repository<Order>;
        throw new Error(`Unexpected entity: ${entity.name}`);
      }),
    } as unknown as DataSource;
  });

  it('should create orders for confirmed bookings successfully', async () => {
    const fixture = createTestFixture([
      createMockBooking('1'),
      createMockBooking('2', 150),
    ]);
    fixture.setupMocks();

    await createSampleOrders(mockDataSource);

    expectOrderCreationSuccess();
  });

  describe('error handling', () => {
    const setupErrorTest = async (setupFn: () => void) => {
      setupFn();
      return createSampleOrders(mockDataSource);
    };

    it('should handle case when no confirmed bookings exist', async () => {
      await expect(setupErrorTest(() => {
        mockBookingRepository.find = jest.fn().mockResolvedValue([]);
      })).rejects.toThrow('No orders were created successfully');
    });

    it('should handle invalid booking data', async () => {
      const invalidBooking = {
        id: 'booking1',
        status: BookingStatus.CONFIRMED,
        customer: { id: 'cust1' },
        employee: { id: 'emp1' },
        service: { id: 'service1' },
      };

      await expect(setupErrorTest(() => {
        mockBookingRepository.find = jest.fn().mockResolvedValue([invalidBooking]);
      })).rejects.toThrow('No orders were created successfully');
    });

    it('should handle database error when fetching bookings', async () => {
      await expect(setupErrorTest(() => {
        mockBookingRepository.find = jest.fn().mockRejectedValue(new Error('Database error'));
      })).rejects.toThrow('Database error');
    });

    it('should handle non-array response from booking repository', async () => {
      await expect(setupErrorTest(() => {
        mockBookingRepository.find = jest.fn().mockResolvedValue(null);
      })).rejects.toThrow('Failed to fetch confirmed bookings');
    });

    it('should handle order creation failure', async () => {
      await expect(setupErrorTest(() => {
        const fixture = createTestFixture([createMockBooking('1')]);
        fixture.setupMocks();
        mockOrderRepository.create = jest.fn().mockReturnValue(null);
      })).rejects.toThrow('No orders were created successfully');
    });

    it('should handle order save failure', async () => {
      await expect(setupErrorTest(() => {
        const fixture = createTestFixture([createMockBooking('1')]);
        fixture.setupMocks();
        mockOrderRepository.save = jest.fn().mockResolvedValue(null);
      })).rejects.toThrow('No orders were created successfully');
    });
  });

  describe('booking status updates', () => {
    it('should handle booking status update failure but continue processing', async () => {
      const fixture = createTestFixture([createMockBooking('1')]);
      fixture.setupMocks();
      mockBookingRepository.save = jest.fn().mockRejectedValue(new Error('Failed to update status'));

      await createSampleOrders(mockDataSource);

      expect(mockBookingRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 'booking1',
        status: BookingStatus.COMPLETED,
      }));
    });

    it('should handle booking save returning undefined and continue processing', async () => {
      const fixture = createTestFixture([createMockBooking('1')]);
      fixture.setupMocks();
      mockBookingRepository.save = jest.fn().mockResolvedValue(undefined);

      await createSampleOrders(mockDataSource);

      expect(mockBookingRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: 'booking1',
        status: BookingStatus.COMPLETED,
      }));
      expect(mockOrderRepository.create).toHaveBeenCalled();
      expect(mockOrderRepository.save).toHaveBeenCalled();
    });
  });

  it('should limit number of orders to 20', async () => {
    const mockBookings = Array(25).fill(null).map((_, index) => createMockBooking((index + 1).toString()));
    const fixture = createTestFixture(mockBookings);
    fixture.setupMocks();

    await createSampleOrders(mockDataSource);

    expect(mockOrderRepository.create).toHaveBeenCalledTimes(20);
  });
});
