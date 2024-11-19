import { QueryRunner } from 'typeorm';
import { CreateBookingSystem1731981975582 } from './1731981975582-CreateBookingSystem';

describe('CreateBookingSystem1731981975582', () => {
  let migration: CreateBookingSystem1731981975582;
  let queryRunner: QueryRunner;

  beforeEach(() => {
    migration = new CreateBookingSystem1731981975582();
    queryRunner = {
      query: jest.fn(),
    } as unknown as QueryRunner;
  });

  it('should have correct name', () => {
    expect(migration.name).toBe('CreateBookingSystem1731981975582');
  });

  describe('up', () => {
    it('should create services table with correct schema', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringMatching(/CREATE TABLE[\s\S]*services[\s\S]*id[\s\S]*name[\s\S]*description[\s\S]*duration[\s\S]*price/),
      );
    });

    it('should create employees table with correct schema and foreign key', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringMatching(/CREATE TABLE[\s\S]*employees[\s\S]*CONSTRAINT[\s\S]*FOREIGN KEY[\s\S]*REFERENCES[\s\S]*users/),
      );
    });

    it('should create employee_services junction table with correct constraints', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringMatching(/CREATE TABLE[\s\S]*employee_services[\s\S]*PRIMARY KEY[\s\S]*FOREIGN KEY/),
      );
    });

    it('should create bookings table with correct schema and foreign keys', async () => {
      await migration.up(queryRunner);

      const bookingsCall = (queryRunner.query as jest.Mock).mock.calls.find(call =>
        call[0].includes('CREATE TABLE "bookings"'),
      );

      expect(bookingsCall[0]).toMatch(/CONSTRAINT[\s\S]*fk_booking_customer[\s\S]*FOREIGN KEY[\s\S]*REFERENCES[\s\S]*users/);
      expect(bookingsCall[0]).toMatch(/CONSTRAINT[\s\S]*fk_booking_employee[\s\S]*FOREIGN KEY[\s\S]*REFERENCES[\s\S]*employees/);
      expect(bookingsCall[0]).toMatch(/CONSTRAINT[\s\S]*fk_booking_service[\s\S]*FOREIGN KEY[\s\S]*REFERENCES[\s\S]*services/);
    });

    it('should create all required indexes', async () => {
      await migration.up(queryRunner);

      const expectedIndexes = [
        'idx_bookings_customer',
        'idx_bookings_employee',
        'idx_bookings_service',
        'idx_bookings_start_time',
        'idx_bookings_status',
      ];

      expectedIndexes.forEach(indexName => {
        expect(queryRunner.query).toHaveBeenCalledWith(
          expect.stringContaining(`CREATE INDEX "${indexName}"`),
        );
      });
    });
  });

  describe('down', () => {
    it('should drop all indexes in correct order', async () => {
      await migration.down(queryRunner);

      const expectedIndexes = [
        'idx_bookings_status',
        'idx_bookings_start_time',
        'idx_bookings_service',
        'idx_bookings_employee',
        'idx_bookings_customer',
      ];

      const calls = (queryRunner.query as jest.Mock).mock.calls.map(
        call => call[0],
      );

      expectedIndexes.forEach((indexName, i) => {
        const dropIndex = calls.findIndex(call =>
          call.includes(`DROP INDEX "${indexName}"`)
        );
        expect(dropIndex).toBe(i);
      });
    });

    it('should drop tables in correct order', async () => {
      await migration.down(queryRunner);

      const calls = (queryRunner.query as jest.Mock).mock.calls.map(
        call => call[0],
      );
      
      // Verify drop order: bookings -> employee_services -> employees -> services
      const bookingsIndex = calls.findIndex(call =>
        call.includes('DROP TABLE "bookings"'),
      );
      const employeeServicesIndex = calls.findIndex(call =>
        call.includes('DROP TABLE "employee_services"'),
      );
      const employeesIndex = calls.findIndex(call =>
        call.includes('DROP TABLE "employees"'),
      );
      const servicesIndex = calls.findIndex(call =>
        call.includes('DROP TABLE "services"'),
      );

      expect(bookingsIndex).toBeLessThan(employeeServicesIndex);
      expect(employeeServicesIndex).toBeLessThan(employeesIndex);
      expect(employeesIndex).toBeLessThan(servicesIndex);
    });

    it('should drop all tables', async () => {
      await migration.down(queryRunner);

      const expectedTables = ['bookings', 'employee_services', 'employees', 'services'];

      expectedTables.forEach(tableName => {
        expect(queryRunner.query).toHaveBeenCalledWith(
          expect.stringContaining(`DROP TABLE "${tableName}"`),
        );
      });
    });
  });
});
