import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  async create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get(':id')
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Get('customer/:customerId')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  async findByCustomer(@Param('customerId') customerId: string) {
    return this.bookingsService.findByCustomer(customerId);
  }

  @Get('employee/:employeeId')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  async findByEmployee(@Param('employeeId') employeeId: string) {
    return this.bookingsService.findByEmployee(employeeId);
  }

  @Get('upcoming')
  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN)
  async findUpcoming() {
    return this.bookingsService.findUpcoming();
  }

  @Put(':id')
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Put(':id/cancel')
  @Roles(UserRole.CUSTOMER, UserRole.EMPLOYEE, UserRole.ADMIN)
  async cancel(
    @Param('id') id: string,
    @Body('reason') cancellationDto: { reason: string },
  ) {
    if (!cancellationDto.reason) {
      throw new BadRequestException('Cancellation reason is required');
    }
    return this.bookingsService.cancel(id, cancellationDto.reason);
  }
}
