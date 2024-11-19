import { DataSource } from "typeorm";
import { User } from "../../users/entities/user.entity";
import * as bcrypt from "bcrypt";
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

export const loadEnvConfig = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  return dotenv.parse(fs.readFileSync(envPath));
};

export const createDataSource = (envConfig: any) => new DataSource({
  type: "postgres",
  url: envConfig.DATABASE_URL,
  entities: [User],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false
  }
});

export const verifyAdminPassword = async (dataSource: DataSource, adminEmail: string, adminPassword: string) => {
  try {
    const userRepository = dataSource.getRepository(User);

    console.log("\nPassword analysis:");
    console.log("Raw password:", adminPassword);
    console.log("Length:", adminPassword.length);
    console.log("Character codes:");
    for (let i = 0; i < adminPassword.length; i++) {
      console.log(`${i}: '${adminPassword[i]}' (${adminPassword.charCodeAt(i)})`);
    }

    // Find admin user
    const adminUser = await userRepository.findOne({
      where: { email: adminEmail },
      select: ["id", "email", "password"] // Explicitly select password field
    });

    if (!adminUser) {
      throw new Error("Admin user not found");
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

    return {
      isValid: isPasswordValid,
      newHashValid: verifyNewHash,
      storedHash: adminUser.password,
      newHash,
    };
  } catch (error) {
    console.error("Error verifying password:", error);
    throw error;
  }
};

export const runVerification = async (dataSource: DataSource, envConfig: any) => {
  try {
    await dataSource.initialize();
    console.log("Connected to database");

    const adminEmail = envConfig.ADMIN_EMAIL;
    const adminPassword = envConfig.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error("Admin email and password must be set in environment variables");
    }

    return await verifyAdminPassword(dataSource, adminEmail, adminPassword);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

// Only run if this file is being executed directly
if (require.main === module) {
  const envConfig = loadEnvConfig();
  const dataSource = createDataSource(envConfig);

  runVerification(dataSource, envConfig)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
