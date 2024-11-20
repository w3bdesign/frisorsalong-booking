import { DataSource } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { Booking, BookingStatus } from "../../bookings/entities/booking.entity";
import { faker } from '@faker-js/faker';

export const createSampleOrders = async (dataSource: DataSource): Promise<void> => {
  const bookingRepository = dataSource.getRepository(Booking);
  const orderRepository = dataSource.getRepository(Order);

  try {
    console.log('Starting to create sample orders...');

    // Get all confirmed bookings that don't have orders yet
    const confirmedBookings = await bookingRepository.find({
      where: { status: BookingStatus.CONFIRMED },
      relations: ["customer", "employee", "service"],
    });

    console.log(`Found ${confirmedBookings.length} confirmed bookings`);

    // Take 50 random confirmed bookings
    const numberOfOrders = Math.min(50, confirmedBookings.length);
    const selectedBookings = faker.helpers.shuffle([...confirmedBookings]).slice(0, numberOfOrders);

    console.log(`Creating ${numberOfOrders} orders...`);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const createdOrders = [];
    for (const booking of selectedBookings) {
      // Create order with a random completion date in the past 30 days
      const completedAt = faker.date.between({
        from: thirtyDaysAgo,
        to: now,
      });

      const order = orderRepository.create({
        booking: booking,
        completedAt: completedAt,
        totalAmount: booking.totalPrice,
        notes: `Completed service for ${booking.customer.firstName} ${booking.customer.lastName}`,
      });

      const savedOrder = await orderRepository.save(order);
      createdOrders.push(savedOrder);

      // Update booking status to completed
      booking.status = BookingStatus.COMPLETED;
      await bookingRepository.save(booking);

      console.log(`Created order ${savedOrder.id} for booking ${booking.id}`);
    }

    console.log(`Successfully created ${createdOrders.length} sample orders`);

  } catch (error) {
    console.error("Error creating sample orders:", error);
    throw error;
  }
};
