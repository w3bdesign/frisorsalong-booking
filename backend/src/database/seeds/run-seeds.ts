import { DataSource } from "typeorm";
import { config } from 'dotenv';
import { createAdminUser } from "./create-admin-user.seed";
import { createInitialData } from "./create-initial-data.seed";
import { createSampleBookings } from "./create-sample-bookings.seed";
import { createSampleOrders } from "./create-sample-orders.seed";

// Load environment variables
config();

export const createDataSource = () => {
  return new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: false,
    ssl: {
      rejectUnauthorized: false
    }
  });
};

export const runSeeds = async (dataSource: DataSource): Promise<boolean> => {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // Create admin user first
    console.log('Creating admin user...');
    await createAdminUser(dataSource);

    // Create initial data (services, employees)
    console.log('Creating initial data...');
    await createInitialData(dataSource);

    // Create sample bookings
    console.log('Creating sample bookings...');
    await createSampleBookings(dataSource);

    // Create sample orders from confirmed bookings
    console.log('Creating sample orders...');
    await createSampleOrders(dataSource);

    console.log('All seeds completed successfully');
    return true;
  } catch (error) {
    console.error('Error running seeds:', error);
    throw error;
  }
};

// Only run seeds if this file is being run directly
if (require.main === module) {
  const dataSource = createDataSource();
  runSeeds(dataSource)
    .then(async () => {
      await dataSource.destroy();
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed process failed:', error);
      process.exit(1);
    });
}
