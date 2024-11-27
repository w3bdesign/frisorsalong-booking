import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Not, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

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
    availability: {},
  } as Employee;

  const mockEmployeeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockBookingRepository = {
    count: jest.fn(),
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
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
  });

  afterEach(() => {
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
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockEmployeeRepository.create.mockReturnValue(mockEmployee);
      mockEmployeeRepository.save.mockResolvedValue(mockEmployee);

      const result = await service.create(createEmployeeDto);

      expect(result.employee).toEqual(mockEmployee);
      expect(result.temporaryPassword).toBeDefined();
      expect(result.temporaryPassword.length).toBe(10);
      expect(userRepository.save).toHaveBeenCalled();
      expect(employeeRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.create(createEmployeeDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockUserRepository.save.mockResolvedValue({ ...mockUser, password: 'newpass' });

      const result = await service.resetPassword('employee-1');

      expect(result).toBeDefined();
      expect(result.length).toBe(10);
      expect(userRepository.save).toHaveBeenCalled();
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
        relations: ['user'],
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
    const startTime = new Date('2024-01-01T10:00:00Z');
    const endTime = new Date('2024-01-01T11:00:00Z');

    it('should return true when no conflicting bookings exist', async () => {
      mockBookingRepository.count.mockResolvedValue(0);

      const result = await service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(true);
      expect(bookingRepository.count).toHaveBeenCalledWith({
        where: {
          employee: { id: 'employee-1' },
          status: Not(BookingStatus.CANCELLED),
          startTime: LessThanOrEqual(endTime),
          endTime: MoreThanOrEqual(startTime),
        },
      });
    });

    it('should return false when conflicting bookings exist', async () => {
      mockBookingRepository.count.mockResolvedValue(1);

      const result = await service.isAvailable('employee-1', startTime, endTime);

      expect(result).toBe(false);
    });

    it('should exclude specified booking when checking availability', async () => {
      mockBookingRepository.count.mockResolvedValue(0);

      const result = await service.isAvailable('employee-1', startTime, endTime, 'booking-1');

      expect(result).toBe(true);
      expect(bookingRepository.count).toHaveBeenCalledWith({
        where: {
          employee: { id: 'employee-1' },
          status: Not(BookingStatus.CANCELLED),
          startTime: LessThanOrEqual(endTime),
          endTime: MoreThanOrEqual(startTime),
          id: Not('booking-1'),
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all employees sorted by name', async () => {
      const mockEmployees = [mockEmployee];
      mockEmployeeRepository.find.mockResolvedValue(mockEmployees);

      const result = await service.findAll();

      expect(result).toEqual(mockEmployees);
      expect(employeeRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
        order: {
          user: {
            firstName: 'ASC',
            lastName: 'ASC',
          },
        },
      });
    });
  });

  describe('update', () => {
    const updateEmployeeDto = {
      firstName: 'John Updated',
      email: 'john.updated@example.com',
    };

    it('should update employee successfully', async () => {
      const updatedEmployee = {
        ...mockEmployee,
        user: { ...mockUser, ...updateEmployeeDto },
      };
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.save.mockResolvedValue(updatedEmployee.user);
      mockEmployeeRepository.save.mockResolvedValue(updatedEmployee);

      const result = await service.update('employee-1', updateEmployeeDto);

      expect(result).toEqual(updatedEmployee);
      expect(userRepository.save).toHaveBeenCalled();
      expect(employeeRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists for different user', async () => {
      // Current employee with original email
      const currentEmployee = {
        ...mockEmployee,
        user: { ...mockUser, id: 'current-user-id', email: 'original@example.com' },
      };

      // Existing user with the email we want to update to
      const existingUser = {
        id: 'other-user-id',
        email: updateEmployeeDto.email,
      };

      mockEmployeeRepository.findOne.mockResolvedValue(currentEmployee);
      mockUserRepository.findOne.mockResolvedValue(existingUser);

      await expect(
        service.update('employee-1', updateEmployeeDto),
      ).rejects.toThrow(ConflictException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: updateEmployeeDto.email },
      });
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent', updateEmployeeDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should mark employee as inactive when no future bookings exist', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockBookingRepository.count.mockResolvedValue(0);
      mockEmployeeRepository.save.mockResolvedValue({ ...mockEmployee, isActive: false });

      await service.remove('employee-1');

      expect(employeeRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });

    it('should throw ConflictException when future bookings exist', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(mockEmployee);
      mockBookingRepository.count.mockResolvedValue(1);

      await expect(service.remove('employee-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockEmployeeRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAvailableForService', () => {
    const startTime = new Date('2024-01-01T10:00:00Z');
    const mockEmployees = [
      { ...mockEmployee, id: 'employee-1' },
      { ...mockEmployee, id: 'employee-2' },
    ];

    beforeEach(() => {
      mockEmployeeRepository.find.mockResolvedValue(mockEmployees);
    });

    it('should return only available employees for service', async () => {
      mockBookingRepository.count
        .mockResolvedValueOnce(0) // employee-1 is available
        .mockResolvedValueOnce(1); // employee-2 is not available

      const result = await service.findAvailableForService('service-1', startTime);

      expect(result).toEqual([mockEmployees[0]]);
      expect(employeeRepository.find).toHaveBeenCalledWith({
        relations: ['services'],
        where: {
          services: {
            id: 'service-1',
          },
          isActive: true,
        },
      });
    });

    it('should return empty array when no employees are available', async () => {
      mockBookingRepository.count.mockResolvedValue(1);

      const result = await service.findAvailableForService('service-1', startTime);

      expect(result).toEqual([]);
    });

    it('should return all employees when all are available', async () => {
      mockBookingRepository.count.mockResolvedValue(0);

      const result = await service.findAvailableForService('service-1', startTime);

      expect(result).toEqual(mockEmployees);
    });
  });
});
