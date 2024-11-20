import { DataSource, Repository, InsertQueryBuilder, EntityTarget } from 'typeorm';
import { User, UserRole } from '../../users/entities/user.entity';
import { Employee } from '../../employees/entities/employee.entity';
import { Service } from '../../services/entities/service.entity';
import { createInitialData } from './create-initial-data.seed';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('createInitialData', () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepository: Partial<Repository<User>>;
  let mockEmployeeRepository: Partial<Repository<Employee>>;
  let mockServiceRepository: Partial<Repository<Service>>;
  let mockQueryBuilder: Partial<InsertQueryBuilder<any>>;
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock repositories
    mockUserRepository = {
      findOne: jest.fn() as jest.Mock,
      save: jest.fn() as jest.Mock,
    };

    mockEmployeeRepository = {
      save: jest.fn() as jest.Mock,
    };

    mockServiceRepository = {
      save: jest.fn() as jest.Mock,
    };

    // Mock query builder for service associations
    mockQueryBuilder = {
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };

    // Mock DataSource with proper typing
    const mockGetRepository = (entity: EntityTarget<any>) => {
      if (entity === User) return mockUserRepository as Repository<User>;
      if (entity === Employee) return mockEmployeeRepository as Repository<Employee>;
      if (entity === Service) return mockServiceRepository as Repository<Service>;
      throw new Error(`Repository not mocked for entity: ${entity}`);
    };

    mockDataSource = {
      getRepository: jest.fn().mockImplementation(mockGetRepository),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    // Mock bcrypt
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    // Setup test environment variables
    process.env = {
      ...originalEnv,
      EMPLOYEE_EMAIL: 'employee@example.com',
      EMPLOYEE_PASSWORD: 'employee123',
      EMPLOYEE_PHONE: '+1234567890',
    };

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it('should create services, employee user, and employee when they do not exist', async () => {
    // Mock that employee doesn't exist
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);

    // Mock created services
    const mockServices = [
      { id: '1', name: 'Standard Klipp' },
      { id: '2', name: 'Styling Klipp' },
      { id: '3', name: 'Skjegg Trim' },
      { id: '4', name: 'Full Service' },
    ];
    (mockServiceRepository.save as jest.Mock).mockResolvedValue(mockServices);

    // Mock created employee user
    const mockEmployeeUser = {
      id: 'user-1',
      email: 'employee@example.com',
      role: UserRole.EMPLOYEE,
    };
    (mockUserRepository.save as jest.Mock).mockResolvedValue(mockEmployeeUser);

    // Mock created employee
    const mockEmployee = {
      id: 'employee-1',
      user: mockEmployeeUser,
    };
    (mockEmployeeRepository.save as jest.Mock).mockResolvedValue(mockEmployee);

    await createInitialData(mockDataSource as DataSource);

    // Verify services were created
    expect(mockServiceRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Standard Klipp' }),
      expect.objectContaining({ name: 'Styling Klipp' }),
      expect.objectContaining({ name: 'Skjegg Trim' }),
      expect.objectContaining({ name: 'Full Service' }),
    ]);

    // Verify employee user was created
    expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      email: 'employee@example.com',
      role: UserRole.EMPLOYEE,
    }));

    // Verify employee was created
    expect(mockEmployeeRepository.save).toHaveBeenCalledWith(expect.objectContaining({
      user: mockEmployeeUser,
      specializations: ['klipp', 'styling', 'skjegg'],
    }));

    // Verify services were associated with employee
    expect(mockQueryBuilder.insert).toHaveBeenCalled();
    expect(mockQueryBuilder.into).toHaveBeenCalledWith('employee_services');
    expect(mockQueryBuilder.values).toHaveBeenCalledWith(
      mockServices.map(service => ({
        employee_id: mockEmployee.id,
        service_id: service.id,
      })),
    );

    // Verify success message was logged
    expect(console.log).toHaveBeenCalledWith('Initial data seeded successfully');
  });

  it('should not create employee when it already exists', async () => {
    // Mock that employee already exists
    const existingEmployee = {
      email: 'employee@example.com',
      role: UserRole.EMPLOYEE,
    };
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(existingEmployee);

    await createInitialData(mockDataSource as DataSource);

    // Verify services were still created
    expect(mockServiceRepository.save).toHaveBeenCalled();

    // Verify no employee creation attempts were made
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEmployeeRepository.save).not.toHaveBeenCalled();
    expect(mockQueryBuilder.insert).not.toHaveBeenCalled();

    // Verify appropriate message was logged
    expect(console.log).toHaveBeenCalledWith('Employee user already exists');
  });

  it('should throw error when employee email is missing', async () => {
    delete process.env.EMPLOYEE_EMAIL;

    await expect(createInitialData(mockDataSource as DataSource)).rejects.toThrow(
      'Employee email and password must be set in environment variables',
    );

    // Verify no database operations were attempted
    expect(mockServiceRepository.save).not.toHaveBeenCalled();
    expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEmployeeRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when employee password is missing', async () => {
    delete process.env.EMPLOYEE_PASSWORD;

    await expect(createInitialData(mockDataSource as DataSource)).rejects.toThrow(
      'Employee email and password must be set in environment variables',
    );

    // Verify no database operations were attempted
    expect(mockServiceRepository.save).not.toHaveBeenCalled();
    expect(mockUserRepository.findOne).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
    expect(mockEmployeeRepository.save).not.toHaveBeenCalled();
  });

  it('should handle database errors during service creation', async () => {
    const dbError = new Error('Database error during service creation');
    (mockServiceRepository.save as jest.Mock).mockRejectedValue(dbError);

    await expect(createInitialData(mockDataSource as DataSource)).rejects.toThrow(dbError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error creating initial data:', dbError);
  });

  it('should handle database errors during employee creation', async () => {
    // Mock that employee doesn't exist
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
    // Mock services creation success
    (mockServiceRepository.save as jest.Mock).mockResolvedValue([]);
    // Mock employee creation error
    const dbError = new Error('Database error during employee creation');
    (mockUserRepository.save as jest.Mock).mockRejectedValue(dbError);

    await expect(createInitialData(mockDataSource as DataSource)).rejects.toThrow(dbError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error creating initial data:', dbError);
  });

  it('should handle password hashing errors', async () => {
    // Mock that employee doesn't exist
    (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
    // Mock services creation success
    (mockServiceRepository.save as jest.Mock).mockResolvedValue([]);
    // Mock bcrypt error
    const hashError = new Error('Hashing failed');
    (bcrypt.hash as jest.Mock).mockRejectedValue(hashError);

    await expect(createInitialData(mockDataSource as DataSource)).rejects.toThrow(hashError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalledWith('Error creating initial data:', hashError);
  });
});
