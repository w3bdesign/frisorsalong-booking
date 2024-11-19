import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BookingsService } from "./bookings.service";
import { Booking, BookingStatus } from "./entities/booking.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { UsersService } from "../users/users.service";
import { EmployeesService } from "../employees/employees.service";
import { ServicesService } from "../services/services.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe("BookingsService", () => {
  let service: BookingsService;
  let bookingRepository: Repository<Booking>;
  let usersService: UsersService;
  let employeesService: EmployeesService;
  let servicesService: ServicesService;

  const mockBookingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockEmployeesService = {
    findOne: jest.fn(),
    isAvailable: jest.fn(),
  };

  const mockServicesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    bookingRepository = module.get<Repository<Booking>>(
      getRepositoryToken(Booking),
    );
    usersService = module.get<UsersService>(UsersService);
    employeesService = module.get<EmployeesService>(EmployeesService);
    servicesService = module.get<ServicesService>(ServicesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    const createBookingDto: CreateBookingDto = {
      customerId: "customer-id",
      employeeId: "employee-id",
      serviceId: "service-id",
      startTime: "2024-01-01T10:00:00.000Z",
      notes: "Test booking",
    };

    const mockUser = { id: "customer-id", name: "Test Customer" };
    const mockEmployee = { id: "employee-id", name: "Test Employee" };
    const mockService = {
      id: "service-id",
      name: "Test Service",
      duration: 60,
      price: 100,
    };

    it("should create a booking successfully", async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.isAvailable.mockResolvedValue(true);

      const mockBooking = {
        id: "booking-id",
        ...createBookingDto,
        status: BookingStatus.PENDING,
      };

      mockBookingRepository.create.mockReturnValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(mockBooking);

      const result = await service.create(createBookingDto);

      expect(result).toEqual(mockBooking);
      expect(mockBookingRepository.create).toHaveBeenCalled();
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it("should throw BadRequestException if employee is not available", async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);
      mockServicesService.findOne.mockResolvedValue(mockService);
      mockEmployeesService.isAvailable.mockResolvedValue(false);

      await expect(service.create(createBookingDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("update", () => {
    const updateBookingDto: UpdateBookingDto = {
      status: BookingStatus.CONFIRMED,
      notes: "Updated notes",
    };

    it("should update a booking successfully", async () => {
      const mockBooking = {
        id: "booking-id",
        status: BookingStatus.PENDING,
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue({
        ...mockBooking,
        ...updateBookingDto,
      });

      const result = await service.update("booking-id", updateBookingDto);

      expect(result).toEqual({ ...mockBooking, ...updateBookingDto });
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if booking not found", async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update("non-existent-id", updateBookingDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("cancel", () => {
    it("should cancel a booking successfully", async () => {
      const mockBooking = {
        id: "booking-id",
        status: BookingStatus.CONFIRMED,
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue({
        ...mockBooking,
        status: BookingStatus.CANCELLED,
        cancelledAt: expect.any(Date),
      });

      const result = await service.cancel("booking-id", "Customer cancelled");

      expect(result.status).toBe(BookingStatus.CANCELLED);
      expect(result.cancelledAt).toBeDefined();
      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if booking not found", async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.cancel("non-existent-id", "reason")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("findOne", () => {
    it("should return a booking if found", async () => {
      const mockBooking = {
        id: "booking-id",
        status: BookingStatus.CONFIRMED,
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.findOne("booking-id");

      expect(result).toEqual(mockBooking);
    });

    it("should throw NotFoundException if booking not found", async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("non-existent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
