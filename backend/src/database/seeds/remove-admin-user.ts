import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../../users/entities/user.entity';

// Load environment variables
config();

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false
  },
});

async function removeAdminUser() {
  try {
    console.log('Connecting to database...');
    await dataSource.initialize();
    console.log('Connected to database');

    const userRepository = dataSource.getRepository(User);
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      throw new Error('Admin email must be set in environment variables');
    }

    const result = await userRepository.delete({ email: adminEmail });

    if (result.affected > 0) {
      console.log('Admin user removed successfully');
    } else {
      console.log('Admin user not found');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error removing admin user:', error);
    process.exit(1);
  }
}

removeAdminUser();
