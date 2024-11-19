import { DataSource } from 'typeorm';
import { createDataSource, loadEnvConfig, runPasswordUpdate } from './update-admin-password-runner';
import { updateAdminPassword } from './update-admin-password.seed';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

jest.mock('./update-admin-password.seed');
jest.mock('fs');
jest.mock('dotenv');
jest.mock('path');

describe('update-admin-password-runner', () => {
  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadEnvConfig', () => {
    it('should load and parse environment configuration', () => {
      // Mock path.resolve
      (path.resolve as jest.Mock).mockReturnValue('/fake/path/.env');

      // Mock fs.readFileSync
      (fs.readFileSync as jest.Mock).mockReturnValue('mock env file content');

      // Mock dotenv.parse
      const mockEnvConfig = {
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        ADMIN_EMAIL: 'admin@example.com',
        ADMIN_PASSWORD: 'password123',
      };
      (dotenv.parse as jest.Mock).mockReturnValue(mockEnvConfig);

      const result = loadEnvConfig();

      expect(path.resolve).toHaveBeenCalledWith(expect.any(String), '.env');
      expect(fs.readFileSync).toHaveBeenCalledWith('/fake/path/.env');
      expect(dotenv.parse).toHaveBeenCalledWith('mock env file content');
      expect(result).toEqual(mockEnvConfig);
    });

    it('should handle errors when loading env file', () => {
      const fsError = new Error('Cannot read env file');
      (fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw fsError;
      });

      expect(() => loadEnvConfig()).toThrow(fsError);
    });
  });

  describe('createDataSource', () => {
    it('should create DataSource with correct configuration', () => {
      const mockEnvConfig = {
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      };

      const dataSource = createDataSource(mockEnvConfig);

      expect(dataSource).toBeInstanceOf(DataSource);
      expect(dataSource.options).toEqual(expect.objectContaining({
        type: 'postgres',
        entities: ['src/**/*.entity{.ts,.js}'],
        synchronize: false,
        ssl: {
          rejectUnauthorized: false,
        },
      }));
      expect((dataSource.options as any).url).toBe(mockEnvConfig.DATABASE_URL);
    });
  });

  describe('runPasswordUpdate', () => {
    let mockDataSource: Partial<DataSource>;

    beforeEach(() => {
      mockDataSource = {
        initialize: jest.fn().mockResolvedValue(undefined),
      };

      (updateAdminPassword as jest.Mock).mockResolvedValue(undefined);
    });

    it('should initialize database and run password update', async () => {
      const result = await runPasswordUpdate(mockDataSource as DataSource);

      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(updateAdminPassword).toHaveBeenCalledWith(mockDataSource);
      expect(console.log).toHaveBeenCalledWith('Connected to database');
      expect(console.log).toHaveBeenCalledWith('Password update completed successfully');
      expect(result).toBe(true);
    });

    it('should handle database initialization errors', async () => {
      const dbError = new Error('Database initialization failed');
      mockDataSource.initialize = jest.fn().mockRejectedValue(dbError);

      await expect(runPasswordUpdate(mockDataSource as DataSource)).rejects.toThrow(dbError);

      expect(console.error).toHaveBeenCalledWith('Error running seed:', dbError);
      expect(updateAdminPassword).not.toHaveBeenCalled();
    });

    it('should handle password update errors', async () => {
      const updateError = new Error('Password update failed');
      (updateAdminPassword as jest.Mock).mockRejectedValue(updateError);

      await expect(runPasswordUpdate(mockDataSource as DataSource)).rejects.toThrow(updateError);

      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error running seed:', updateError);
    });
  });
});
