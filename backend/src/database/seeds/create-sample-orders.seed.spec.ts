import { DataSource, Repository, EntityTarget } from "typeorm";
import { createSampleOrders } from "./create-sample-orders.seed";
import { Order } from "../../orders/entities/order.entity";
import { Booking, BookingStatus } from "../../bookings/entities/booking.entity";

describe('createSampleOrders', () => {
  let mockDataSource: Partial<DataSource>;
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
      getRepository: jest.fn().mockImplementation((entity: EntityTarget<any>) => {
        if (entity === Booking) return mockBookingRepository as Repository<Booking>;
        if (entity === Order) return mockOrderRepository as Repository<Order>;
        throw new Error(`Unexpected entity: ${entity}`);
      }),
    };
  });

  it('should create orders for confirmed bookings', async () => {
    const mockBookings = Array(20).fill(null).map((_, index) => ({
      id: `booking-${index}`,
      status: BookingStatus.CONFIRMED,
      totalPrice: 100 + index,
      customer: { id: 'customer-1' },
      employee: { id: 'employee-1' },
      service: { id: 'service-1' },
    })) as Booking[];

    (mockBookingRepository.find as jest.Mock).mockResolvedValue(mockBookings);
    (mockOrderRepository.create as jest.Mock).mockImplementation((data) => data);
    (mockOrderRepository.save as jest.Mock).mockImplementation((data) => data);
    (mockBookingRepository.save as jest.Mock).mockImplementation((data) => data);

    await createSampleOrders(mockDataSource as DataSource);

    // Should only create 20 orders even though there are 25 confirmed bookings
    expect(mockOrderRepository.create).toHaveBeenCalledTimes(20);
    expect(mockOrderRepository.save).toHaveBeenCalledTimes(20);
    expect(mockBookingRepository.save).toHaveBeenCalledTimes(20);

    // Verify the first order creation
    expect(mockOrderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        booking: expect.objectContaining({ id: 'booking-0' }),
        totalAmount: 100,
        notes: expect.stringContaining('booking-0'),
      })
    );

    // Verify booking status updates
    const savedBooking = (mockBookingRepository.save as jest.Mock).mock.calls[0][0];
    expect(savedBooking.status).toBe(BookingStatus.COMPLETED);
  });

  it('should handle case with fewer than 20 confirmed bookings', async () => {
    const mockBookings = Array(5).fill(null).map((_, index) => ({
      id: `booking-${index}`,
      status: BookingStatus.CONFIRMED,
      totalPrice: 100 + index,
      customer: { id: 'customer-1' },
      employee: { id: 'employee-1' },
      service: { id: 'service-1' },
    })) as Booking[];

    (mockBookingRepository.find as jest.Mock).mockResolvedValue(mockBookings);
    (mockOrderRepository.create as jest.Mock).mockImplementation((data) => data);
    (mockOrderRepository.save as jest.Mock).mockImplementation((data) => data);
    (mockBookingRepository.save as jest.Mock).mockImplementation((data) => data);

    await createSampleOrders(mockDataSource as DataSource);

    // Should only create 5 orders since there are only 5 confirmed bookings
    expect(mockOrderRepository.create).toHaveBeenCalledTimes(5);
    expect(mockOrderRepository.save).toHaveBeenCalledTimes(5);
    expect(mockBookingRepository.save).toHaveBeenCalledTimes(5);
  });
});
