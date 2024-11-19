import { DataSource } from "typeorm";
import { config } from "dotenv";
import { createAdminUser } from "./create-admin-user.seed";
import { createInitialData } from "./create-initial-data.seed";
import { createSampleBookings } from "./create-sample-bookings.seed";

// Load environment variables
config();

export const createDataSource = () => new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: ["src/**/*.entity{.ts,.js}"],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false
  }
});

export const runSeeds = async (dataSource: DataSource) => {
  try {
    await dataSource.initialize();
    console.log("Connected to database");

    // Run seeds in sequence
    await createAdminUser(dataSource);
    await createInitialData(dataSource);
    await createSampleBookings(dataSource);

    console.log("All seeds completed successfully");
    return true;
  } catch (error) {
    console.error("Error running seeds:", error);
    throw error;
  }
};

// Only run if this file is being executed directly
if (require.main === module) {
  const dataSource = createDataSource();

  runSeeds(dataSource)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
