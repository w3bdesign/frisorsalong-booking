import { DataSource } from "typeorm";
import { createAdminUser } from "./create-admin-user.seed";
import { createInitialData } from "./create-initial-data.seed";
import { createSampleBookings } from "./create-sample-bookings.seed";
import { createSampleOrders } from "./create-sample-orders.seed";

const runSeeds = async (dataSource: DataSource) => {
  // Create admin user first
  await createAdminUser(dataSource);

  // Create initial data (services, employees)
  await createInitialData(dataSource);

  // Create sample bookings
  await createSampleBookings(dataSource);

  // Create sample orders from confirmed bookings
  await createSampleOrders(dataSource);
};

export default runSeeds;
