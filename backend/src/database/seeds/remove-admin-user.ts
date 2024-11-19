import { DataSource } from "typeorm";
import { config } from "dotenv";
import { User } from "../../users/entities/user.entity";

// Load environment variables
config();

export const createDataSource = () => new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [User],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function removeAdminUser(dataSource: DataSource) {
  try {
    const userRepository = dataSource.getRepository(User);
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      throw new Error("Admin email must be set in environment variables");
    }

    const result = await userRepository.delete({ email: adminEmail });

    if (result.affected > 0) {
      console.log("Admin user removed successfully");
      return true;
    } else {
      console.log("Admin user not found");
      return false;
    }
  } catch (error) {
    console.error("Error removing admin user:", error);
    throw error;
  }
}

// Only run if this file is being executed directly
if (require.main === module) {
  const dataSource = createDataSource();

  async function main() {
    try {
      console.log("Connecting to database...");
      await dataSource.initialize();
      console.log("Connected to database");

      await removeAdminUser(dataSource);
      process.exit(0);
    } catch (error) {
      console.error("Error in main:", error);
      process.exit(1);
    }
  }

  main();
}
