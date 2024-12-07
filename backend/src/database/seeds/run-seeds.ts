import { DataSource, DataSourceOptions } from "typeorm";
import { config } from 'dotenv';
import { createAdminUser } from "./create-admin-user.seed";
import { createInitialData } from "./create-initial-data.seed";
import { createSampleBookings } from "./create-sample-bookings.seed";
import { createSampleOrders } from "./create-sample-orders.seed";

// Load environment variables
config();

export const createDataSource = (): DataSource => {
  const options: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: ['src/**/*.entity{.ts,.js}'],
    synchronize: false,
    ssl: {
      rejectUnauthorized: false
    }
  };

  if (!options.url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  try {
    return new DataSource(options);
  } catch (error) {
    throw new Error(`Failed to create DataSource: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const runSeeds = async (dataSource: DataSource): Promise<boolean> => {
  if (!dataSource || typeof dataSource.initialize !== 'function') {
    throw new Error('Invalid DataSource provided');
  }

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error running seeds:', errorMessage);
    throw new Error(`Seed operation failed: ${errorMessage}`);
  }
};

// Only run seeds if this file is being run directly
if (require.main === module) {
  let dataSource: DataSource | undefined;
  
  try {
    dataSource = createDataSource();
    
    runSeeds(dataSource)
      .then(async () => {
        if (dataSource && typeof dataSource.destroy === 'function') {
          await dataSource.destroy();
        }
        process.exit(0);
      })
      .catch((error) => {
        console.error('Seed process failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
      });
  } catch (error) {
    console.error('Failed to create DataSource:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
