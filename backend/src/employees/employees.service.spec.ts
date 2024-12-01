import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Not, LessThan, MoreThan } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepository: Repository<Employee>;
  let bookingRepository: Repository<Booking>;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: UserRole.EMPLOYEE,
    password: 'password123',
  } as User;

  const mockEmployee = {
    id: 'employee-1',
    user: mockUser,
    specializations: ['haircut'],
    isActive: true,
    availability: {
      monday: [{ start: '09:00', end: '17:00' }],
    },
  } as Employee;

  const mockEmployeeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
  };

  const mockBookingRepository = {
    count: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockEmployeeRepository,
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
    employeeRepository = module.get<Repository<Employee>>(getRepositoryToken(Employee));
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createEmployeeDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      specializations: ['haircut'],
    };

    it('should create an employee successfully', async () => {
      // Mock email check
      mockUserRepository.findOne.mockResolvedValue(null);

      // Mock user creation
      const mockCreatedUser = {
        ...mockUser,
        password: expect.any(String),
      };
      mockUserRepository.create.mockReturnValue(mockCreatedUser);
      mockUserRepository.save.mockResolvedValue({ ...mockCreatedUser, id: 'user-1' });

      // Mock employee creation
      const mockCreatedEmployee = {
        user: mockCreatedUser,
        specializations: createEmployeeDto.specializations,
        isActive: true,
        availability: {},
      };
      mockEmployeeRepository.create.mockReturnValue(mockCreatedEmployee);
      mockEmployeeRepository.save.mockResolvedValue({ ...mockCreatedEmployee, id: 'employee-1' });

      const result = await service.create(createEmployeeDto);

      expect(result.employee).toBeDefined();
      expect(result.temporaryPassword).toBeDefined();
      expect(result.temporaryPassword.length).toBe(8);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createEmployeeDto.email }
      });
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: createEmployeeDto.email,
        firstName: createEmployeeDto.firstName,
        lastName: createEmployeeDto.lastName,
        role: UserRole.EMPLOYEE,
      }));
      expect(userRepository.save).toHaveBeenCalled();
      expect(employeeRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        specializations: createEmployeeDto.specializations,
        isActive: true,
        availability: {},
      }));
      expect(employeeRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        new ConflictException('Email already exists')
      );
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(employeeRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockUserRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.resetPassword('employee-1');

      expect(result).toBeDefined();
      expect(result.temporaryPassword).toBeDefined();
      expect(result.temporaryPassword.length).toBe(8);
      expect(userRepository.update).toHaveBeenCalledWith(
        mockEmployee.user.id,
        expect.objectContaining({
          password: expect.any(String),
        })
      );
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(service.resetPassword('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return an employee when found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);

      const result = await service.findOne('employee-1');

      expect(result).toEqual(mockEmployee);
      expect(employeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'employee-1' },
        relations: ['user', 'services'],
      });
    });

    it('should throw NotFoundException when employee not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('isAvailable', () => {
    const startTime = new Date('2024-01-01T10:00:00Z'); // Monday
    const endTime = new Date('2024-01-01T11:00:00Z');

    it('should return true when employee is available', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockBookingRepository.count.mockResolvedValue(0);

      const result = await service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(true);
      expect(bookingRepository.count).toHaveBeenCalledWith({
        where: {
          employee: { id: 'employee-1' },
          startTime: Not(MoreThan(endTime)),
          endTime: Not(LessThan(startTime)),
        },
      });
    });

    it('should return false when employee has conflicting bookings', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockBookingRepository.count.mockResolvedValue(1);

      const result = await service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(false);
    });

    it('should exclude specified booking when checking availability', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockBookingRepository.count.mockResolvedValue(0);

      const result = await service.isAvailable('employee-1', startTime, endTime, 'booking-1');

      expect(result).toBe(true);
      expect(bookingRepository.count).toHaveBeenCalledWith({
        where: {
          employee: { id: 'employee-1' },
          startTime: Not(MoreThan(endTime)),
          endTime: Not(LessThan(startTime)),
          id: Not('booking-1'),
        },
      });
    });

    it('should return false when employee is inactive', async () => {
      const inactiveEmployee = { ...mockEmployee, isActive: false };
      mockEmployeeRepository.findOne.mockResolvedValue(inactiveEmployee);

      const result = await service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(false);
    });

    it('should return false when time is outside availability', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      const startTimeOutside = new Date('2024-01-01T07:00:00Z'); // 7 AM UTC (outside 9-17)
      const endTimeOutside = new Date('2024-01-01T08:00:00Z'); // 8 AM UTC (outside 9-17)

      const result = await service.isAvailable('employee-1', startTimeOutside, endTimeOutside);

      expect(result).toBe(false);
    });
  });

  describe('findAll', () => {
    it('should return all active employees', async () => {
      const mockEmployees = [mockEmployee];
      mockEmployeeRepository.find.mockResolvedValue(mockEmployees);

      const result = await service.findAll();

      expect(result).toEqual(mockEmployees);
      expect(employeeRepository.find).toHaveBeenCalledWith({
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
      const updatedEmployee = {
        ...mockEmployee,
        ...updateEmployeeDto,
      };
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockEmployeeRepository.save.mockResolvedValue(updatedEmployee);

      const result = await service.update('employee-1', updateEmployeeDto);

      expect(result).toEqual(updatedEmployee);
      expect(employeeRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateEmployeeDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should mark employee as inactive', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      const inactiveEmployee = { ...mockEmployee, isActive: false };
      mockEmployeeRepository.save.mockResolvedValue(inactiveEmployee);

      await service.remove('employee-1');

      expect(employeeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('restore', () => {
    it('should mark employee as active', async () => {
      const inactiveEmployee = { ...mockEmployee, isActive: false };
      mockEmployeeRepository.findOne.mockResolvedValue(inactiveEmployee);
      mockEmployeeRepository.save.mockResolvedValue(mockEmployee);

      await service.restore('employee-1');

      expect(employeeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(service.restore('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
