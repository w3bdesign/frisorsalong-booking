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

  const mockCustomer = {
    id: "customer-id",
    firstName: "John",
    lastName: "Doe",
  };

  const mockEmployee = {
    id: "employee-id",
    user: {
      firstName: "Jane",
      lastName: "Smith",
    },
  };

  const mockService = {
    id: "service-id",
    name: "Haircut",
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
      customer: mockCustomer,
      employee: mockEmployee,
      service: mockService,
      endTime: new Date("2024-01-01T11:00:00.000Z"),
      status: BookingStatus.PENDING,
      totalPrice: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should create a booking successfully", async () => {
      mockBookingsService.create.mockResolvedValue(mockBooking);

      const result = await controller.create(createBookingDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBooking.id);
      expect(result.customerName).toBe(`${mockCustomer.firstName} ${mockCustomer.lastName}`);
      expect(result.employeeName).toBe(`${mockEmployee.user.firstName} ${mockEmployee.user.lastName}`);
      expect(result.serviceName).toBe(mockService.name);
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
      customer: mockCustomer,
      employee: mockEmployee,
      service: mockService,
      startTime: "2024-01-01T10:00:00.000Z",
      status: BookingStatus.CONFIRMED,
    };

    it("should return a booking by id", async () => {
      mockBookingsService.findOne.mockResolvedValue(mockBooking);

      const result = await controller.findOne("booking-id");

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBooking.id);
      expect(result.customerName).toBe(`${mockCustomer.firstName} ${mockCustomer.lastName}`);
      expect(result.employeeName).toBe(`${mockEmployee.user.firstName} ${mockEmployee.user.lastName}`);
      expect(result.serviceName).toBe(mockService.name);
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
      customer: mockCustomer,
      employee: mockEmployee,
      service: mockService,
      startTime: "2024-01-01T10:00:00.000Z",
      ...updateBookingDto,
    };

    it("should update a booking successfully", async () => {
      mockBookingsService.update.mockResolvedValue(mockBooking);

      const result = await controller.update("booking-id", updateBookingDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBooking.id);
      expect(result.customerName).toBe(`${mockCustomer.firstName} ${mockCustomer.lastName}`);
      expect(result.employeeName).toBe(`${mockEmployee.user.firstName} ${mockEmployee.user.lastName}`);
      expect(result.serviceName).toBe(mockService.name);
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
      customer: mockCustomer,
      employee: mockEmployee,
      service: mockService,
      startTime: "2024-01-01T10:00:00.000Z",
      status: BookingStatus.CANCELLED,
      cancelledAt: new Date(),
      cancellationReason: "Cancelled by administrator",
    };

    it("should cancel a booking successfully", async () => {
      mockBookingsService.cancel.mockResolvedValue(mockBooking);

      const result = await controller.cancel("booking-id");

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBooking.id);
      expect(result.customerName).toBe(`${mockCustomer.firstName} ${mockCustomer.lastName}`);
      expect(result.employeeName).toBe(`${mockEmployee.user.firstName} ${mockEmployee.user.lastName}`);
      expect(result.serviceName).toBe(mockService.name);
      expect(service.cancel).toHaveBeenCalledWith(
        "booking-id",
        "Cancelled by administrator"
      );
    });

    it("should throw NotFoundException when booking is not found", async () => {
      mockBookingsService.cancel.mockRejectedValue(
        new NotFoundException("Booking not found"),
      );

      await expect(controller.cancel("non-existent-id")).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByCustomer", () => {
    const mockBookings = [
      {
        id: "booking-1",
        customer: mockCustomer,
        employee: mockEmployee,
        service: mockService,
        startTime: "2024-01-01T10:00:00.000Z",
        status: BookingStatus.CONFIRMED,
      },
      {
        id: "booking-2",
        customer: mockCustomer,
        employee: mockEmployee,
        service: mockService,
        startTime: "2024-01-02T10:00:00.000Z",
        status: BookingStatus.PENDING,
      },
    ];

    it("should return all bookings for a customer", async () => {
      mockBookingsService.findByCustomer.mockResolvedValue(mockBookings);

      const result = await controller.findByCustomer("customer-id");

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      result.forEach((booking, index) => {
        expect(booking.id).toBe(mockBookings[index].id);
        expect(booking.customerName).toBe(`${mockCustomer.firstName} ${mockCustomer.lastName}`);
        expect(booking.employeeName).toBe(`${mockEmployee.user.firstName} ${mockEmployee.user.lastName}`);
        expect(booking.serviceName).toBe(mockService.name);
      });
      expect(service.findByCustomer).toHaveBeenCalledWith("customer-id");
    });
  });

  describe("findByEmployee", () => {
    const mockBookings = [
      {
        id: "booking-1",
        customer: mockCustomer,
        employee: mockEmployee,
        service: mockService,
        startTime: "2024-01-01T10:00:00.000Z",
        status: BookingStatus.CONFIRMED,
      },
      {
        id: "booking-2",
        customer: mockCustomer,
        employee: mockEmployee,
        service: mockService,
        startTime: "2024-01-02T10:00:00.000Z",
        status: BookingStatus.PENDING,
      },
    ];

    it("should return all bookings for an employee", async () => {
      mockBookingsService.findByEmployee.mockResolvedValue(mockBookings);

      const result = await controller.findByEmployee("employee-id");

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      result.forEach((booking, index) => {
        expect(booking.id).toBe(mockBookings[index].id);
        expect(booking.customerName).toBe(`${mockCustomer.firstName} ${mockCustomer.lastName}`);
        expect(booking.employeeName).toBe(`${mockEmployee.user.firstName} ${mockEmployee.user.lastName}`);
        expect(booking.serviceName).toBe(mockService.name);
      });
      expect(service.findByEmployee).toHaveBeenCalledWith("employee-id");
    });
  });

  describe("findUpcoming", () => {
    const mockBookings = [
      {
        id: "booking-1",
        customer: mockCustomer,
        employee: mockEmployee,
        service: mockService,
        startTime: "2024-01-01T10:00:00.000Z",
        status: BookingStatus.CONFIRMED,
      },
      {
        id: "booking-2",
        customer: mockCustomer,
        employee: mockEmployee,
        service: mockService,
        startTime: "2024-01-02T14:00:00.000Z",
        status: BookingStatus.CONFIRMED,
      },
    ];

    it("should return all upcoming confirmed bookings", async () => {
      mockBookingsService.findUpcoming.mockResolvedValue(mockBookings);

      const result = await controller.findUpcoming();

      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      result.forEach((booking, index) => {
        expect(booking.id).toBe(mockBookings[index].id);
        expect(booking.customerName).toBe(`${mockCustomer.firstName} ${mockCustomer.lastName}`);
        expect(booking.employeeName).toBe(`${mockEmployee.user.firstName} ${mockEmployee.user.lastName}`);
        expect(booking.serviceName).toBe(mockService.name);
      });
      expect(service.findUpcoming).toHaveBeenCalled();
    });
  });
});
