import { DataSource, Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { loadEnvConfig, createDataSource, verifyAdminPassword, runVerification } from './verify-admin-password';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

jest.mock('bcrypt');
jest.mock('fs');
jest.mock('dotenv');
jest.mock('path');

describe('verify-admin-password', () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<User>>;

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

  describe('verifyAdminPassword', () => {
    const adminEmail = 'admin@example.com';
    const adminPassword = 'password123';
    const storedHash = 'hashed-password';

    beforeEach(() => {
      // Mock bcrypt methods
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(true)  // For stored password
        .mockResolvedValueOnce(true); // For new hash
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
    });

    it('should verify password successfully', async () => {
      const mockUser = {
        id: 'user-1',
        email: adminEmail,
        password: storedHash,
      };
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await verifyAdminPassword(mockDataSource as DataSource, adminEmail, adminPassword);

      expect(result).toEqual({
        isValid: true,
        newHashValid: true,
        storedHash,
        newHash: 'new-hash',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(adminPassword, storedHash);
      expect(bcrypt.hash).toHaveBeenCalledWith(adminPassword, 10);
      expect(console.log).toHaveBeenCalledWith('Password verification result:', true);
    });

    it('should handle case when admin user is not found', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        verifyAdminPassword(mockDataSource as DataSource, adminEmail, adminPassword)
      ).rejects.toThrow('Admin user not found');
    });

    it('should handle invalid password', async () => {
      const mockUser = {
        id: 'user-1',
        email: adminEmail,
        password: storedHash,
      };
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(false)  // For stored password
        .mockResolvedValueOnce(true);  // For new hash

      const result = await verifyAdminPassword(mockDataSource as DataSource, adminEmail, adminPassword);

      expect(result.isValid).toBe(false);
      expect(console.log).toHaveBeenCalledWith('Password verification result:', false);
    });

    it('should handle bcrypt errors', async () => {
      const mockUser = {
        id: 'user-1',
        email: adminEmail,
        password: storedHash,
      };
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const bcryptError = new Error('Bcrypt error');
      (bcrypt.compare as jest.Mock).mockRejectedValue(bcryptError);

      await expect(
        verifyAdminPassword(mockDataSource as DataSource, adminEmail, adminPassword)
      ).rejects.toThrow(bcryptError);
    });
  });

  describe('runVerification', () => {
    const mockEnvConfig = {
      ADMIN_EMAIL: 'admin@example.com',
      ADMIN_PASSWORD: 'password123',
    };

    it('should run verification successfully', async () => {
      const verificationResult = {
        isValid: true,
        newHashValid: true,
        storedHash: 'stored-hash',
        newHash: 'new-hash',
      };
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue({
        id: 'user-1',
        email: mockEnvConfig.ADMIN_EMAIL,
        password: 'stored-hash',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');

      const result = await runVerification(mockDataSource as DataSource, mockEnvConfig);

      expect(result).toEqual(verificationResult);
      expect(mockDataSource.initialize).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Connected to database');
    });

    it('should throw error when admin email is missing', async () => {
      const invalidConfig = { ADMIN_PASSWORD: 'password123' };

      await expect(
        runVerification(mockDataSource as DataSource, invalidConfig)
      ).rejects.toThrow('Admin email and password must be set in environment variables');

      expect(mockDataSource.initialize).toHaveBeenCalled();
    });

    it('should throw error when admin password is missing', async () => {
      const invalidConfig = { ADMIN_EMAIL: 'admin@example.com' };

      await expect(
        runVerification(mockDataSource as DataSource, invalidConfig)
      ).rejects.toThrow('Admin email and password must be set in environment variables');

      expect(mockDataSource.initialize).toHaveBeenCalled();
    });

    it('should handle database initialization errors', async () => {
      const dbError = new Error('Database initialization failed');
      mockDataSource.initialize = jest.fn().mockRejectedValue(dbError);

      await expect(
        runVerification(mockDataSource as DataSource, mockEnvConfig)
      ).rejects.toThrow(dbError);

      expect(console.error).toHaveBeenCalledWith('Error:', dbError);
    });
  });
});
