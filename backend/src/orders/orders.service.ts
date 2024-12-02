import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingStatus } from '../bookings/entities/booking.entity';
import { EmployeesService } from '../employees/employees.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly employeesService: EmployeesService,
  ) {}

  async createFromBooking(bookingId: string): Promise<Order> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['customer', 'employee', 'service'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking #${bookingId} not found`);
    }

    // Update booking status to completed
    booking.status = BookingStatus.COMPLETED;
    await this.bookingRepository.save(booking);

    // Create order
    const order = this.orderRepository.create({
      booking,
      completedAt: new Date(),
      totalAmount: booking.totalPrice,
    });

    return this.orderRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: [
        'booking',
        'booking.customer',
        'booking.employee',
        'booking.employee.user',
        'booking.service',
      ],
      order: { completedAt: 'DESC' },
    });
  }

  async findAllByEmployee(userId: string): Promise<Order[]> {
    // First get the employee record using the user ID
    const employee = await this.employeesService.findByUserId(userId);

    return this.orderRepository.find({
      where: {
        booking: {
          employee: {
            id: employee.id,
          },
        },
      },
      relations: [
        'booking',
        'booking.customer',
        'booking.employee',
        'booking.employee.user',
        'booking.service',
      ],
      order: { completedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'booking',
        'booking.customer',
        'booking.employee',
        'booking.employee.user',
        'booking.service',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }

  async findOneByEmployee(id: string, userId: string): Promise<Order> {
    // First get the employee record using the user ID
    const employee = await this.employeesService.findByUserId(userId);

    const order = await this.orderRepository.findOne({
      where: {
        id,
        booking: {
          employee: {
            id: employee.id,
          },
        },
      },
      relations: [
        'booking',
        'booking.customer',
        'booking.employee',
        'booking.employee.user',
        'booking.service',
      ],
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }
}
