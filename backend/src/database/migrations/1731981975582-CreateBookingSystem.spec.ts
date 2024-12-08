import { QueryRunner } from 'typeorm';
import { CreateBookingSystem1731981975582 } from './1731981975582-CreateBookingSystem';

// Helper functions to reduce nesting and improve readability
const findQueryCall = (calls: string[], pattern: string): number =>
  calls.findIndex(call => call.includes(pattern));

const verifyTableSchema = (query: string, tableName: string, ...fields: string[]): void => {
  const tablePattern = new RegExp(`CREATE TABLE[\\s\\S]*${tableName}[\\s\\S]*${fields.join('[\\s\\S]*')}`);
  expect(query).toMatch(tablePattern);
};

const verifyForeignKey = (query: string, tableName: string, columnName: string, referencedTable: string): void => {
  const pattern = new RegExp(
    `CONSTRAINT[\\s\\S]*FOREIGN KEY \\("${columnName}"\\)[\\s\\S]*REFERENCES "${referencedTable}"`,
    'i'
  );
  expect(query).toMatch(pattern);
};

const verifyDropOrder = (calls: string[], tables: string[]): void => {
  const indices = tables.map(table => findQueryCall(calls, `DROP TABLE "${table}"`));
  
  // Verify each index is greater than the previous one and store the final index
  const finalIndex = indices.reduce((prev, curr) => {
    expect(curr).toBeGreaterThan(prev);
    return curr;
  }, -1); // Start with -1 to ensure first index is valid

  // Verify the final index exists in the array
  expect(indices).toContain(finalIndex);
  // Verify we processed all tables
  expect(finalIndex).toBeLessThan(calls.length);
};

describe('CreateBookingSystem1731981975582', () => {
  let migration: CreateBookingSystem1731981975582;
  let queryRunner: QueryRunner;
  let queryCalls: string[];

  beforeEach(() => {
    migration = new CreateBookingSystem1731981975582();
    queryRunner = {
      query: jest.fn().mockImplementation((query: string) => Promise.resolve([query])),
    } as unknown as QueryRunner;
  });

  afterEach(() => {
    const mockCalls = (queryRunner.query as jest.Mock).mock.calls;
    queryCalls = mockCalls.map((call: [string]) => call[0]);
  });

  test('migration name is correct', () => {
    expect(migration.name).toBe('CreateBookingSystem1731981975582');
  });

  describe('up migration', () => {
    beforeEach(async () => {
      await migration.up(queryRunner);
      const mockCalls = (queryRunner.query as jest.Mock).mock.calls;
      queryCalls = mockCalls.map((call: [string]) => call[0]);
    });

    test('creates services table with required fields', () => {
      const servicesQuery = queryCalls.find(call => call.includes('CREATE TABLE "services"'));
      if (!servicesQuery) throw new Error('Services table creation query not found');
      verifyTableSchema(servicesQuery, 'services', 'id', 'name', 'description', 'duration', 'price');
    });

    test('creates employees table with user foreign key', () => {
      const employeesQuery = queryCalls.find(call => call.includes('CREATE TABLE "employees"'));
      if (!employeesQuery) throw new Error('Employees table creation query not found');
      verifyForeignKey(employeesQuery, 'employees', 'user_id', 'users');
    });

    test('creates employee_services junction table', () => {
      const junctionQuery = queryCalls.find(call => call.includes('CREATE TABLE "employee_services"'));
      if (!junctionQuery) throw new Error('Employee services junction table creation query not found');
      verifyForeignKey(junctionQuery, 'employee_services', 'employee_id', 'employees');
      verifyForeignKey(junctionQuery, 'employee_services', 'service_id', 'services');
    });

    test('creates bookings table with all foreign keys', () => {
      const bookingsQuery = queryCalls.find(call => call.includes('CREATE TABLE "bookings"'));
      if (!bookingsQuery) throw new Error('Bookings table creation query not found');
      
      [
        ['customer_id', 'users'],
        ['employee_id', 'employees'],
        ['service_id', 'services'],
      ].forEach(([column, reference]) => {
        verifyForeignKey(bookingsQuery, 'bookings', column, reference);
      });
    });

    test('creates all required indexes', () => {
      const indexPatterns = [
        'idx_bookings_customer',
        'idx_bookings_employee',
        'idx_bookings_service',
        'idx_bookings_start_time',
        'idx_bookings_status',
      ];

      indexPatterns.forEach(indexName => {
        expect(queryRunner.query).toHaveBeenCalledWith(
          expect.stringContaining(`CREATE INDEX "${indexName}"`)
        );
      });
    });
  });

  describe('down migration', () => {
    beforeEach(async () => {
      await migration.down(queryRunner);
      const mockCalls = (queryRunner.query as jest.Mock).mock.calls;
      queryCalls = mockCalls.map((call: [string]) => call[0]);
    });

    test('drops indexes in correct order', () => {
      const indexOrder = [
        'idx_bookings_status',
        'idx_bookings_start_time',
        'idx_bookings_service',
        'idx_bookings_employee',
        'idx_bookings_customer',
      ];

      indexOrder.forEach((indexName, i) => {
        const dropIndex = findQueryCall(queryCalls, `DROP INDEX "${indexName}"`);
        expect(dropIndex).toBe(i);
      });
    });

    test('drops tables in correct order', () => {
      const tableOrder = ['bookings', 'employee_services', 'employees', 'services'];
      verifyDropOrder(queryCalls, tableOrder);
    });

    test('drops all required tables', () => {
      const requiredTables = ['bookings', 'employee_services', 'employees', 'services'];
      
      requiredTables.forEach(tableName => {
        expect(queryRunner.query).toHaveBeenCalledWith(
          expect.stringContaining(`DROP TABLE "${tableName}"`)
        );
      });
    });
  });
});
