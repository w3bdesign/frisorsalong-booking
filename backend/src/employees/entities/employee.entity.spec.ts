import { Employee } from './employee.entity';
import { User } from '../../users/entities/user.entity';
import { Service } from '../../services/entities/service.entity';

describe('Employee Entity', () => {
  let employee: Employee;

  beforeEach(() => {
    employee = new Employee();
  });

  it('should create an employee instance', () => {
    expect(employee).toBeDefined();
    expect(employee).toBeInstanceOf(Employee);
  });

  it('should have correct properties', () => {
    // Create mock data
    const mockUser = new User();
    const mockService = new Service();
    const mockAvailability = {
      monday: [{ start: '09:00', end: '17:00' }],
      tuesday: [{ start: '09:00', end: '17:00' }],
    };
    const mockSpecializations = ['Haircut', 'Styling'];
    const mockDate = new Date();

    // Set properties
    employee.id = 'test-id';
    employee.user = mockUser;
    employee.services = [mockService];
    employee.availability = mockAvailability;
    employee.specializations = mockSpecializations;
    employee.isActive = true;
    employee.createdAt = mockDate;
    employee.updatedAt = mockDate;

    // Verify properties
    expect(employee.id).toBe('test-id');
    expect(employee.user).toBe(mockUser);
    expect(employee.services).toEqual([mockService]);
    expect(employee.availability).toEqual(mockAvailability);
    expect(employee.specializations).toEqual(mockSpecializations);
    expect(employee.isActive).toBe(true);
    expect(employee.createdAt).toBe(mockDate);
    expect(employee.updatedAt).toBe(mockDate);
  });

  it('should handle empty availability', () => {
    employee.availability = {};
    expect(employee.availability).toEqual({});
  });

  it('should handle empty specializations', () => {
    expect(employee.specializations).toEqual([]);
  });

  it('should handle empty services', () => {
    expect(employee.services).toBeUndefined();
    employee.services = [];
    expect(employee.services).toEqual([]);
  });
});
