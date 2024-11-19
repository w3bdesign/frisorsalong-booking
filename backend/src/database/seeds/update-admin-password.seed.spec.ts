import { DataSource, Repository } from 'typeorm';
import { updateAdminPassword } from './update-admin-password.seed';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Mock User entity
const mockUserEntity = {
  id: 'user-1',
  email: 'admin@example.com',
  password: 'old-password',
  validatePassword: jest.fn().mockResolvedValue(true),
};

jest.mock('../../users/entities/user.entity', () => ({
  User: jest.fn(),
}));
jest.mock('fs');
jest.mock('dotenv');
jest.mock('path');

describe('updateAdminPassword', () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<typeof mockUserEntity>>;

  beforeEach(() => {
    // Mock repository
    mockUserRepository = {
      findOne: jest.fn() as jest.Mock,
      save: jest.fn() as jest.Mock,
    };

    // Mock DataSource
    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockUserRepository),
    };

    // Mock path.resolve
    (path.resolve as jest.Mock).mockReturnValue('/fake/path/.env');

    // Mock fs.readFileSync
    (fs.readFileSync as jest.Mock).mockReturnValue('mock env file content');

    // Mock dotenv.parse
    (dotenv.parse as jest.Mock).mockReturnValue({
      ADMIN_EMAIL: 'admin@example.com',
      ADMIN_PASSWORD: 'new-password',
    });

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update admin password', async () => {
    // Mock finding the admin user
    (mockUserRepository.findOne as jest.Mock)
      .mockResolvedValueOnce({ ...mockUserEntity })  // First call - finding user
      .mockResolvedValueOnce({ ...mockUserEntity, password: 'new-password' });  // Second call - verification

    await updateAdminPassword(mockDataSource as DataSource);

    // Verify env file was read
    expect(fs.readFileSync).toHaveBeenCalledWith('/fake/path/.env');
    expect(dotenv.parse).toHaveBeenCalledWith('mock env file content');

    // Verify user was found and updated
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    });
    expect(mockUserRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin@example.com',
        password: 'new-password',
      }),
    );

    // Verify password was validated
    expect(mockUserEntity.validatePassword).toHaveBeenCalledWith('new-password');
  });

  it('should throw error when admin user is not found', async () => {
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(updateAdminPassword(mockDataSource as DataSource)).rejects.toThrow(
      'Admin user not found',
    );

    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when env file cannot be read', async () => {
    const fsError = new Error('Cannot read env file');
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw fsError;
    });

    await expect(updateAdminPassword(mockDataSource as DataSource)).rejects.toThrow(fsError);

    expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when admin email is missing from env', async () => {
    (dotenv.parse as jest.Mock).mockReturnValue({
      ADMIN_PASSWORD: 'new-password',
    });

    await expect(updateAdminPassword(mockDataSource as DataSource)).rejects.toThrow(
      'Admin email and password must be set in environment variables',
    );

    expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when admin password is missing from env', async () => {
    (dotenv.parse as jest.Mock).mockReturnValue({
      ADMIN_EMAIL: 'admin@example.com',
    });

    await expect(updateAdminPassword(mockDataSource as DataSource)).rejects.toThrow(
      'Admin email and password must be set in environment variables',
    );

    expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when password update cannot be verified', async () => {
    // Mock finding the admin user for update
    (mockUserRepository.findOne as jest.Mock)
      .mockResolvedValueOnce({ ...mockUserEntity })  // First call - finding user
      .mockResolvedValueOnce(null);     // Second call - verification fails

    await expect(updateAdminPassword(mockDataSource as DataSource)).rejects.toThrow(
      'Could not verify password update',
    );
  });

  it('should handle database errors during save', async () => {
    // Mock finding the admin user
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue({ ...mockUserEntity });

    // Mock save error
    const dbError = new Error('Database error during save');
    (mockUserRepository.save as jest.Mock).mockRejectedValue(dbError);

    await expect(updateAdminPassword(mockDataSource as DataSource)).rejects.toThrow(dbError);

    expect(console.error).toHaveBeenCalledWith('Error updating admin password:', dbError);
  });

  it('should log password analysis information', async () => {
    // Mock finding the admin user
    (mockUserRepository.findOne as jest.Mock)
      .mockResolvedValueOnce({ ...mockUserEntity })
      .mockResolvedValueOnce({ ...mockUserEntity, password: 'new-password' });

    await updateAdminPassword(mockDataSource as DataSource);

    // Verify password analysis was logged
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Password analysis before update'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Raw password'), 'new-password');
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Length'), expect.any(Number));
    expect(console.log).toHaveBeenCalledWith('Admin password updated in database');
    expect(console.log).toHaveBeenCalledWith('Password verification after update:', true);
  });
});
