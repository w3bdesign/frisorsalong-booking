import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@Controller("bookings")
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get("upcoming/count")
  async getUpcomingCount() {
    return { count: await this.bookingsService.getUpcomingCount() };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  async create(@Body() createBookingDto: CreateBookingDto) {
    const booking = await this.bookingsService.create(createBookingDto);
    return BookingResponseDto.fromEntity(booking);
  }

  @Get("upcoming")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  async findUpcoming() {
    const bookings = await this.bookingsService.findUpcoming();
    return BookingResponseDto.fromEntities(bookings);
  }

  @Get("customer/:customerId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  async findByCustomer(@Param("customerId") customerId: string) {
    const bookings = await this.bookingsService.findByCustomer(customerId);
    return BookingResponseDto.fromEntities(bookings);
  }

  @Get("employee/:employeeId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  async findByEmployee(@Param("employeeId") employeeId: string) {
    const bookings = await this.bookingsService.findByEmployee(employeeId);
    return BookingResponseDto.fromEntities(bookings);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async findOne(@Param("id") id: string) {
    const booking = await this.bookingsService.findOne(id);
    return BookingResponseDto.fromEntity(booking);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async update(
    @Param("id") id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    const booking = await this.bookingsService.update(id, updateBookingDto);
    return BookingResponseDto.fromEntity(booking);
  }

  @Put(":id/cancel")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async cancel(
    @Param("id") id: string,
    @Body() cancellationDto: { reason: string },
  ) {
    if (!cancellationDto?.reason) {
      throw new BadRequestException("Cancellation reason is required");
    }
    const booking = await this.bookingsService.cancel(id, cancellationDto.reason);
    return BookingResponseDto.fromEntity(booking);
  }
}
