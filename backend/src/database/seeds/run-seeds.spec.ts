import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { createDataSource, runSeeds } from './run-seeds';
import { createAdminUser } from './create-admin-user.seed';
import { createInitialData } from './create-initial-data.seed';
import { createSampleBookings } from './create-sample-bookings.seed';
import { createSampleOrders } from './create-sample-orders.seed';

jest.mock('./create-admin-user.seed');
jest.mock('./create-initial-data.seed');
jest.mock('./create-sample-bookings.seed');
jest.mock('./create-sample-orders.seed');

describe('run-seeds', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test';

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Mock seed functions to resolve by default
    (createAdminUser as jest.Mock).mockResolvedValue(undefined);
    (createInitialData as jest.Mock).mockResolvedValue(undefined);
    (createSampleBookings as jest.Mock).mockResolvedValue(undefined);
    (createSampleOrders as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  describe('createDataSource', () => {
    it('should create a DataSource with correct configuration', () => {
      const dataSource = createDataSource();
      const options = dataSource.options as PostgresConnectionOptions;
      
      expect(dataSource).toBeInstanceOf(DataSource);
      expect(options.url).toBe(process.env.DATABASE_URL);
      expect(options.type).toBe('postgres');
    });

    it('should throw error when DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL;
      expect(() => createDataSource()).toThrow('DATABASE_URL environment variable is not set');
    });
  });

  describe('runSeeds', () => {
    let mockDataSource: jest.Mocked<DataSource>;

    beforeEach(() => {
      mockDataSource = {
        initialize: jest.fn().mockResolvedValue(undefined),
        destroy: jest.fn().mockResolvedValue(undefined),
        options: {
          type: 'postgres',
          url: process.env.DATABASE_URL,
        } as PostgresConnectionOptions,
      } as unknown as jest.Mocked<DataSource>;
    });

    it('should run all seeds in correct order', async () => {
      const executionOrder: string[] = [];

      // Mock seed functions to track execution order
      (createAdminUser as jest.Mock).mockImplementation(async () => {
        executionOrder.push('admin');
      });
      (createInitialData as jest.Mock).mockImplementation(async () => {
        executionOrder.push('initial');
      });
      (createSampleBookings as jest.Mock).mockImplementation(async () => {
        executionOrder.push('bookings');
      });
      (createSampleOrders as jest.Mock).mockImplementation(async () => {
        executionOrder.push('orders');
      });

      await runSeeds(mockDataSource);

      // Verify initialization
      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Connected to database');

      // Verify seed functions were called with correct DataSource
      expect(createAdminUser).toHaveBeenCalledWith(mockDataSource);
      expect(createInitialData).toHaveBeenCalledWith(mockDataSource);
      expect(createSampleBookings).toHaveBeenCalledWith(mockDataSource);
      expect(createSampleOrders).toHaveBeenCalledWith(mockDataSource);

      // Verify execution order
      expect(executionOrder).toEqual(['admin', 'initial', 'bookings', 'orders']);

      // Verify log messages
      expect(console.log).toHaveBeenCalledWith('Creating admin user...');
      expect(console.log).toHaveBeenCalledWith('Creating initial data...');
      expect(console.log).toHaveBeenCalledWith('Creating sample bookings...');
      expect(console.log).toHaveBeenCalledWith('Creating sample orders...');
    });

    it('should throw error when invalid DataSource is provided', async () => {
      const invalidDataSource = {} as DataSource;
      await expect(runSeeds(invalidDataSource)).rejects.toThrow('Invalid DataSource provided');
    });

    it('should handle database initialization error', async () => {
      const dbError = new Error('Database connection failed');
      mockDataSource.initialize.mockRejectedValue(dbError);

      await expect(runSeeds(mockDataSource)).rejects.toThrow('Seed operation failed: Database connection failed');
      expect(console.error).toHaveBeenCalledWith('Error running seeds:', 'Database connection failed');
    });

    it('should handle seed operation errors', async () => {
      const seedError = new Error('Failed to create admin user');
      (createAdminUser as jest.Mock).mockRejectedValue(seedError);

      await expect(runSeeds(mockDataSource)).rejects.toThrow('Seed operation failed: Failed to create admin user');
      expect(console.error).toHaveBeenCalledWith('Error running seeds:', 'Failed to create admin user');
    });

    it('should return true when all seeds complete successfully', async () => {
      // All seed functions are already mocked to resolve in beforeEach
      const result = await runSeeds(mockDataSource);

      expect(result).toBe(true);
      expect(console.log).toHaveBeenCalledWith('All seeds completed successfully');
      expect(console.error).not.toHaveBeenCalled();
    });
  });
});
