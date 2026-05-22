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
  }) as Booking[] | null;

  if (!confirmedBookings || !Array.isArray(confirmedBookings)) {
    throw new Error('Failed to fetch confirmed bookings');
  }

  return confirmedBookings;
}

async function saveOrder(
  booking: Booking,
  orderRepository: Repository<Order>,
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

  return savedOrder;
}

async function markBookingCompleted(
  booking: Booking,
  bookingRepository: Repository<Booking>,
): Promise<void> {
  booking.status = BookingStatus.COMPLETED;
  await bookingRepository.save(booking);
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
        const savedOrder = await saveOrder(booking, orderRepository);
        createdOrders.push(savedOrder);

        // Update booking status — failure here doesn't invalidate the order
        try {
          await markBookingCompleted(booking, bookingRepository);
        } catch (statusError: unknown) {
          console.error(`Failed to update status for booking ${booking.id}:`, getErrorMessage(statusError));
        }

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
