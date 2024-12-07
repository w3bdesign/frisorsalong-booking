import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, In, LessThanOrEqual, Between } from "typeorm";
import { Booking, BookingStatus } from "./entities/booking.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { CreateWalkInBookingDto } from "./dto/create-walk-in-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import {
  UpcomingCountResponseDto,
  UpcomingCustomerDto,
} from "./dto/upcoming-count-response.dto";
import { UsersService } from "../users/users.service";
import { EmployeesService } from "../employees/employees.service";
import { ServicesService } from "../services/services.service";
import { OrdersService } from "../orders/orders.service";
import { ShopCode } from "../shops/entities/shop-code.entity";
import { UserRole } from "../users/entities/user.entity";

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly usersService: UsersService,
    private readonly employeesService: EmployeesService,
    private readonly servicesService: ServicesService,
    private readonly ordersService: OrdersService
  ) {}

  async createWalkIn(
    createWalkInBookingDto: CreateWalkInBookingDto,
    shop: ShopCode
  ): Promise<Booking> {
    const { serviceId, firstName, phoneNumber, isPaid } =
      createWalkInBookingDto;

    // Create temporary customer for walk-in
    const customer = await this.usersService.create({
      firstName,
      lastName: "Walk-in",
      email: `walkin_${Date.now()}@temp.com`,
      password: Math.random().toString(36),
      phoneNumber,
      role: UserRole.CUSTOMER,
    });

    // Verify service exists
    const service = await this.servicesService.findOne(serviceId);
    if (!service) {
      throw new NotFoundException("Service not found");
    }

    // Get all employees and filter active ones
    const allEmployees = await this.employeesService.findAll();
    const activeEmployees = allEmployees.filter((emp) => emp.isActive);

    if (activeEmployees.length === 0) {
      throw new BadRequestException("No employees available");
    }

    // Find the employee with the least pending bookings
    const employeeBookings = await Promise.all(
      activeEmployees.map(async (emp) => ({
        employee: emp,
        bookingCount: (await this.findByEmployee(emp.id)).length,
      }))
    );

    const sortedEmployeeBookings = employeeBookings.toSorted(
      (a, b) => a.bookingCount - b.bookingCount
    );
    const selectedEmployee = sortedEmployeeBookings[0].employee;

    // Calculate start and end times
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + service.duration * 60000);

    // Create and save the booking
    const booking = this.bookingRepository.create({
      customer,
      employee: selectedEmployee,
      service,
      startTime: startDate,
      endTime: endDate,
      notes: `Walk-in booking from ${shop.shopName}`,
      totalPrice: service.price,
      status: isPaid ? BookingStatus.CONFIRMED : BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  async create(createBookingDto: CreateBookingDto): Promise<Booking> {
    const { customerId, employeeId, serviceId, startTime, notes } =
      createBookingDto;

    // Verify customer exists
    const customer = await this.usersService.findOne(customerId);
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }

    // Verify employee exists
    const employee = await this.employeesService.findOne(employeeId);
    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    // Verify service exists
    const service = await this.servicesService.findOne(serviceId);
    if (!service) {
      throw new NotFoundException("Service not found");
    }

    // Calculate end time based on service duration
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + service.duration * 60000);

    // Check if employee is available
    const isAvailable = await this.employeesService.isAvailable(
      employeeId,
      startDate,
      endDate
    );

    if (!isAvailable) {
      throw new BadRequestException("Employee is not available at this time");
    }

    // Create and save the booking
    const booking = this.bookingRepository.create({
      customer,
      employee,
      service,
      startTime: startDate,
      endTime: endDate,
      notes,
      totalPrice: service.price,
      status: BookingStatus.PENDING,
    });

    return this.bookingRepository.save(booking);
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ["customer", "employee", "employee.user", "service"],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto
  ): Promise<Booking> {
    const booking = await this.findOne(id);

    // If updating start time, recalculate end time
    if (updateBookingDto.startTime) {
      const startDate = new Date(updateBookingDto.startTime);
      const service = await this.servicesService.findOne(booking.service.id);
      const endDate = new Date(startDate.getTime() + service.duration * 60000);

      // Check employee availability for new time
      const isAvailable = await this.employeesService.isAvailable(
        booking.employee.id,
        startDate,
        endDate,
        id // Exclude current booking from availability check
      );

      if (!isAvailable) {
        throw new BadRequestException("Employee is not available at this time");
      }

      booking.startTime = startDate;
      booking.endTime = endDate;
    }

    // Update other fields
    Object.assign(booking, updateBookingDto);

    return this.bookingRepository.save(booking);
  }

  async cancel(id: string, reason: string): Promise<Booking> {
    const booking = await this.findOne(id);

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;

    return this.bookingRepository.save(booking);
  }

  async findByCustomer(customerId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { customer: { id: customerId } },
      relations: ["customer", "employee", "employee.user", "service"],
      order: { startTime: "DESC" },
    });
  }

  async findByEmployee(employeeId: string): Promise<Booking[]> {
    return this.bookingRepository.find({
      where: { employee: { id: employeeId } },
      relations: ["customer", "employee", "employee.user", "service"],
      order: { startTime: "DESC" },
    });
  }

  async findUpcoming(): Promise<Booking[]> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    this.logger.debug(`Finding bookings from ${startOfDay.toISOString()}`);

    const bookings = await this.bookingRepository.find({
      where: {
        startTime: MoreThan(startOfDay),
        status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
      },
      relations: ["customer", "employee", "employee.user", "service"],
      order: { startTime: "ASC" },
    });

    this.logger.debug(`Found ${bookings.length} bookings`);
    if (bookings.length === 0) {
      this.logger.debug(
        "No bookings found. Checking all bookings for debugging..."
      );
      const allBookings = await this.bookingRepository.find({
        relations: ["customer", "employee", "employee.user", "service"],
      });
      this.logger.debug(`Total bookings in database: ${allBookings.length}`);
      this.logger.debug("Sample booking dates:");
      allBookings.slice(0, 3).forEach((booking) => {
        this.logger.debug(
          `Booking ${booking.id}: startTime=${booking.startTime}, status=${booking.status}`
        );
      });
    }

    return bookings;
  }

  async getUpcomingCount(): Promise<UpcomingCountResponseDto> {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const bookings = await this.bookingRepository.find({
      where: {
        startTime: Between(startOfDay, endOfDay),
        status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
      },
      relations: ["customer", "service"],
      order: { startTime: "ASC" },
    });

    const customers: UpcomingCustomerDto[] = bookings.map((booking, index) => {
      // Calculate waiting time based on previous bookings' service durations
      const waitingTime = bookings
        .slice(0, index)
        .reduce((total, prev) => total + prev.service.duration, 0);

      return {
        firstName: booking.customer.firstName,
        estimatedWaitingTime: waitingTime,
      };
    });

    return {
      count: bookings.length,
      customers,
    };
  }
}
