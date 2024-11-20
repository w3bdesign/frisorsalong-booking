import { DataSource } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { Booking, BookingStatus } from "../../bookings/entities/booking.entity";

export const createSampleOrders = async (dataSource: DataSource): Promise<void> => {
  const bookingRepository = dataSource.getRepository(Booking);
  const orderRepository = dataSource.getRepository(Order);

  try {
    // Get all confirmed bookings that don't have orders yet
    const confirmedBookings = await bookingRepository.find({
      where: { status: BookingStatus.CONFIRMED },
      relations: ["customer", "employee", "service"],
    });

    // Create 20 orders or less if there aren't enough confirmed bookings
    const numberOfOrders = Math.min(20, confirmedBookings.length);
    const selectedBookings = confirmedBookings.slice(0, numberOfOrders);

    for (const booking of selectedBookings) {
      // Create order
      const order = orderRepository.create({
        booking: booking,
        completedAt: new Date(),
        totalAmount: booking.totalPrice,
        notes: `Sample order for booking ${booking.id}`,
      });

      await orderRepository.save(order);

      // Update booking status
      booking.status = BookingStatus.COMPLETED;
      await bookingRepository.save(booking);
    }

    console.log("Sample orders created successfully");
  } catch (error) {
    console.error("Error creating sample orders:", error);
    throw error;
  }
};
