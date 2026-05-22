import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Not, LessThan, MoreThan } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

// --- Test Data Factories ---

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: UserRole.EMPLOYEE,
    password: 'password123',
    ...overrides,
  } as User;
}

function createMockEmployee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 'employee-1',
    user: createMockUser(),
    specializations: ['haircut'],
    isActive: true,
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
    },
    ...overrides,
  } as Employee;
}

// --- Mock Repository Factories ---

function createMockEmployeeRepository() {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };
}

function createMockBookingRepository() {
  return {
    count: jest.fn(),
  };
}

function createMockUserRepository() {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };
}

// --- Test Module Setup ---

interface TestContext {
  service: EmployeesService;
  employeeRepository: Repository<Employee>;
  bookingRepository: Repository<Booking>;
  userRepository: Repository<User>;
  mockEmployeeRepo: ReturnType<typeof createMockEmployeeRepository>;
  mockBookingRepo: ReturnType<typeof createMockBookingRepository>;
  mockUserRepo: ReturnType<typeof createMockUserRepository>;
}

async function setupTestModule(): Promise<TestContext> {
  const mockEmployeeRepo = createMockEmployeeRepository();
  const mockBookingRepo = createMockBookingRepository();
  const mockUserRepo = createMockUserRepository();

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      EmployeesService,
      {
        provide: getRepositoryToken(Employee),
        useValue: mockEmployeeRepo,
      },
      {
        provide: getRepositoryToken(Booking),
        useValue: mockBookingRepo,
      },
      {
        provide: getRepositoryToken(User),
        useValue: mockUserRepo,
      },
    ],
  }).compile();

  return {
    service: module.get<EmployeesService>(EmployeesService),
    employeeRepository: module.get<Repository<Employee>>(getRepositoryToken(Employee)),
    bookingRepository: module.get<Repository<Booking>>(getRepositoryToken(Booking)),
    userRepository: module.get<Repository<User>>(getRepositoryToken(User)),
    mockEmployeeRepo,
    mockBookingRepo,
    mockUserRepo,
  };
}

// --- Test Suites ---

