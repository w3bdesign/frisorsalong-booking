import { config } from "dotenv";
import { DataSource } from "typeorm";
import { updateAdminPassword } from "./update-admin-password.seed";
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

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

const runSeed = async () => {
  try {
    await dataSource.initialize();
    console.log("Connected to database");

    await updateAdminPassword(dataSource);

    console.log("Password update completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error running seed:", error);
    process.exit(1);
  }
};

runSeed();
