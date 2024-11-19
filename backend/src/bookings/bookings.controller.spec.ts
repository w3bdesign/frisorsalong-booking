import { Test, TestingModule } from "@nestjs/testing";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { BookingStatus } from "./entities/booking.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("BookingsController", () => {
  let controller: BookingsController;
  let service: BookingsService;

  const mockBookingsService = {
    create: jest.fn(),
    findOne: jest.fn(),
    findByCustomer: jest.fn(),
    findByEmployee: jest.fn(),
    findUpcoming: jest.fn(),
    update: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingsService>(BookingsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    const createBookingDto: CreateBookingDto = {
      customerId: "customer-id",
      employeeId: "employee-id",
      serviceId: "service-id",
      startTime: "2024-01-01T10:00:00.000Z",
      notes: "Test booking",
    };

    const mockBooking = {
      id: "booking-id",
      ...createBookingDto,
      endTime: new Date("2024-01-01T11:00:00.000Z"),
      status: BookingStatus.PENDING,
      totalPrice: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create a booking successfully", async () => {
      mockBookingsService.create.mockResolvedValue(mockBooking);

      const result = await controller.create(createBookingDto);

      expect(result).toEqual(mockBooking);
      expect(service.create).toHaveBeenCalledWith(createBookingDto);
    });

    it("should throw BadRequestException when employee is not available", async () => {
      mockBookingsService.create.mockRejectedValue(
        new BadRequestException("Employee is not available at this time"),
      );

      await expect(controller.create(createBookingDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findOne", () => {
    const mockBooking = {
      id: "booking-id",
      status: BookingStatus.CONFIRMED,
    };

    it("should return a booking by id", async () => {
      mockBookingsService.findOne.mockResolvedValue(mockBooking);

      const result = await controller.findOne("booking-id");

      expect(result).toEqual(mockBooking);
      expect(service.findOne).toHaveBeenCalledWith("booking-id");
    });

    it("should throw NotFoundException when booking is not found", async () => {
      mockBookingsService.findOne.mockRejectedValue(
        new NotFoundException("Booking not found"),
      );

      await expect(controller.findOne("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    const updateBookingDto: UpdateBookingDto = {
      status: BookingStatus.CONFIRMED,
      notes: "Updated notes",
    };

    const mockBooking = {
      id: "booking-id",
      ...updateBookingDto,
    };

    it("should update a booking successfully", async () => {
      mockBookingsService.update.mockResolvedValue(mockBooking);

      const result = await controller.update("booking-id", updateBookingDto);

      expect(result).toEqual(mockBooking);
      expect(service.update).toHaveBeenCalledWith(
        "booking-id",
        updateBookingDto,
      );
    });

    it("should throw NotFoundException when booking is not found", async () => {
      mockBookingsService.update.mockRejectedValue(
        new NotFoundException("Booking not found"),
      );

      await expect(
        controller.update("non-existent-id", updateBookingDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("cancel", () => {
    const mockBooking = {
      id: "booking-id",
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: "Customer request",
    };

    it("should cancel a booking successfully", async () => {
      mockBookingsService.cancel.mockResolvedValue(mockBooking);

      const result = await controller.cancel("booking-id", {
        reason: "Customer request",
      });

      expect(result).toEqual(mockBooking);
      expect(service.cancel).toHaveBeenCalledWith(
        "booking-id",
        "Customer request",
      );
    });

    it("should throw NotFoundException when booking is not found", async () => {
      mockBookingsService.cancel.mockRejectedValue(
        new NotFoundException("Booking not found"),
      );

      await expect(
        controller.cancel("non-existent-id", { reason: "Customer request" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByCustomer", () => {
    const mockBookings = [
      {
        id: "booking-1",
        status: BookingStatus.CONFIRMED,
      },
      {
        id: "booking-2",
        status: BookingStatus.PENDING,
      },
    ];

    it("should return all bookings for a customer", async () => {
      mockBookingsService.findByCustomer.mockResolvedValue(mockBookings);

      const result = await controller.findByCustomer("customer-id");

      expect(result).toEqual(mockBookings);
      expect(service.findByCustomer).toHaveBeenCalledWith("customer-id");
    });
  });

  describe("findByEmployee", () => {
    const mockBookings = [
      {
        id: "booking-1",
        status: BookingStatus.CONFIRMED,
      },
      {
        id: "booking-2",
        status: BookingStatus.PENDING,
      },
    ];

    it("should return all bookings for an employee", async () => {
      mockBookingsService.findByEmployee.mockResolvedValue(mockBookings);

      const result = await controller.findByEmployee("employee-id");

      expect(result).toEqual(mockBookings);
      expect(service.findByEmployee).toHaveBeenCalledWith("employee-id");
    });
  });

  describe("findUpcoming", () => {
    const mockBookings = [
      {
        id: "booking-1",
        status: BookingStatus.CONFIRMED,
        startTime: new Date("2024-01-01T10:00:00.000Z"),
      },
      {
        id: "booking-2",
        status: BookingStatus.CONFIRMED,
        startTime: new Date("2024-01-02T14:00:00.000Z"),
      },
    ];

    it("should return all upcoming confirmed bookings", async () => {
      mockBookingsService.findUpcoming.mockResolvedValue(mockBookings);

      const result = await controller.findUpcoming();

      expect(result).toEqual(mockBookings);
      expect(service.findUpcoming).toHaveBeenCalled();
    });
  });
});
