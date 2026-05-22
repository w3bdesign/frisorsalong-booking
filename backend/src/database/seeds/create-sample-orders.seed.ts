import { DataSource, Repository } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { Booking, BookingStatus } from "../../bookings/entities/booking.entity";

/** Safely extract an error message from an unknown caught value */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error';
}

async function fetchConfirmedBookings(
  bookingRepository: Repository<Booking>,
): Promise<Booking[]> {
  const confirmedBookings = await bookingRepository.find({
    where: { status: BookingStatus.CONFIRMED },
    relations: ["customer", "employee", "service"],
  });

  if (!confirmedBookings || !Array.isArray(confirmedBookings)) {
    throw new Error('Failed to fetch confirmed bookings');
  }

  return confirmedBookings;
}

async function createOrderFromBooking(
  booking: Booking,
  orderRepository: Repository<Order>,
  bookingRepository: Repository<Booking>,
): Promise<Order> {
  const order = orderRepository.create({
    booking: booking,
    completedAt: new Date(),
    totalAmount: booking.totalPrice,
    notes: `Order created for booking ${booking.id}`,
  });

  if (!order) {
    throw new Error(`Failed to create order for booking ${booking.id}`);
  }

  const savedOrder: Order = await orderRepository.save(order);
  if (!savedOrder) {
    throw new Error(`Failed to save order for booking ${booking.id}`);
  }

  booking.status = BookingStatus.COMPLETED;
  const updatedBooking = await bookingRepository.save(booking);

  if (!updatedBooking) {
    throw new Error(`Failed to update status for booking ${booking.id}`);
  }

  return savedOrder;
}

export const createSampleOrders = async (dataSource: DataSource): Promise<void> => {
  const bookingRepository: Repository<Booking> = dataSource.getRepository(Booking);
  const orderRepository: Repository<Order> = dataSource.getRepository(Order);

  try {
    console.log('Starting to create sample orders...');

    const confirmedBookings = await fetchConfirmedBookings(bookingRepository);
    console.log(`Found ${confirmedBookings.length} confirmed bookings`);

    const numberOfOrders = Math.min(20, confirmedBookings.length);
    const selectedBookings = confirmedBookings.slice(0, numberOfOrders);
    console.log(`Creating ${numberOfOrders} orders...`);

    const createdOrders: Order[] = [];
    for (const booking of selectedBookings) {
      if (!booking.id || !booking.totalPrice) {
        console.error(`Invalid booking data: ${JSON.stringify(booking)}`);
        continue;
      }

      try {
        const savedOrder = await createOrderFromBooking(booking, orderRepository, bookingRepository);
        createdOrders.push(savedOrder);
        console.log(`Created order ${savedOrder.id} for booking ${booking.id}`);
      } catch (error: unknown) {
        console.error(`Error processing booking ${booking.id}:`, getErrorMessage(error));
        continue;
      }
    }

    if (createdOrders.length === 0) {
      throw new Error('No orders were created successfully');
    }

    console.log(`Successfully created ${createdOrders.length} sample orders`);
  } catch (error: unknown) {
    console.error("Error creating sample orders:", getErrorMessage(error));
    throw error;
  }
};
