import { DataSource } from "typeorm";
import { User } from "../../users/entities/user.entity";
import * as bcrypt from "bcrypt";
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

const verifyPassword = async () => {
  try {
    // Read .env file directly and parse it properly
    const envPath = path.resolve(process.cwd(), '.env');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    
    const dataSource = new DataSource({
      type: "postgres",
      url: envConfig.DATABASE_URL,
      entities: ["src/**/*.entity{.ts,.js}"],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false
      }
    });

    await dataSource.initialize();
    console.log("Connected to database");

    const adminEmail = envConfig.ADMIN_EMAIL;
    const adminPassword = envConfig.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin email and password must be set in environment variables");
    }

    console.log("\nPassword analysis:");
    console.log("Raw password:", adminPassword);
    console.log("Length:", adminPassword.length);
    console.log("Character codes:");
    for (let i = 0; i < adminPassword.length; i++) {
      console.log(`${i}: '${adminPassword[i]}' (${adminPassword.charCodeAt(i)})`);
    }

    const userRepository = dataSource.getRepository(User);

    // Find admin user
    const adminUser = await userRepository.findOne({
      where: { email: adminEmail },
      select: ["id", "email", "password"] // Explicitly select password field
    });

    if (!adminUser) {
      console.log("Admin user not found");
      process.exit(1);
    }

    console.log("\nAdmin user found");
    console.log("Email:", adminUser.email);
    console.log("Stored hash:", adminUser.password);
    
    // Test password verification
    const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password);
    console.log("Password verification result:", isPasswordValid);

    // Create a new hash for comparison
    const newHash = await bcrypt.hash(adminPassword, 10);
    console.log("\nNew hash created with same password:", newHash);
    const verifyNewHash = await bcrypt.compare(adminPassword, newHash);
    console.log("Verification with new hash:", verifyNewHash);

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

verifyPassword();
