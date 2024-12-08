import { DataSource, Repository, EntityTarget } from "typeorm";
import { createSampleOrders } from "./create-sample-orders.seed";
import { Order } from "../../orders/entities/order.entity";
import { Booking, BookingStatus } from "../../bookings/entities/booking.entity";

type SupportedEntity = Order | Booking;

function getEntityName(entity: EntityTarget<SupportedEntity>): string {
  if (entity === Order) return "Order";
  if (entity === Booking) return "Booking";
  throw new Error("Unsupported entity type");
}

describe("createSampleOrders", () => {
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
      getRepository: jest
        .fn()
        .mockImplementation((entity: EntityTarget<SupportedEntity>) => {
          const repositories = {
            Booking: mockBookingRepository as Repository<Booking>,
            Order: mockOrderRepository as Repository<Order>,
          };

          const entityName = getEntityName(entity);
          const repository = repositories[entityName];

          if (!repository) {
            throw new Error(`Repository not found for entity: ${entityName}`);
          }

          return repository;
        }),
    };
  });

  it("should create orders for confirmed bookings", async () => {
    const mockBookings = Array(20)
      .fill(null)
      .map((_, index) => ({
        id: `booking-${index}`,
        status: BookingStatus.CONFIRMED,
        totalPrice: 100 + index,
        customer: { id: "customer-1" },
        employee: { id: "employee-1" },
        service: { id: "service-1" },
      })) as Booking[];

    const bookingFindMock = mockBookingRepository.find as jest.Mock;
    const orderCreateMock = mockOrderRepository.create as jest.Mock;
    const orderSaveMock = mockOrderRepository.save as jest.Mock;
    const bookingSaveMock = mockBookingRepository.save as jest.Mock;

    bookingFindMock.mockResolvedValue(mockBookings);
    orderCreateMock.mockImplementation((data: Partial<Order>) => data);
    orderSaveMock.mockImplementation((data: Partial<Order>) => data);
    bookingSaveMock.mockImplementation((data: Partial<Booking>) => data);

    await createSampleOrders(mockDataSource as DataSource);

    // Should only create 20 orders even though there are 25 confirmed bookings
    expect(orderCreateMock).toHaveBeenCalledTimes(20);
    expect(orderSaveMock).toHaveBeenCalledTimes(20);
    expect(bookingSaveMock).toHaveBeenCalledTimes(20);

    // Verify the first order creation
    const createCalls = orderCreateMock.mock.calls as [Partial<Order>][];
    if (!Array.isArray(createCalls) || createCalls.length === 0) {
      throw new Error("Expected at least one order creation call");
    }

    const firstOrderData = createCalls[0][0];
    expect(firstOrderData).toEqual(
      expect.objectContaining({
        booking: expect.objectContaining({ id: "booking-0" }),
        totalAmount: 100,
        notes: expect.stringContaining("booking-0"),
      })
    );

    // Verify booking status updates
    const saveCalls = bookingSaveMock.mock.calls as [Booking][];
    if (!Array.isArray(saveCalls) || saveCalls.length === 0) {
      throw new Error("Expected at least one booking save call");
    }

    const savedBooking = saveCalls[0][0];
    expect(savedBooking.status).toBe(BookingStatus.COMPLETED);
  });

  it("should handle case with fewer than 20 confirmed bookings", async () => {
    const mockBookings = Array(5)
      .fill(null)
      .map((_, index) => ({
        id: `booking-${index}`,
        status: BookingStatus.CONFIRMED,
        totalPrice: 100 + index,
        customer: { id: "customer-1" },
        employee: { id: "employee-1" },
        service: { id: "service-1" },
      })) as Booking[];

    const bookingFindMock = mockBookingRepository.find as jest.Mock;
    const orderCreateMock = mockOrderRepository.create as jest.Mock;
    const orderSaveMock = mockOrderRepository.save as jest.Mock;
    const bookingSaveMock = mockBookingRepository.save as jest.Mock;

    bookingFindMock.mockResolvedValue(mockBookings);
    orderCreateMock.mockImplementation((data: Partial<Order>) => data);
    orderSaveMock.mockImplementation((data: Partial<Order>) => data);
    bookingSaveMock.mockImplementation((data: Partial<Booking>) => data);

    await createSampleOrders(mockDataSource as DataSource);

    // Should only create 5 orders since there are only 5 confirmed bookings
    expect(orderCreateMock).toHaveBeenCalledTimes(5);
    expect(orderSaveMock).toHaveBeenCalledTimes(5);
    expect(bookingSaveMock).toHaveBeenCalledTimes(5);
  });
});
