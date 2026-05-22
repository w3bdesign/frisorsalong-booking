import { DataSource, Repository } from "typeorm";
import { User, UserRole } from "../../users/entities/user.entity";
import { Employee } from "../../employees/entities/employee.entity";
import { Service } from "../../services/entities/service.entity";
import { Booking, BookingStatus } from "../../bookings/entities/booking.entity";
import * as bcrypt from "bcrypt";
import { faker } from '@faker-js/faker';

interface StatusDistribution {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

interface StatusWeight {
  status: BookingStatus;
  weight: number;
}

const STATUS_WEIGHTS: StatusWeight[] = [
  { status: BookingStatus.CONFIRMED, weight: 0.7 },
  { status: BookingStatus.PENDING, weight: 0.2 },
  { status: BookingStatus.CANCELLED, weight: 0.1 },
];

function pickWeightedStatus(weights: StatusWeight[], bookingIndex: number): BookingStatus {
  const randomWeight = Math.random();
  let cumulativeWeight = 0;
  const selected = weights.find(sw => {
    cumulativeWeight += sw.weight;
    return randomWeight <= cumulativeWeight;
  });

  if (!selected) {
    throw new Error(`Failed to determine status for booking ${bookingIndex + 1}`);
  }
  return selected.status;
}

async function createCustomers(
  userRepository: Repository<User>,
  count: number,
): Promise<User[]> {
  const customers: User[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    try {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const customer = await userRepository.save({
        firstName,
        lastName,
        email: faker.internet.email({ firstName, lastName }),
        password: hashedPassword,
        role: UserRole.CUSTOMER,
        phoneNumber: '+47' + faker.string.numeric(8),
      });
      customers.push(customer);
    } catch (error) {
      const err = new Error(`Failed to create customer ${i + 1}`);
      console.error(`Error creating customer ${i + 1}:`, error);
      throw err;
    }
  }
  return customers;
}

function buildBooking(
  customer: User,
  employee: Employee,
  service: Service,
  now: Date,
  bookingIndex: number,
): Partial<Booking> {
  const status = pickWeightedStatus(STATUS_WEIGHTS, bookingIndex);

  const startTime = faker.date.between({
    from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
  });

  const duration: number = typeof service.duration === 'number' ? service.duration : 60;
  const endTime = new Date(startTime.getTime() + Number(duration) * 60 * 1000);

  const booking: Partial<Booking> = {
    customer,
    employee,
    service,
    startTime,
    endTime,
    status,
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.7 }) ?? undefined,
    totalPrice: service.price,
    reminderSent: startTime < now,
  };

  if (status === BookingStatus.CANCELLED) {
    addCancellationDetails(booking, startTime, now);
  }

  return booking;
}

function addCancellationDetails(
  booking: Partial<Booking>,
  startTime: Date,
  now: Date,
): void {
  const [fromDate, toDate] = startTime < now
    ? [startTime, now]
    : [now, startTime];

  booking.cancelledAt = faker.date.between({ from: fromDate, to: toDate });
  booking.cancellationReason = faker.lorem.sentence();
}

function computeStatusDistribution(bookings: Booking[]): StatusDistribution {
  return {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
    pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
    cancelled: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
  };
}

export const createSampleBookings = async (dataSource: DataSource): Promise<StatusDistribution> => {
  const userRepository: Repository<User> = dataSource.getRepository(User);
  const employeeRepository: Repository<Employee> = dataSource.getRepository(Employee);
  const serviceRepository: Repository<Service> = dataSource.getRepository(Service);
  const bookingRepository: Repository<Booking> = dataSource.getRepository(Booking);

  try {
    console.log('Starting to create sample bookings...');

    const employee = await employeeRepository.findOne({
      relations: ['user'],
      where: { user: { email: process.env.EMPLOYEE_EMAIL } },
    });

    if (!employee) {
      throw new Error("Employee not found. Please run initial data seed first.");
    }

    const services: Service[] = await serviceRepository.find();
    if (!services || services.length === 0) {
      throw new Error("No services found. Please run initial data seed first.");
    }

    console.log('Creating sample customers...');
    const customers: User[] = await createCustomers(userRepository, 10);
    console.log(`Created ${customers.length} sample customers`);

    const now = new Date();
    console.log('Creating sample bookings...');
    const bookings: Partial<Booking>[] = [];

    for (let i = 0; i < 20; i++) {
      const service: Service = faker.helpers.arrayElement(services);
      const customer: User = faker.helpers.arrayElement(customers);

      if (!service || !customer) {
        throw new Error(`Failed to select service or customer for booking ${i + 1}`);
      }

      bookings.push(buildBooking(customer, employee, service, now, i));
    }

    console.log('Saving bookings to database...');
    const savedBookings: Booking[] = await bookingRepository.save(bookings);

    if (!savedBookings || !Array.isArray(savedBookings)) {
      throw new Error('Failed to save bookings - no bookings returned from save operation');
    }

    const statusDistribution = computeStatusDistribution(savedBookings);
    console.log("Sample bookings created successfully");
    console.log("Status distribution:", statusDistribution);

    return statusDistribution;
  } catch (error) {
    console.error("Error creating sample bookings:", error);
    throw error;
  }
};
