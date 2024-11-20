import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { BookingsService } from '../bookings/bookings.service';
import { BookingStatus } from '../bookings/entities/booking.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly bookingsService: BookingsService,
  ) {}

  async createFromBooking(bookingId: string): Promise<Order> {
    const booking = await this.bookingsService.findOne(bookingId);
    
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can be converted to orders');
    }

    const order = this.orderRepository.create({
      booking,
      totalAmount: booking.totalPrice,
      completedAt: new Date(),
    });

    await this.orderRepository.save(order);

    // Update booking status to completed
    await this.bookingsService.update(bookingId, {
      status: BookingStatus.COMPLETED,
    });

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }
}
