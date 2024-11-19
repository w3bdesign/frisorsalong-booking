import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { createAdminUser } from './create-admin-user.seed';
import { User } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Service } from '../../services/entities/service.entity';
import { Booking } from '../../bookings/entities/booking.entity';

// Load environment variables
config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Employee, Service, Booking],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false
  },
});

async function runSeeds() {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Connected to database');

    // Run seeds
    await createAdminUser(dataSource);

    console.log('Seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

runSeeds();
