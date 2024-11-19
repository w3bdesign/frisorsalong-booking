import { DataSource } from 'typeorm';
import { createDataSource, runSeeds } from './run-seeds';
import { createAdminUser } from './create-admin-user.seed';
import { createInitialData } from './create-initial-data.seed';
import { createSampleBookings } from './create-sample-bookings.seed';

jest.mock('./create-admin-user.seed');
jest.mock('./create-initial-data.seed');
jest.mock('./create-sample-bookings.seed');

describe('run-seeds', () => {
  let mockDataSource: Partial<DataSource>;
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock DataSource
    mockDataSource = {
      initialize: jest.fn().mockResolvedValue(undefined),
    };

    // Mock seed functions
    (createAdminUser as jest.Mock).mockResolvedValue(undefined);
    (createInitialData as jest.Mock).mockResolvedValue(undefined);
    (createSampleBookings as jest.Mock).mockResolvedValue(undefined);

    // Setup test environment variables
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
    };

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('createDataSource', () => {
    it('should create DataSource with correct configuration', () => {
      const dataSource = createDataSource();

      expect(dataSource).toBeInstanceOf(DataSource);
      expect(dataSource.options).toEqual(expect.objectContaining({
        type: 'postgres',
        entities: ['src/**/*.entity{.ts,.js}'],
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
      }));
      expect((dataSource.options as any).url).toBe('postgres://user:pass@localhost:5432/db');
    });

    it('should use environment variables for database configuration', () => {
      const testUrl = 'postgres://test:test@test:5432/testdb';
      process.env.DATABASE_URL = testUrl;

      const dataSource = createDataSource();

      expect((dataSource.options as any).url).toBe(testUrl);
    });
  });

  describe('runSeeds', () => {
    it('should run all seeds in sequence', async () => {
      const result = await runSeeds(mockDataSource as DataSource);

      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(createAdminUser).toHaveBeenCalledWith(mockDataSource);
      expect(createInitialData).toHaveBeenCalledWith(mockDataSource);
      expect(createSampleBookings).toHaveBeenCalledWith(mockDataSource);
      expect(console.log).toHaveBeenCalledWith('Connected to database');
      expect(console.log).toHaveBeenCalledWith('All seeds completed successfully');
      expect(result).toBe(true);
    });

    it('should handle database initialization errors', async () => {
      const dbError = new Error('Database initialization failed');
      mockDataSource.initialize = jest.fn().mockRejectedValue(dbError);

      await expect(runSeeds(mockDataSource as DataSource)).rejects.toThrow(dbError);

      expect(console.error).toHaveBeenCalledWith('Error running seeds:', dbError);
      expect(createAdminUser).not.toHaveBeenCalled();
      expect(createInitialData).not.toHaveBeenCalled();
      expect(createSampleBookings).not.toHaveBeenCalled();
    });

    it('should handle admin user creation errors', async () => {
      const seedError = new Error('Admin user creation failed');
      (createAdminUser as jest.Mock).mockRejectedValue(seedError);

      await expect(runSeeds(mockDataSource as DataSource)).rejects.toThrow(seedError);

      expect(console.error).toHaveBeenCalledWith('Error running seeds:', seedError);
      expect(createAdminUser).toHaveBeenCalled();
      expect(createInitialData).not.toHaveBeenCalled();
      expect(createSampleBookings).not.toHaveBeenCalled();
    });

    it('should handle initial data creation errors', async () => {
      const seedError = new Error('Initial data creation failed');
      (createInitialData as jest.Mock).mockRejectedValue(seedError);

      await expect(runSeeds(mockDataSource as DataSource)).rejects.toThrow(seedError);

      expect(console.error).toHaveBeenCalledWith('Error running seeds:', seedError);
      expect(createAdminUser).toHaveBeenCalled();
      expect(createInitialData).toHaveBeenCalled();
      expect(createSampleBookings).not.toHaveBeenCalled();
    });

    it('should handle sample bookings creation errors', async () => {
      const seedError = new Error('Sample bookings creation failed');
      (createSampleBookings as jest.Mock).mockRejectedValue(seedError);

      await expect(runSeeds(mockDataSource as DataSource)).rejects.toThrow(seedError);

      expect(console.error).toHaveBeenCalledWith('Error running seeds:', seedError);
      expect(createAdminUser).toHaveBeenCalled();
      expect(createInitialData).toHaveBeenCalled();
      expect(createSampleBookings).toHaveBeenCalled();
    });
  });
});
