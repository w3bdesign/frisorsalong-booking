import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { createDataSource, runSeeds } from "./run-seeds";
import { createAdminUser } from "./create-admin-user.seed";
import { createInitialData } from "./create-initial-data.seed";
import { createSampleBookings } from "./create-sample-bookings.seed";
import { createSampleOrders } from "./create-sample-orders.seed";

// Mock the DataSource class
jest.mock("typeorm", () => {
  const originalModule = jest.requireActual("typeorm");
  return {
    ...originalModule,
    DataSource: jest.fn().mockImplementation((options: PostgresConnectionOptions) => {
      if (options.url === 'invalid-url') {
        throw new Error('Invalid URL format');
      }
      const dataSource = new originalModule.DataSource(options);
      return dataSource;
    }),
  };
});

// Mock the seed functions
jest.mock("./create-admin-user.seed");
jest.mock("./create-initial-data.seed");
jest.mock("./create-sample-bookings.seed");
jest.mock("./create-sample-orders.seed");

describe('run-seeds', () => {
  const mockDataSource: DataSource = {
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    options: {} as PostgresConnectionOptions,
    isInitialized: false,
    driver: {} as any,
    manager: {} as any,
    name: 'default',
  } as DataSource;

  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    console.log = jest.fn();
    console.error = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('createDataSource', () => {
    it('should create a DataSource when DATABASE_URL is set', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      const dataSource = createDataSource();
      expect(dataSource).toBeDefined();
      expect((dataSource.options as PostgresConnectionOptions).url).toBe(process.env.DATABASE_URL);
    });

    it('should throw error when DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL;
      expect(() => createDataSource()).toThrow('DATABASE_URL environment variable is not set');
    });

    it('should handle DataSource creation errors', () => {
      process.env.DATABASE_URL = 'invalid-url';
      expect(() => createDataSource()).toThrow('Failed to create DataSource: Invalid URL format');
    });
  });

  describe('runSeeds', () => {
    it('should run all seeds successfully', async () => {
      (createAdminUser as jest.Mock).mockResolvedValue(undefined);
      (createInitialData as jest.Mock).mockResolvedValue(undefined);
      (createSampleBookings as jest.Mock).mockResolvedValue(undefined);
      (createSampleOrders as jest.Mock).mockResolvedValue(undefined);

      const result = await runSeeds(mockDataSource);
      
      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(createAdminUser).toHaveBeenCalledWith(mockDataSource);
      expect(createInitialData).toHaveBeenCalledWith(mockDataSource);
      expect(createSampleBookings).toHaveBeenCalledWith(mockDataSource);
      expect(createSampleOrders).toHaveBeenCalledWith(mockDataSource);
      expect(result).toBe(true);
    });

    it('should throw error for invalid DataSource', async () => {
      const invalidDataSource = undefined as unknown as DataSource;
      await expect(runSeeds(invalidDataSource)).rejects.toThrow('Invalid DataSource provided');
    });

    it('should handle initialization error', async () => {
      const errorDataSource: DataSource = {
        ...mockDataSource,
        initialize: jest.fn().mockRejectedValue(new Error('Init failed')),
      };

      await expect(runSeeds(errorDataSource)).rejects.toThrow('Seed operation failed: Init failed');
    });

    it('should handle seed operation errors', async () => {
      const mockError = new Error('Seed operation failed');
      (createAdminUser as jest.Mock).mockRejectedValue(mockError);

      await expect(runSeeds(mockDataSource)).rejects.toThrow('Seed operation failed: Seed operation failed');
    });

    it('should handle non-Error objects in catch blocks', async () => {
      // Mock createInitialData to reject with a string
      (createInitialData as jest.Mock).mockRejectedValue('String error');
      
      // Reset other mocks to resolve successfully
      (createAdminUser as jest.Mock).mockResolvedValue(undefined);
      (createSampleBookings as jest.Mock).mockResolvedValue(undefined);
      (createSampleOrders as jest.Mock).mockResolvedValue(undefined);

      await expect(runSeeds(mockDataSource)).rejects.toThrow('Seed operation failed: String error');
    });
  });
});
