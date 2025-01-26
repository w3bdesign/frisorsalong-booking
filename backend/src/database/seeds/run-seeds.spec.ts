import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { createDataSource, runSeeds } from "./run-seeds";
import { createAdminUser } from "./create-admin-user.seed";
import { createInitialData } from "./create-initial-data.seed";
import { createSampleBookings } from "./create-sample-bookings.seed";
import { createSampleOrders } from "./create-sample-orders.seed";

// Mock the DataSource class
// Import the actual DataSource type to use in our mock
import { DataSourceOptions } from "typeorm";

jest.mock("typeorm", () => {
  const actualModule = jest.requireActual("typeorm") as typeof import("typeorm");
  
  class MockDataSource extends actualModule.DataSource {
    constructor(options: PostgresConnectionOptions) {
      if (options.url === 'invalid-url') {
        throw new Error('Invalid URL format');
      }
      super(options);
    }
  }

  return {
    ...actualModule,
    DataSource: jest.fn().mockImplementation((options: PostgresConnectionOptions) => new MockDataSource(options)),
  };
});

// Mock the seed functions
jest.mock("./create-admin-user.seed");
jest.mock("./create-initial-data.seed");
jest.mock("./create-sample-bookings.seed");
jest.mock("./create-sample-orders.seed");

describe('run-seeds', () => {
  // Create a minimal mock of DataSource with required properties
  const createMockDataSource = () => ({
    name: 'default',
    options: {} as PostgresConnectionOptions,
    isInitialized: false,
    initialize: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
    isConnected: false,
    close: jest.fn().mockResolvedValue(undefined),
    connect: jest.fn().mockResolvedValue(undefined),
    createEntityManager: jest.fn(),
    createQueryRunner: jest.fn(),
    getMetadata: jest.fn(),
    hasMetadata: jest.fn(),
    getRepository: jest.fn(),
    getTreeRepository: jest.fn(),
    getMongoRepository: jest.fn(),
    transaction: jest.fn(),
    driver: {},
    manager: {},
    mongoManager: undefined,
    sqljsManager: undefined,
    namingStrategy: {},
    entityMetadatas: [],
    subscribers: [],
    migrations: [],
    logger: console,
    metadataTableName: 'typeorm_metadata',
    queryResultCache: null,
    relationLoader: {},
    relationIdLoader: {},
  }) as unknown as DataSource;

  const mockDataSource = createMockDataSource();

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
      const errorDataSource = createMockDataSource();
      errorDataSource.initialize = jest.fn().mockRejectedValue(new Error('Init failed'));

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
