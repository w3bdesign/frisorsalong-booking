import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan, In } from "typeorm";
import { Booking, BookingStatus } from "./entities/booking.entity";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { UsersService } from "../users/users.service";
import { EmployeesService } from "../employees/employees.service";
import { ServicesService } from "../services/services.service";

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly usersService: UsersService,
    private readonly employeesService: EmployeesService,
    private readonly servicesService: ServicesService,
  ) {}

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
    const endDate = new Date(startDate.getTime() + service.duration * 60000); // Convert minutes to milliseconds

    // Check if employee is available
    const isAvailable = await this.employeesService.isAvailable(
      employeeId,
      startDate,
      endDate,
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
    updateBookingDto: UpdateBookingDto,
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
        id, // Exclude current booking from availability check
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
    this.logger.debug(`Finding upcoming bookings after ${now.toISOString()}`);
    
    const bookings = await this.bookingRepository.find({
      where: {
        startTime: MoreThan(now),
        status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
      },
      relations: ["customer", "employee", "employee.user", "service"],
      order: { startTime: "ASC" },
    });

    this.logger.debug(`Found ${bookings.length} upcoming bookings`);
    if (bookings.length === 0) {
      this.logger.debug('No upcoming bookings found. Checking all bookings for debugging...');
      const allBookings = await this.bookingRepository.find({
        relations: ["customer", "employee", "employee.user", "service"],
      });
      this.logger.debug(`Total bookings in database: ${allBookings.length}`);
      this.logger.debug('Sample booking dates:');
      allBookings.slice(0, 3).forEach(booking => {
        this.logger.debug(`Booking ${booking.id}: startTime=${booking.startTime}, status=${booking.status}`);
      });
    }

    return bookings;
  }

  async getUpcomingCount(): Promise<number> {
    const now = new Date();
    return this.bookingRepository.count({
      where: {
        startTime: MoreThan(now),
        status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED]),
      },
    });
  }
}
