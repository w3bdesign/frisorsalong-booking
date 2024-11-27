import { DataSource } from "typeorm";
import { config } from "dotenv";
import { join } from "path";

// Load environment variables
config();

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, "src", "**", "*.entity{.ts,.js}")],
  migrations: [
    join(
      __dirname,
      "src",
      "database",
      "migrations",
      "1731981975581-InitialMigration.ts"
    ),
    join(
      __dirname,
      "src",
      "database",
      "migrations",
      "1731981975582-CreateBookingSystem.ts"
    ),
    join(
      __dirname,
      "src",
      "database",
      "migrations",
      "1731981975584-AddShopCodes.ts"
    ),
  ],
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  ssl: {
    rejectUnauthorized: false,
  },
});
