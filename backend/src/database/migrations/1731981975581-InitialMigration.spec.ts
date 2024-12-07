import { QueryRunner } from 'typeorm';
import { InitialMigration1731981975581 } from './1731981975581-InitialMigration';

interface MockCall {
  query: string;
  params?: unknown[];
}

type MockQueryFunction = jest.Mock<Promise<unknown>, [string, ...unknown[]]>;

describe('InitialMigration1731981975581', () => {
  let migration: InitialMigration1731981975581;
  let queryRunner: QueryRunner;

  beforeEach(() => {
    migration = new InitialMigration1731981975581();
    queryRunner = {
      query: jest.fn(),
    } as unknown as QueryRunner;
  });

  it('should have correct name', () => {
    expect(migration.name).toBe('InitialMigration1731981975581');
  });

  describe('up', () => {
    it('should create user role enum', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TYPE "public"."users_role_enum"'),
      );
    });

    it('should create users table', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE "users"'),
      );
    });

    it('should create employees table', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE "employees"'),
      );
    });

    it('should create services table', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE "services"'),
      );
    });

    it('should create booking status enum', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TYPE "public"."bookings_status_enum"'),
      );
    });

    it('should create bookings table', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE "bookings"'),
      );
    });

    it('should create employee_services table', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE "employee_services"'),
      );
    });

    it('should create indexes', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX'),
      );
    });

    it('should create foreign key constraints', async () => {
      await migration.up(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('ALTER TABLE'),
      );
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('FOREIGN KEY'),
      );
    });
  });

  describe('down', () => {
    it('should drop foreign key constraints', async () => {
      await migration.down(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('DROP CONSTRAINT'),
      );
    });

    it('should drop indexes', async () => {
      await migration.down(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('DROP INDEX'),
      );
    });

    it('should drop tables in correct order', async () => {
      await migration.down(queryRunner);

      const mockQueryFn = queryRunner.query as MockQueryFunction;
      const calls = mockQueryFn.mock.calls.map((call): string => {
        if (!Array.isArray(call) || call.length === 0 || typeof call[0] !== 'string') {
          throw new Error('Invalid mock call format');
        }
        return call[0];
      });
      
      // Verify drop order: employee_services -> bookings -> services -> employees -> users
      const employeeServicesIndex = calls.findIndex(call =>
        call.includes('DROP TABLE "employee_services"'),
      );
      const bookingsIndex = calls.findIndex(call =>
        call.includes('DROP TABLE "bookings"'),
      );
      const servicesIndex = calls.findIndex(call =>
        call.includes('DROP TABLE "services"'),
      );
      const employeesIndex = calls.findIndex(call =>
        call.includes('DROP TABLE "employees"'),
      );
      const usersIndex = calls.findIndex(call =>
        call.includes('DROP TABLE "users"'),
      );

      expect(employeeServicesIndex).toBeLessThan(bookingsIndex);
      expect(bookingsIndex).toBeLessThan(servicesIndex);
      expect(servicesIndex).toBeLessThan(employeesIndex);
      expect(employeesIndex).toBeLessThan(usersIndex);
    });

    it('should drop enums', async () => {
      await migration.down(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('DROP TYPE "public"."users_role_enum"'),
      );
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('DROP TYPE "public"."bookings_status_enum"'),
      );
    });
  });
});
