import { config } from "dotenv";
import { DataSource } from "typeorm";
import { updateAdminPassword } from "./update-admin-password.seed";
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

export const createDataSource = (envConfig: any) => new DataSource({
  type: "postgres",
  url: envConfig.DATABASE_URL,
  entities: ["src/**/*.entity{.ts,.js}"],
  synchronize: false,
  ssl: {
    rejectUnauthorized: false
  }
});

export const loadEnvConfig = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  return dotenv.parse(fs.readFileSync(envPath));
};

export const runPasswordUpdate = async (dataSource: DataSource) => {
  try {
    await dataSource.initialize();
    console.log("Connected to database");

    await updateAdminPassword(dataSource);

    console.log("Password update completed successfully");
    return true;
  } catch (error) {
    console.error("Error running seed:", error);
    throw error;
  }
};

// Only run if this file is being executed directly
if (require.main === module) {
  const envConfig = loadEnvConfig();
  const dataSource = createDataSource(envConfig);

  runPasswordUpdate(dataSource)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
