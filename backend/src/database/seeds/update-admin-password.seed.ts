import { DataSource } from "typeorm";
import { User } from "../../users/entities/user.entity";
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

export const updateAdminPassword = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  try {
    // Read .env file directly and parse it properly
    const envPath = path.resolve(process.cwd(), '.env');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    
    const adminEmail = envConfig.ADMIN_EMAIL;
    const adminPassword = envConfig.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error(
        "Admin email and password must be set in environment variables",
      );
    }

    console.log("\nPassword analysis before update:");
    console.log("Raw password:", adminPassword);
    console.log("Length:", adminPassword.length);
    console.log("Character codes:");
    for (let i = 0; i < adminPassword.length; i++) {
      console.log(`${i}: '${adminPassword[i]}' (${adminPassword.charCodeAt(i)})`);
    }

    // Find admin user
    const adminUser = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    // Update with raw password - let the entity handle hashing
    adminUser.password = adminPassword;
    await userRepository.save(adminUser);
    console.log("Admin password updated in database");

    // Verify the update
    const updatedUser = await userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!updatedUser) {
      throw new Error("Could not verify password update");
    }

    // Use the entity's validatePassword method
    const isPasswordValid = await updatedUser.validatePassword(adminPassword);
    console.log("Password verification after update:", isPasswordValid);

  } catch (error) {
    console.error("Error updating admin password:", error);
    throw error;
  }
};
