import { DataSource, Repository, FindOneOptions } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { createAdminUser } from './create-admin-user.seed';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('createAdminUser', () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<User>>;
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock repository methods
    mockUserRepository = {
      findOne: jest.fn() as jest.Mock,
      create: jest.fn() as jest.Mock,
      save: jest.fn() as jest.Mock,
    };

    // Mock DataSource
    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockUserRepository),
    };

    // Mock bcrypt
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    // Setup test environment variables
    process.env = {
      ...originalEnv,
      ADMIN_EMAIL: 'admin@example.com',
      ADMIN_PASSWORD: 'admin123',
    };

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should create admin user when it does not exist', async () => {
    // Mock that admin doesn't exist
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

    // Mock created user
    const mockCreatedUser = {
      email: 'admin@example.com',
      password: 'hashed-password',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    };
    (mockUserRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
    (mockUserRepository.save as jest.Mock).mockResolvedValue(mockCreatedUser);

    await createAdminUser(mockDataSource as DataSource);

    // Verify admin user was searched for
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    });

    // Verify password was hashed
    expect(bcrypt.hash).toHaveBeenCalledWith('admin123', 10);

    // Verify user was created with correct data
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: 'admin@example.com',
      password: 'hashed-password',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    });

    // Verify user was saved
    expect(mockUserRepository.save).toHaveBeenCalledWith(mockCreatedUser);

    // Verify success message was logged
    expect(console.log).toHaveBeenCalledWith('Admin user created successfully');
  });

  it('should not create admin user when it already exists', async () => {
    // Mock that admin already exists
    const existingAdmin = {
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(existingAdmin);

    await createAdminUser(mockDataSource as DataSource);

    // Verify admin user was searched for
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'admin@example.com' },
    });

    // Verify no creation attempts were made
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();

    // Verify appropriate message was logged
    expect(console.log).toHaveBeenCalledWith('Admin user already exists');
  });

  it('should throw error when admin email is missing', async () => {
    delete process.env.ADMIN_EMAIL;

    await expect(createAdminUser(mockDataSource as DataSource)).rejects.toThrow(
      'Admin email and password must be set in environment variables',
    );

    // Verify no database operations were attempted
    expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when admin password is missing', async () => {
    delete process.env.ADMIN_PASSWORD;

    await expect(createAdminUser(mockDataSource as DataSource)).rejects.toThrow(
      'Admin email and password must be set in environment variables',
    );

    // Verify no database operations were attempted
    expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    expect(mockUserRepository.create).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    // Mock database error
    const dbError = new Error('Database connection failed');
    (mockUserRepository.findOne as jest.Mock).mockRejectedValue(dbError);

    await expect(createAdminUser(mockDataSource as DataSource)).rejects.toThrow(dbError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error creating admin user:', dbError);
  });

  it('should handle password hashing errors', async () => {
    // Mock that admin doesn't exist
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

    // Mock bcrypt error
    const hashError = new Error('Hashing failed');
    (bcrypt.hash as jest.Mock).mockRejectedValue(hashError);

    await expect(createAdminUser(mockDataSource as DataSource)).rejects.toThrow(hashError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error creating admin user:', hashError);
  });
});
