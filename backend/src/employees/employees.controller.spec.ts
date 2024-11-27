import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Employee } from './entities/employee.entity';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let service: EmployeesService;

  const mockEmployee = {
    id: 'employee-1',
    user: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    specializations: ['haircut'],
    isActive: true,
    availability: {},
  } as Employee;

  const mockEmployeesService = {
    create: jest.fn(),
    resetPassword: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createEmployeeDto = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      specializations: ['haircut'],
    };

    const createResponse = {
      employee: mockEmployee,
      temporaryPassword: 'temp123',
    };

    it('should create an employee successfully', async () => {
      mockEmployeesService.create.mockResolvedValue(createResponse);

      const result = await controller.create(createEmployeeDto);

      expect(result).toEqual(createResponse);
      expect(service.create).toHaveBeenCalledWith(createEmployeeDto);
    });

    it('should handle duplicate email error', async () => {
      mockEmployeesService.create.mockRejectedValue(
        new Error('User with this email already exists'),
      );

      await expect(controller.create(createEmployeeDto)).rejects.toThrow(
        'En bruker med denne e-postadressen eksisterer allerede',
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const newPassword = 'newTemp123';
      mockEmployeesService.resetPassword.mockResolvedValue(newPassword);

      const result = await controller.resetPassword('employee-1');

      expect(result).toEqual({ temporaryPassword: newPassword });
      expect(service.resetPassword).toHaveBeenCalledWith('employee-1');
    });

    it('should handle employee not found error', async () => {
      mockEmployeesService.resetPassword.mockRejectedValue(
        new Error('Employee not found'),
      );

      await expect(controller.resetPassword('non-existent')).rejects.toThrow(
        'Fant ikke ansatt med ID non-existent',
      );
    });
  });

  describe('findAll', () => {
    it('should return all employees', async () => {
      const employees = [mockEmployee];
      mockEmployeesService.findAll.mockResolvedValue(employees);

      const result = await controller.findAll();

      expect(result).toEqual(employees);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an employee by id', async () => {
      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);

      const result = await controller.findOne('employee-1');

      expect(result).toEqual(mockEmployee);
      expect(service.findOne).toHaveBeenCalledWith('employee-1');
    });

    it('should handle employee not found error', async () => {
      mockEmployeesService.findOne.mockRejectedValue(
        new Error('Employee not found'),
      );

      await expect(controller.findOne('non-existent')).rejects.toThrow(
        'Fant ikke ansatt med ID non-existent',
      );
    });
  });

  describe('update', () => {
    const updateEmployeeDto = {
      firstName: 'John Updated',
      email: 'john.updated@example.com',
    };

    it('should update an employee successfully', async () => {
      const updatedEmployee = { ...mockEmployee, ...updateEmployeeDto };
      mockEmployeesService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update('employee-1', updateEmployeeDto);

      expect(result).toEqual(updatedEmployee);
      expect(service.update).toHaveBeenCalledWith('employee-1', updateEmployeeDto);
    });

    it('should handle duplicate email error', async () => {
      mockEmployeesService.update.mockRejectedValue(
        new Error('User with this email already exists'),
      );

      await expect(
        controller.update('employee-1', updateEmployeeDto),
      ).rejects.toThrow('En bruker med denne e-postadressen eksisterer allerede');
    });

    it('should handle employee not found error', async () => {
      mockEmployeesService.update.mockRejectedValue(
        new Error('Employee not found'),
      );

      await expect(
        controller.update('non-existent', updateEmployeeDto),
      ).rejects.toThrow('Fant ikke ansatt med ID non-existent');
    });
  });

  describe('remove', () => {
    it('should remove an employee successfully', async () => {
      mockEmployeesService.remove.mockResolvedValue(undefined);

      await controller.remove('employee-1');

      expect(service.remove).toHaveBeenCalledWith('employee-1');
    });

    it('should handle employee with future bookings error', async () => {
      mockEmployeesService.remove.mockRejectedValue(
        new Error('Cannot delete employee with future bookings'),
      );

      await expect(controller.remove('employee-1')).rejects.toThrow(
        'Kan ikke slette ansatt med fremtidige bestillinger',
      );
    });

    it('should handle employee not found error', async () => {
      mockEmployeesService.remove.mockRejectedValue(
        new Error('Employee not found'),
      );

      await expect(controller.remove('non-existent')).rejects.toThrow(
        'Fant ikke ansatt med ID non-existent',
      );
    });
  });
});
