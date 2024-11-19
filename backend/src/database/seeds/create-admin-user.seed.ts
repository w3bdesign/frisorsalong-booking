import { DataSource } from "typeorm";
import { User, UserRole } from "../../users/entities/user.entity";
import * as bcrypt from "bcrypt";

export const createAdminUser = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        "Admin email and password must be set in environment variables",
      );
    }

    // Check if admin user already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminUser = userRepository.create({
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: UserRole.ADMIN,
      });

      await userRepository.save(adminUser);
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};
