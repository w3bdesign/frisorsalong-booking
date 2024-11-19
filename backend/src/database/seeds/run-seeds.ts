import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { createAdminUser } from './create-admin-user.seed';
import { createInitialData } from './create-initial-data.seed';

// Load environment variables
config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity{.ts,.js}'],
  synchronize: false,
});

const runSeeds = async () => {
  try {
    await dataSource.initialize();
    console.log('Connected to database');

    // Run seeds
    await createAdminUser(dataSource);
    await createInitialData(dataSource);

    console.log('All seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
};

runSeeds();
