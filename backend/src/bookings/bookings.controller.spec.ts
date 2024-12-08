import { Test, TestingModule } from "@nestjs/testing";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { OrdersService } from "../orders/orders.service";
import { ShopsService } from "../shops/shops.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { Booking, BookingStatus } from "./entities/booking.entity";
import { UpcomingCountResponseDto } from "./dto/upcoming-count-response.dto";

describe("BookingsController", () => {
  let controller: BookingsController;
  let ordersService: OrdersService;

  const mockBooking = {
    id: "booking-1",
    customer: { id: "customer-1", firstName: "John" },
    employee: { id: "employee-1", user: { firstName: "Jane" } },
    service: { id: "service-1", name: "Haircut" },
    startTime: new Date(),
    endTime: new Date(),
    status: BookingStatus.PENDING,
    notes: "Test booking",
    totalPrice: 100.00,
    reminderSent: false,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as Booking;

  const mockCount = 5;
  const mockUpcomingCount: UpcomingCountResponseDto = {
    count: mockCount,
    customers: [
      {
        firstName: "John",
        estimatedWaitingTime: 30
      }
    ]
  };

  const mockBookingsService = {
    create: jest.fn().mockResolvedValue(mockBooking),
    findOne: jest.fn().mockResolvedValue(mockBooking),
    findByCustomer: jest.fn().mockResolvedValue([mockBooking]),
    findByEmployee: jest.fn().mockResolvedValue([mockBooking]),
    findUpcoming: jest.fn().mockResolvedValue([mockBooking]),
    update: jest.fn().mockResolvedValue(mockBooking),
    cancel: jest.fn().mockResolvedValue(mockBooking),
    getUpcomingCount: jest.fn().mockResolvedValue(mockUpcomingCount),
  };

  const mockShopsService = {
    validateShopCode: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
        {
          provide: OrdersService,
          useValue: {
            createFromBooking: jest.fn().mockResolvedValue({ id: "order-1" }),
          },
        },
        {
          provide: ShopsService,
          useValue: mockShopsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a booking", async () => {
      const createBookingDto: CreateBookingDto = {
        customerId: "customer-1",
        employeeId: "employee-1",
        serviceId: "service-1",
        startTime: new Date().toISOString(),
        notes: "Test booking",
      };

      const result = await controller.create(createBookingDto);

      expect(result).toBeDefined();
      expect(mockBookingsService.create).toHaveBeenCalledWith(createBookingDto);
    });
  });

  describe("findOne", () => {
    it("should return a booking by id", async () => {
      const result = await controller.findOne("booking-1");

      expect(result).toBeDefined();
      expect(mockBookingsService.findOne).toHaveBeenCalledWith("booking-1");
    });
  });

  describe("findByCustomer", () => {
    it("should return bookings for a customer", async () => {
      const result = await controller.findByCustomer("customer-1");

      expect(result).toBeDefined();
      expect(mockBookingsService.findByCustomer).toHaveBeenCalledWith("customer-1");
    });
  });

  describe("findByEmployee", () => {
    it("should return bookings for an employee", async () => {
      const result = await controller.findByEmployee("employee-1");

      expect(result).toBeDefined();
      expect(mockBookingsService.findByEmployee).toHaveBeenCalledWith("employee-1");
    });
  });

  describe("findUpcoming", () => {
    it("should return upcoming bookings", async () => {
      const result = await controller.findUpcoming();

      expect(result).toBeDefined();
      expect(mockBookingsService.findUpcoming).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a booking", async () => {
      const updateBookingDto: UpdateBookingDto = {
        startTime: new Date().toISOString(),
        notes: "Updated booking",
      };

      const result = await controller.update("booking-1", updateBookingDto);

      expect(result).toBeDefined();
      expect(mockBookingsService.update).toHaveBeenCalledWith("booking-1", updateBookingDto);
    });
  });

  describe("cancel", () => {
    it("should cancel a booking", async () => {
      const result = await controller.cancel("booking-1");

      expect(result).toBeDefined();
      expect(mockBookingsService.cancel).toHaveBeenCalledWith(
        "booking-1",
        "Cancelled by administrator",
      );
    });
  });

  describe("complete", () => {
    it("should complete a booking and create an order", async () => {
      const mockCreateFromBooking = jest.spyOn(ordersService, 'createFromBooking');
      const result = await controller.complete("booking-1");

      expect(result).toBeDefined();
      expect(mockCreateFromBooking).toHaveBeenCalledWith("booking-1");
    });
  });

  describe("getUpcomingCount", () => {
    it("should return the count of upcoming bookings", async () => {
      const result = await controller.getUpcomingCount();

      expect(result).toBeDefined();
      expect(result.count).toBe(mockCount);
      expect(mockBookingsService.getUpcomingCount).toHaveBeenCalled();
    });
  });
});
