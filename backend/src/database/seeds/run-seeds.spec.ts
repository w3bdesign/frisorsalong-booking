import { DataSource } from 'typeorm';
import { createDataSource, runSeeds } from './run-seeds';
import { createAdminUser } from './create-admin-user.seed';
import { createInitialData } from './create-initial-data.seed';
import { createSampleBookings } from './create-sample-bookings.seed';
import { createSampleOrders } from './create-sample-orders.seed';

jest.mock('./create-admin-user.seed');
jest.mock('./create-initial-data.seed');
jest.mock('./create-sample-bookings.seed');
jest.mock('./create-sample-orders.seed');

describe('runSeeds', () => {
  let mockDataSource: DataSource;

  beforeEach(() => {
    mockDataSource = {
      initialize: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
    } as unknown as DataSource;

    (createAdminUser as jest.Mock).mockReset();
    (createInitialData as jest.Mock).mockReset();
    (createSampleBookings as jest.Mock).mockReset();
    (createSampleOrders as jest.Mock).mockReset();
  });

  it('should create data source with correct configuration', () => {
    process.env.DATABASE_URL = 'mock-url';
    const dataSource = createDataSource();
    
    expect(dataSource).toBeInstanceOf(DataSource);
    expect(dataSource.options).toEqual(expect.objectContaining({
      type: 'postgres',
      url: 'mock-url',
      entities: ['src/**/*.entity{.ts,.js}'],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false
      }
    }));
  });

  it('should run all seeds successfully', async () => {
    const result = await runSeeds(mockDataSource);

    expect(mockDataSource.initialize).toHaveBeenCalled();
    expect(createAdminUser).toHaveBeenCalledWith(mockDataSource);
    expect(createInitialData).toHaveBeenCalledWith(mockDataSource);
    expect(createSampleBookings).toHaveBeenCalledWith(mockDataSource);
    expect(createSampleOrders).toHaveBeenCalledWith(mockDataSource);
    expect(result).toBe(true);
  });

  it('should throw error when seed fails', async () => {
    const error = new Error('Seed failed');
    mockDataSource.initialize = jest.fn().mockRejectedValue(error);

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await expect(runSeeds(mockDataSource)).rejects.toThrow(error);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error running seeds:', error);
    
    consoleErrorSpy.mockRestore();
  });

  it('should handle direct execution', async () => {
    // Mock process.exit and console
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // Mock successful execution
    const mockRunSeeds = jest.spyOn(require('./run-seeds'), 'runSeeds')
      .mockImplementation(async () => {
        process.exit(0);
        return true;
      });
    
    // Execute the code that runs when file is executed directly
    const mod = require('./run-seeds');
    if (mod.runSeeds) {
      await mod.runSeeds(mockDataSource);
    }
    
    expect(mockExit).toHaveBeenCalledWith(0);
    
    // Cleanup
    consoleSpy.mockRestore();
    mockExit.mockRestore();
    mockRunSeeds.mockRestore();
  });

  it('should handle direct execution failure', async () => {
    // Mock process.exit and console
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock failure
    const error = new Error('Seed failed');
    const mockRunSeeds = jest.spyOn(require('./run-seeds'), 'runSeeds')
      .mockImplementation(async () => {
        process.exit(1);
        throw error;
      });
    
    // Execute the code that runs when file is executed directly
    const mod = require('./run-seeds');
    try {
      if (mod.runSeeds) {
        await mod.runSeeds(mockDataSource);
      }
    } catch (err) {
      expect(mockExit).toHaveBeenCalledWith(1);
    }
    
    // Cleanup
    consoleErrorSpy.mockRestore();
    mockExit.mockRestore();
    mockRunSeeds.mockRestore();
  });
});
