import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  BadRequestException,
  Req,
} from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { OrdersService } from "../orders/orders.service";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { CreateWalkInBookingDto } from "./dto/create-walk-in-booking.dto";
import { UpdateBookingDto } from "./dto/update-booking.dto";
import { BookingResponseDto } from "./dto/booking-response.dto";
import { UpcomingCountResponseDto } from "./dto/upcoming-count-response.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ShopCodeGuard } from "../shops/guards/shop-code.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/entities/user.entity";
import { Request } from "express";
import { Shop } from "../shops/entities/shop.entity";

// Extend Express Request to include shop property
interface RequestWithShop extends Request {
  shop: Shop;
}

@Controller("bookings")
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly ordersService: OrdersService
  ) {}

  @Get("upcoming/count")
  async getUpcomingCount(): Promise<UpcomingCountResponseDto> {
    return this.bookingsService.getUpcomingCount();
  }

  @Post("walk-in")
  @UseGuards(ShopCodeGuard)
  async createWalkIn(
    @Body() createWalkInBookingDto: CreateWalkInBookingDto,
    @Req() request: RequestWithShop
  ): Promise<BookingResponseDto> {
    // Get shop from request (added by ShopCodeGuard)
    const shop = request.shop;
    if (!shop) {
      throw new BadRequestException('Shop information is required for walk-in bookings');
    }

    const booking = await this.bookingsService.createWalkIn(
      createWalkInBookingDto,
      shop
    );
    return BookingResponseDto.fromEntity(booking);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  async create(@Body() createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    const booking = await this.bookingsService.create(createBookingDto);
    return BookingResponseDto.fromEntity(booking);
  }

  @Get("upcoming")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  async findUpcoming(): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingsService.findUpcoming();
    return BookingResponseDto.fromEntities(bookings);
  }

  @Get("customer/:customerId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  async findByCustomer(@Param("customerId") customerId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingsService.findByCustomer(customerId);
    return BookingResponseDto.fromEntities(bookings);
  }

  @Get("employee/:employeeId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  async findByEmployee(@Param("employeeId") employeeId: string): Promise<BookingResponseDto[]> {
    const bookings = await this.bookingsService.findByEmployee(employeeId);
    return BookingResponseDto.fromEntities(bookings);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async findOne(@Param("id") id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingsService.findOne(id);
    return BookingResponseDto.fromEntity(booking);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async update(
    @Param("id") id: string,
    @Body() updateBookingDto: UpdateBookingDto
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingsService.update(id, updateBookingDto);
    return BookingResponseDto.fromEntity(booking);
  }

  @Put(":id/cancel")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async cancel(@Param("id") id: string): Promise<BookingResponseDto> {
    // For admin cancellations, use a default reason
    const reason = "Cancelled by administrator";
    const booking = await this.bookingsService.cancel(id, reason);
    return BookingResponseDto.fromEntity(booking);
  }

  @Put(":id/complete")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async complete(@Param("id") id: string) {
    // Create an order for the booking
    const order = await this.ordersService.createFromBooking(id);
    return order;
  }
}
