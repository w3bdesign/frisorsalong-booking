import { Service } from './service.entity';
import { Employee } from '../../employees/entities/employee.entity';

describe('Service Entity', () => {
  let service: Service;

  beforeEach(() => {
    service = new Service();
  });

  it('should create a service instance', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(Service);
  });

  it('should have correct properties', () => {
    // Create mock data
    const mockEmployee = new Employee();
    const mockDate = new Date();

    // Set properties
    service.id = 'test-id';
    service.name = 'Haircut';
    service.description = 'Basic haircut service';
    service.duration = 30;
    service.price = 299.99;
    service.isActive = true;
    service.employees = [mockEmployee];
    service.createdAt = mockDate;
    service.updatedAt = mockDate;

    // Verify properties
    expect(service.id).toBe('test-id');
    expect(service.name).toBe('Haircut');
    expect(service.description).toBe('Basic haircut service');
    expect(service.duration).toBe(30);
    expect(service.price).toBe(299.99);
    expect(service.isActive).toBe(true);
    expect(service.employees).toEqual([mockEmployee]);
    expect(service.createdAt).toBe(mockDate);
    expect(service.updatedAt).toBe(mockDate);
  });

  it('should handle empty employees array', () => {
    expect(service.employees).toBeUndefined();
    service.employees = [];
    expect(service.employees).toEqual([]);
  });

  it('should handle decimal price values', () => {
    service.price = 299.99;
    expect(service.price).toBe(299.99);
  });

  it('should handle duration in minutes', () => {
    service.duration = 45;
    expect(service.duration).toBe(45);
  });
});
