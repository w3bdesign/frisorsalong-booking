import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { createAdminUser } from './create-admin-user.seed';

// Load environment variables
config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runSeeds() {
  try {
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
