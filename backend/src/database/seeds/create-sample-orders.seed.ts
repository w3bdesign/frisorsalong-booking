import { DataSource } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { Booking, BookingStatus } from "../../bookings/entities/booking.entity";

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

    // Take first 20 confirmed bookings (or less if fewer exist)
    const numberOfOrders = Math.min(20, confirmedBookings.length);
    const selectedBookings = confirmedBookings.slice(0, numberOfOrders);

    console.log(`Creating ${numberOfOrders} orders...`);

    const createdOrders = [];
    for (const booking of selectedBookings) {
      const order = orderRepository.create({
        booking: booking,
        completedAt: new Date(),
        totalAmount: booking.totalPrice,
        notes: `Order created for booking ${booking.id}`,
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
