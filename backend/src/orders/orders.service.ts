import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
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
    @Inject(forwardRef(() => BookingsService))
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

    // Check if order already exists for this booking
    const existingOrder = await this.orderRepository.findOne({
      where: { booking: { id: bookingId } },
    });

    if (existingOrder) {
      throw new BadRequestException(`Order already exists for booking ${bookingId}`);
    }

    // Create new order with current timestamp
    const now = new Date();
    const order = this.orderRepository.create({
      booking,
      totalAmount: booking.totalPrice,
      completedAt: now,
      notes: `Order created for booking ${bookingId}`,
    });

    // Save the order first
    const savedOrder = await this.orderRepository.save(order);

    // Update booking status to completed
    await this.bookingsService.update(bookingId, {
      status: BookingStatus.COMPLETED, // Using the enum value directly
      notes: `Completed at ${now.toISOString()}`
    });

    // Return the order with relations
    return this.findOne(savedOrder.id);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['booking', 'booking.customer', 'booking.employee', 'booking.service'],
      order: {
        completedAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['booking', 'booking.customer', 'booking.employee', 'booking.service'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }
}
