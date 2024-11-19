import { DataSource, Repository } from 'typeorm';
import { loadEnvConfig, createDataSource, verifyAdminPassword, runVerification } from './verify-admin-password';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Mock User entity
jest.mock('../../users/entities/user.entity', () => ({
  User: jest.fn(),
}));
jest.mock('bcrypt');
jest.mock('fs');
jest.mock('dotenv');
jest.mock('path');

describe('verify-admin-password', () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<any>>;
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock repository
    mockUserRepository = {
      findOne: jest.fn() as jest.Mock,
    };

    // Mock DataSource
    mockDataSource = {
      initialize: jest.fn().mockResolvedValue(undefined),
      getRepository: jest.fn().mockReturnValue(mockUserRepository),
    };

    // Mock bcrypt
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

    // Mock path.resolve
    (path.resolve as jest.Mock).mockReturnValue('/fake/path/.env');

    // Mock fs.readFileSync
    (fs.readFileSync as jest.Mock).mockReturnValue('mock env file content');

    // Mock dotenv.parse
    (dotenv.parse as jest.Mock).mockReturnValue({
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
      ADMIN_EMAIL: 'admin@example.com',
      ADMIN_PASSWORD: 'password123',
    });

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('loadEnvConfig', () => {
    it('should load and parse environment configuration', () => {
      const result = loadEnvConfig();

      expect(path.resolve).toHaveBeenCalledWith(expect.any(String), '.env');
      expect(fs.readFileSync).toHaveBeenCalledWith('/fake/path/.env');
      expect(dotenv.parse).toHaveBeenCalledWith('mock env file content');
      expect(result).toEqual({
        DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
        ADMIN_EMAIL: 'admin@example.com',
        ADMIN_PASSWORD: 'password123',
      });
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

  describe('verifyAdminPassword', () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@example.com',
      password: 'hashed-password',
    };

    it('should verify password successfully', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await verifyAdminPassword(
        mockDataSource as DataSource,
        'admin@example.com',
        'password123'
      );

      expect(result.isValid).toBe(true);
      expect(result.newHashValid).toBe(true);
      expect(result.storedHash).toBe('hashed-password');
      expect(result.newHash).toBe('new-hash');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
    });

    it('should handle case when admin user is not found', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        verifyAdminPassword(mockDataSource as DataSource, 'admin@example.com', 'password123')
      ).rejects.toThrow('Admin user not found');
    });

    it('should handle invalid password', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(false)  // Original password check fails
        .mockResolvedValueOnce(true);  // New hash verification succeeds

      const result = await verifyAdminPassword(
        mockDataSource as DataSource,
        'admin@example.com',
        'wrong-password'
      );

      expect(result.isValid).toBe(false);
      expect(result.newHashValid).toBe(true);
    });

    it('should handle bcrypt errors', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      const bcryptError = new Error('Bcrypt error');
      (bcrypt.compare as jest.Mock).mockRejectedValue(bcryptError);

      await expect(
        verifyAdminPassword(mockDataSource as DataSource, 'admin@example.com', 'password123')
      ).rejects.toThrow(bcryptError);
    });
  });

  describe('runVerification', () => {
    const mockUser = {
      id: 'user-1',
      email: 'admin@example.com',
      password: 'hashed-password',
    };

    it('should run verification successfully', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await runVerification(mockDataSource as DataSource, {
        ADMIN_EMAIL: 'admin@example.com',
        ADMIN_PASSWORD: 'password123',
      });

      expect(result.isValid).toBe(true);
      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Connected to database');
    });

    it('should throw error when admin email is missing', async () => {
      await expect(
        runVerification(mockDataSource as DataSource, {
          ADMIN_PASSWORD: 'password123',
        })
      ).rejects.toThrow('Admin email and password must be set in environment variables');
    });

    it('should throw error when admin password is missing', async () => {
      await expect(
        runVerification(mockDataSource as DataSource, {
          ADMIN_EMAIL: 'admin@example.com',
        })
      ).rejects.toThrow('Admin email and password must be set in environment variables');
    });

    it('should handle database initialization errors', async () => {
      const dbError = new Error('Database initialization failed');
      mockDataSource.initialize = jest.fn().mockRejectedValue(dbError);

      await expect(
        runVerification(mockDataSource as DataSource, {
          ADMIN_EMAIL: 'admin@example.com',
          ADMIN_PASSWORD: 'password123',
        })
      ).rejects.toThrow(dbError);

      expect(console.error).toHaveBeenCalledWith('Error:', dbError);
    });
  });
});
