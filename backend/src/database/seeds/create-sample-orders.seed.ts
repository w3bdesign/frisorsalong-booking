import { DataSource, Repository } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { Booking, BookingStatus } from "../../bookings/entities/booking.entity";

export const createSampleOrders = async (dataSource: DataSource): Promise<void> => {
  // Initialize repositories with proper typing
  const bookingRepository: Repository<Booking> = dataSource.getRepository(Booking);
  const orderRepository: Repository<Order> = dataSource.getRepository(Order);

  try {
    console.log('Starting to create sample orders...');

    // Get all confirmed bookings that don't have orders yet
    const confirmedBookings = await bookingRepository.find({
      where: { status: BookingStatus.CONFIRMED },
      relations: ["customer", "employee", "service"],
    });

    if (!confirmedBookings || !Array.isArray(confirmedBookings)) {
      throw new Error('Failed to fetch confirmed bookings');
    }

    console.log(`Found ${confirmedBookings.length} confirmed bookings`);

    // Take first 20 confirmed bookings (or less if fewer exist)
    const numberOfOrders = Math.min(20, confirmedBookings.length);
    const selectedBookings = confirmedBookings.slice(0, numberOfOrders);

    console.log(`Creating ${numberOfOrders} orders...`);

    const createdOrders: Order[] = [];
    for (const booking of selectedBookings) {
      // Verify booking has required properties
      if (!booking.id || !booking.totalPrice) {
        console.error(`Invalid booking data: ${JSON.stringify(booking)}`);
        continue;
      }

      try {
        // Create order with proper type
        const order = orderRepository.create({
          booking: booking,
          completedAt: new Date(),
          totalAmount: booking.totalPrice,
          notes: `Order created for booking ${booking.id}`,
        });

        if (!order) {
          throw new Error(`Failed to create order for booking ${booking.id}`);
        }

        // Save order with proper error handling
        const savedOrder = await orderRepository.save(order);
        if (!savedOrder) {
          throw new Error(`Failed to save order for booking ${booking.id}`);
        }

        createdOrders.push(savedOrder);

        // Update booking status to completed
        booking.status = BookingStatus.COMPLETED;
        const updatedBooking = await bookingRepository.save(booking);
        
        if (!updatedBooking) {
          throw new Error(`Failed to update status for booking ${booking.id}`);
        }

        console.log(`Created order ${savedOrder.id} for booking ${booking.id}`);
      } catch (error) {
        // Log error but continue processing other bookings
        console.error(`Error processing booking ${booking.id}:`, error instanceof Error ? error.message : String(error));
        continue;
      }
    }

    if (createdOrders.length === 0) {
      throw new Error('No orders were created successfully');
    }

    console.log(`Successfully created ${createdOrders.length} sample orders`);

  } catch (error) {
    console.error("Error creating sample orders:", error);
    throw error;
  }
};
