import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Not, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { EmployeesService } from './employees.service';
import { Employee } from './entities/employee.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeRepository: Repository<Employee>;
  let bookingRepository: Repository<Booking>;
  let userRepository: Repository<User>;

  const mockEmployee = {
    id: 'employee-1',
    user: {
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const mockEmployeeRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockBookingRepository = {
    count: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
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
          status: Not('cancelled'),
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
          status: Not('cancelled'),
          startTime: LessThanOrEqual(endTime),
          endTime: MoreThanOrEqual(startTime),
          id: Not('booking-1'),
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all employees', async () => {
      const mockEmployees = [mockEmployee];
      mockEmployeeRepository.find.mockResolvedValue(mockEmployees);

      const result = await service.findAll();
      expect(result).toEqual(mockEmployees);
      expect(employeeRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
        order: {
          user: {
            firstName: 'ASC',
            lastName: 'ASC'
          }
        }
      });
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
      // First employee is available, second is not
      mockBookingRepository.count
        .mockResolvedValueOnce(0)  // employee-1 is available
        .mockResolvedValueOnce(1); // employee-2 is not available

      const result = await service.findAvailableForService('service-1', startTime);
      
      expect(result).toEqual([mockEmployees[0]]);
      expect(employeeRepository.find).toHaveBeenCalledWith({
        relations: ['services'],
        where: {
          services: {
            id: 'service-1',
          },
          isActive: true
        },
      });
    });

    it('should return empty array when no employees are available', async () => {
      // Both employees are unavailable
      mockBookingRepository.count.mockResolvedValue(1);

      const result = await service.findAvailableForService('service-1', startTime);
      expect(result).toEqual([]);
    });

    it('should return all employees when all are available', async () => {
      // All employees are available
      mockBookingRepository.count.mockResolvedValue(0);

      const result = await service.findAvailableForService('service-1', startTime);
      expect(result).toEqual(mockEmployees);
    });
  });
});
