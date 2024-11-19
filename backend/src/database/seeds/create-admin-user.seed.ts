import { DataSource } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export const createAdminUser = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  // Check if admin user already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@hairsalon.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);

    const adminUser = userRepository.create({
      email: 'admin@hairsalon.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });

    await userRepository.save(adminUser);
    console.log('Admin user created successfully');
  } else {
    console.log('Admin user already exists');
  }
};
