import { DataSource } from "typeorm";
import { config } from 'dotenv';
import { createAdminUser } from "./create-admin-user.seed";
import { createInitialData } from "./create-initial-data.seed";
import { createSampleBookings } from "./create-sample-bookings.seed";
import { createSampleOrders } from "./create-sample-orders.seed";

// Load environment variables
config();

const runSeeds = async (dataSource: DataSource) => {
  try {
    console.log('Starting seed process...');

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

    console.log('Seed process completed successfully');
  } catch (error) {
    console.error('Error during seed process:', error);
    throw error;
  }
};

// Create and initialize DataSource
const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false
  }
});

// Run seeds
dataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized');
    await runSeeds(dataSource);
    await dataSource.destroy();
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
    process.exit(1);
  });

export default runSeeds;
