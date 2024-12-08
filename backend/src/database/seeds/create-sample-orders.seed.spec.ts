import { DataSource, Repository, EntityTarget } from 'typeorm';
import { createSampleOrders } from './create-sample-orders.seed';
import { Order } from '../../orders/entities/order.entity';
import { Booking, BookingStatus } from '../../bookings/entities/booking.entity';

type MockRepositories = {
  Booking: Repository<Booking>;
  Order: Repository<Order>;
};

interface MockFunctions {
  bookingFindMock: jest.Mock;
  orderCreateMock: jest.Mock;
  orderSaveMock: jest.Mock;
  bookingSaveMock: jest.Mock;
}

describe('createSampleOrders', () => {
  let mockDataSource: Partial<DataSource>;
  let mockBookingRepository: Repository<Booking>;
  let mockOrderRepository: Repository<Order>;
  let mocks: MockFunctions;

  function createMockBookings(count: number): Booking[] {
    return Array(count).fill(null).map((_, index) => ({
      id: `booking-${index}`,
      status: BookingStatus.CONFIRMED,
      totalPrice: 100 + index,
      customer: { id: 'customer-1' },
      employee: { id: 'employee-1' },
      service: { id: 'service-1' },
    })) as Booking[];
  }

  function setupMocks(): MockFunctions {
    const bookingFindMock = mockBookingRepository.find as jest.Mock;
    const orderCreateMock = mockOrderRepository.create as jest.Mock;
    const orderSaveMock = mockOrderRepository.save as jest.Mock;
    const bookingSaveMock = mockBookingRepository.save as jest.Mock;

    orderCreateMock.mockImplementation((data: Partial<Order>) => data);
    orderSaveMock.mockImplementation((data: Partial<Order>) => data);
    bookingSaveMock.mockImplementation((data: Partial<Booking>) => data);

    return {
      bookingFindMock,
      orderCreateMock,
      orderSaveMock,
      bookingSaveMock,
    };
  }

  beforeEach(() => {
    mockBookingRepository = {
      find: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<Booking>;

    mockOrderRepository = {
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as Repository<Order>;

    const repositories: MockRepositories = {
      Booking: mockBookingRepository,
      Order: mockOrderRepository,
    };

    const mockGetRepository = <T>(entity: EntityTarget<T>): Repository<T> => {
      const entityName = typeof entity === 'function' ? entity.name : 'Unknown';
      const repository = repositories[entityName as keyof MockRepositories];

      if (!repository) {
        throw new Error(`Repository not found for entity: ${entityName}`);
      }

      return repository as Repository<T>;
    };

    mockDataSource = {
      getRepository: jest.fn().mockImplementation(mockGetRepository),
    };

    mocks = setupMocks();
  });

  it('should create orders for confirmed bookings', async () => {
    const mockBookings = createMockBookings(20);
    mocks.bookingFindMock.mockResolvedValue(mockBookings);

    await createSampleOrders(mockDataSource as DataSource);

    expect(mocks.orderCreateMock).toHaveBeenCalledTimes(20);
    expect(mocks.orderSaveMock).toHaveBeenCalledTimes(20);
    expect(mocks.bookingSaveMock).toHaveBeenCalledTimes(20);

    const createCalls = mocks.orderCreateMock.mock.calls as [Partial<Order>][];
    if (!Array.isArray(createCalls) || createCalls.length === 0) {
      throw new Error('Expected at least one order creation call');
    }

    const firstOrderData = createCalls[0][0];
    expect(firstOrderData).toEqual(
      expect.objectContaining({
        booking: expect.objectContaining({ id: 'booking-0' }),
        totalAmount: 100,
        notes: expect.stringContaining('booking-0'),
      })
    );

    const saveCalls = mocks.bookingSaveMock.mock.calls as [Booking][];
    if (!Array.isArray(saveCalls) || saveCalls.length === 0) {
      throw new Error('Expected at least one booking save call');
    }

    const savedBooking = saveCalls[0][0];
    expect(savedBooking.status).toBe(BookingStatus.COMPLETED);
  });

  it('should handle case with fewer than 20 confirmed bookings', async () => {
    const mockBookings = createMockBookings(5);
    mocks.bookingFindMock.mockResolvedValue(mockBookings);

    await createSampleOrders(mockDataSource as DataSource);

    expect(mocks.orderCreateMock).toHaveBeenCalledTimes(5);
    expect(mocks.orderSaveMock).toHaveBeenCalledTimes(5);
    expect(mocks.bookingSaveMock).toHaveBeenCalledTimes(5);
  });
});
