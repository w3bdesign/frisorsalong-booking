import { DataSource, Repository, DataSourceOptions } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { removeAdminUser, createDataSource } from './remove-admin-user';

describe('removeAdminUser', () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<User>>;
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock repository
    mockUserRepository = {
      delete: jest.fn() as jest.Mock,
    };

    // Mock DataSource
    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockUserRepository),
    };

    // Setup test environment variables
    process.env = {
      ...originalEnv,
      ADMIN_EMAIL: 'admin@example.com',
    };

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should successfully remove admin user', async () => {
    (mockUserRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

    const result = await removeAdminUser(mockDataSource as DataSource);

    expect(result).toBe(true);
    expect(mockUserRepository.delete).toHaveBeenCalledWith({
      email: 'admin@example.com',
    });
    expect(console.log).toHaveBeenCalledWith('Admin user removed successfully');
  });

  it('should handle case when admin user does not exist', async () => {
    (mockUserRepository.delete as jest.Mock).mockResolvedValue({ affected: 0 });

    const result = await removeAdminUser(mockDataSource as DataSource);

    expect(result).toBe(false);
    expect(mockUserRepository.delete).toHaveBeenCalledWith({
      email: 'admin@example.com',
    });
    expect(console.log).toHaveBeenCalledWith('Admin user not found');
  });

  it('should throw error when admin email is not set', async () => {
    delete process.env.ADMIN_EMAIL;

    await expect(removeAdminUser(mockDataSource as DataSource)).rejects.toThrow(
      'Admin email must be set in environment variables',
    );

    expect(mockUserRepository.delete).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    const dbError = new Error('Database error');
    (mockUserRepository.delete as jest.Mock).mockRejectedValue(dbError);

    await expect(removeAdminUser(mockDataSource as DataSource)).rejects.toThrow(dbError);

    expect(console.error).toHaveBeenCalledWith('Error removing admin user:', dbError);
  });
});

describe('createDataSource', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create DataSource with correct configuration', () => {
    const dataSource = createDataSource();

    expect(dataSource).toBeInstanceOf(DataSource);
    expect(dataSource.options).toEqual(expect.objectContaining({
      type: 'postgres',
      entities: [User],
      synchronize: false,
      ssl: {
        rejectUnauthorized: false,
      },
    }));
    // Check the URL separately as it's a runtime value
    expect((dataSource.options as any).url).toBe('postgres://user:pass@localhost:5432/db');
  });

  it('should use environment variables for database configuration', () => {
    const testUrl = 'postgres://test:test@test:5432/testdb';
    process.env.DATABASE_URL = testUrl;

    const dataSource = createDataSource();

    expect((dataSource.options as any).url).toBe(testUrl);
  });
});
