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
    console.log('Starting to create sample bookings...');

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
    console.log('Creating sample customers...');
    const customers = [];
    for (let i = 0; i < 10; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const customer = await userRepository.save({
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }),
        password: await bcrypt.hash('password123', 10),
        role: UserRole.CUSTOMER,
        phoneNumber: '+47' + faker.string.numeric(8),
      });
      customers.push(customer);
    }
    console.log(`Created ${customers.length} sample customers`);

    const now = new Date();
    // Weighted status distribution to ensure more confirmed bookings
    const statusWeights = [
      { status: BookingStatus.CONFIRMED, weight: 0.7 },  // 70% confirmed
      { status: BookingStatus.PENDING, weight: 0.2 },    // 20% pending
      { status: BookingStatus.CANCELLED, weight: 0.1 },  // 10% cancelled
    ];

    // Create 20 sample bookings
    console.log('Creating sample bookings...');
    const bookings: Partial<Booking>[] = [];
    for (let i = 0; i < 20; i++) {
      const service = faker.helpers.arrayElement(services);
      const customer = faker.helpers.arrayElement(customers);
      
      // Use weighted random status
      const randomWeight = Math.random();
      let cumulativeWeight = 0;
      const status = statusWeights.find(sw => {
        cumulativeWeight += sw.weight;
        return randomWeight <= cumulativeWeight;
      }).status;
      
      // Generate dates across a wider range (-30 to +30 days)
      const startTime = faker.date.between({
        from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
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
        const [fromDate, toDate] = startTime < now 
          ? [startTime, now]
          : [now, startTime];

        booking.cancelledAt = faker.date.between({
          from: fromDate,
          to: toDate
        });
        booking.cancellationReason = faker.lorem.sentence();
      }

      bookings.push(booking);
    }

    console.log('Saving bookings to database...');
    const savedBookings = await bookingRepository.save(bookings);
    
    if (!savedBookings) {
      throw new Error('Failed to save bookings - no bookings returned from save operation');
    }

    const statusDistribution = {
      total: savedBookings.length,
      confirmed: savedBookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
      pending: savedBookings.filter(b => b.status === BookingStatus.PENDING).length,
      cancelled: savedBookings.filter(b => b.status === BookingStatus.CANCELLED).length,
    };

    console.log("Sample bookings created successfully");
    console.log("Status distribution:", statusDistribution);

    return statusDistribution;

  } catch (error) {
    console.error("Error creating sample bookings:", error);
    throw error;
  }
};
