import { DataSource } from "typeorm";
import { User, UserRole } from "../../users/entities/user.entity";
import { Employee } from "../../employees/entities/employee.entity";
import { Service } from "../../services/entities/service.entity";
import { Booking, BookingStatus } from "../../bookings/entities/booking.entity";
import * as bcrypt from "bcrypt";
import { faker } from '@faker-js/faker';

export const createSampleBookings = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const employeeRepository = dataSource.getRepository(Employee);
  const serviceRepository = dataSource.getRepository(Service);
  const bookingRepository = dataSource.getRepository(Booking);

  try {
    // Get the employee
    const employee = await employeeRepository.findOne({
      relations: ['user'],
      where: { user: { email: process.env.EMPLOYEE_EMAIL } }
    });

    if (!employee) {
      throw new Error("Employee not found. Please run initial data seed first.");
    }

    // Get all services
    const services = await serviceRepository.find();
    if (services.length === 0) {
      throw new Error("No services found. Please run initial data seed first.");
    }

    // Create 10 sample customers
    const customers = await Promise.all(
      Array(10).fill(null).map(async () => {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        return userRepository.save({
          firstName,
          lastName,
          email: faker.internet.email({ firstName, lastName }),
          password: await bcrypt.hash('password123', 10),
          role: UserRole.CUSTOMER,
          phoneNumber: '+47' + faker.string.numeric(8), // Norwegian phone number format
        });
      })
    );

    const now = new Date();
    const bookingStatuses = Object.values(BookingStatus);

    // Create 20 sample bookings
    const bookings = await Promise.all(
      Array(20).fill(null).map(async () => {
        const service = faker.helpers.arrayElement(services);
        const customer = faker.helpers.arrayElement(customers);
        const status = faker.helpers.arrayElement(bookingStatuses);
        
        // Generate random date within -14 to +14 days from now
        const startTime = faker.date.between({
          from: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
          to: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
        });
        
        const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);

        const booking: Partial<Booking> = {
          customer,
          employee,
          service,
          startTime,
          endTime,
          status,
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }),
          totalPrice: service.price,
          reminderSent: startTime < now,
        };

        // Add cancellation details if status is cancelled
        if (status === BookingStatus.CANCELLED) {
          // For past bookings, cancellation date is between start time and now
          // For future bookings, cancellation date is between now and start time
          const [fromDate, toDate] = startTime < now 
            ? [startTime, now]
            : [now, startTime];

          booking.cancelledAt = faker.date.between({
            from: fromDate,
            to: toDate
          });
          booking.cancellationReason = faker.lorem.sentence();
        }

        return booking;
      })
    );

    await bookingRepository.save(bookings);
    console.log("Sample bookings created successfully");

  } catch (error) {
    console.error("Error creating sample bookings:", error);
    throw error;
  }
};