describe('EmployeesService', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await setupTestModule();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(ctx.service).toBeDefined();
  });

  describe('create', () => {
    const createEmployeeDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      specializations: ['haircut'],
    };

    it('should create an employee successfully', async () => {
      const mockCreatedUser = createMockUser({ password: 'hashed_password' });

      ctx.mockUserRepo.findOne.mockResolvedValue(null);
      ctx.mockUserRepo.create.mockReturnValue(mockCreatedUser);
      ctx.mockUserRepo.save.mockResolvedValue({ ...mockCreatedUser, id: 'user-1' });

      const mockCreatedEmployee = {
        user: mockCreatedUser,
        specializations: createEmployeeDto.specializations,
        isActive: true,
        availability: {},
      };
      ctx.mockEmployeeRepo.create.mockReturnValue(mockCreatedEmployee);
      ctx.mockEmployeeRepo.save.mockResolvedValue({ ...mockCreatedEmployee, id: 'employee-1' });

      const result = await ctx.service.create(createEmployeeDto);

      expect(result.employee).toBeDefined();
      expect(result.temporaryPassword).toBeDefined();
      expect(result.temporaryPassword.length).toBe(8);
      expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
      expect(ctx.userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createEmployeeDto.email },
      });
      expect(ctx.userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: createEmployeeDto.email,
          firstName: createEmployeeDto.firstName,
          lastName: createEmployeeDto.lastName,
          role: UserRole.EMPLOYEE,
          password: 'hashed_password',
        }),
      );
      expect(ctx.userRepository.save).toHaveBeenCalled();
      expect(ctx.employeeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          specializations: createEmployeeDto.specializations,
          isActive: true,
          availability: {},
        }),
      );
      expect(ctx.employeeRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      ctx.mockUserRepo.findOne.mockResolvedValue(createMockUser());

      await expect(ctx.service.create(createEmployeeDto)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(ctx.userRepository.save).not.toHaveBeenCalled();
      expect(ctx.employeeRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should return employee when found by user ID', async () => {
      const mockEmployee = createMockEmployee();
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);

      const result = await ctx.service.findByUserId('user-1');

      expect(result).toEqual(mockEmployee);
      expect(ctx.employeeRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } },
        relations: ['user', 'services'],
      });
    });

    it('should throw NotFoundException when employee not found by user ID', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(ctx.service.findByUserId('non-existent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockEmployee = createMockEmployee();
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      ctx.mockUserRepo.update.mockResolvedValue({ affected: 1 });

      const result = await ctx.service.resetPassword('employee-1');

      expect(result).toBeDefined();
      expect(result.temporaryPassword).toBeDefined();
      expect(result.temporaryPassword.length).toBe(8);
      expect(bcrypt.hash).toHaveBeenCalledWith(expect.any(String), 10);
      expect(ctx.userRepository.update).toHaveBeenCalledWith(
        mockEmployee.user.id,
        expect.objectContaining({
          password: 'hashed_password',
        }),
      );
    });

    it('should throw NotFoundException if employee not found', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(ctx.service.resetPassword('non-existent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an employee when found', async () => {
      const mockEmployee = createMockEmployee();
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);

      const result = await ctx.service.findOne('employee-1');

      expect(result).toEqual(mockEmployee);
      expect(ctx.employeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'employee-1' },
        relations: ['user', 'services'],
      });
    });

    it('should throw NotFoundException when employee not found', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(ctx.service.findOne('non-existent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('isAvailable', () => {
    const startTime = new Date('2024-01-01T10:00:00Z'); // Monday
    const endTime = new Date('2024-01-01T11:00:00Z');

    it('should return true when employee is available', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(createMockEmployee());
      ctx.mockBookingRepo.count.mockResolvedValue(0);

      const result = await ctx.service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(true);
      expect(ctx.bookingRepository.count).toHaveBeenCalledWith({
        where: {
          employee: { id: 'employee-1' },
          startTime: Not(MoreThan(endTime)),
          endTime: Not(LessThan(startTime)),
        },
      });
    });

    it('should return false when employee has conflicting bookings', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(createMockEmployee());
      ctx.mockBookingRepo.count.mockResolvedValue(1);

      const result = await ctx.service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(false);
    });

    it('should exclude specified booking when checking availability', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(createMockEmployee());
      ctx.mockBookingRepo.count.mockResolvedValue(0);

      const result = await ctx.service.isAvailable('employee-1', startTime, endTime, 'booking-1');

      expect(result).toBe(true);
      expect(ctx.bookingRepository.count).toHaveBeenCalledWith({
        where: {
          employee: { id: 'employee-1' },
          startTime: Not(MoreThan(endTime)),
          endTime: Not(LessThan(startTime)),
          id: Not('booking-1'),
        },
      });
    });

    it('should return false when employee is inactive', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(createMockEmployee({ isActive: false }));

      const result = await ctx.service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(false);
    });

    it('should return false when time is outside availability', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(createMockEmployee());
      const startTimeOutside = new Date('2024-01-01T07:00:00Z');
      const endTimeOutside = new Date('2024-01-01T08:00:00Z');

      const result = await ctx.service.isAvailable('employee-1', startTimeOutside, endTimeOutside);

      expect(result).toBe(false);
    });

    it('should return false when no availability for the day', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(createMockEmployee({ availability: {} }));

      const result = await ctx.service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(false);
    });

    it('should return false when empty availability slots for the day', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(
        createMockEmployee({ availability: { monday: [] } }),
      );

      const result = await ctx.service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all active employees', async () => {
      const mockEmployees = [createMockEmployee()];
      ctx.mockEmployeeRepo.find.mockResolvedValue(mockEmployees);

      const result = await ctx.service.findAll();

      expect(result).toEqual(mockEmployees);
      expect(ctx.employeeRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'services'],
        where: { isActive: true },
      });
    });
  });

  describe('update', () => {
    const updateEmployeeDto = {
      firstName: 'John Updated',
      specializations: ['haircut', 'coloring'],
    };

    it('should update employee successfully', async () => {
      const mockEmployee = createMockEmployee();
      const updatedEmployee = { ...mockEmployee, ...updateEmployeeDto };
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      ctx.mockEmployeeRepo.save.mockResolvedValue(updatedEmployee);

      const result = await ctx.service.update('employee-1', updateEmployeeDto);

      expect(result).toEqual(updatedEmployee);
      expect(ctx.employeeRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if employee not found', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(
        ctx.service.update('non-existent', updateEmployeeDto),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should mark employee as inactive', async () => {
      const mockEmployee = createMockEmployee();
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(mockEmployee);
      ctx.mockEmployeeRepo.save.mockResolvedValue({ ...mockEmployee, isActive: false });

      await ctx.service.remove('employee-1');

      expect(ctx.employeeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('should throw NotFoundException if employee not found', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(ctx.service.remove('non-existent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should mark employee as active', async () => {
      const inactiveEmployee = createMockEmployee({ isActive: false });
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(inactiveEmployee);
      ctx.mockEmployeeRepo.save.mockResolvedValue({ ...inactiveEmployee, isActive: true });

      await ctx.service.restore('employee-1');

      expect(ctx.employeeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });

    it('should throw NotFoundException if employee not found', async () => {
      ctx.mockEmployeeRepo.findOne.mockResolvedValue(null);

      await expect(ctx.service.restore('non-existent')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
