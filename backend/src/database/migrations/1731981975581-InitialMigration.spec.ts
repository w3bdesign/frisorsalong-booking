import { QueryRunner } from 'typeorm';
import { InitialMigration1731981975581 } from './1731981975581-InitialMigration';

class TestInitialMigration extends InitialMigration1731981975581 {
  public testGetErrorMessage(error: unknown): string {
    return this.getErrorMessage(error);
  }

  public testExecuteQuery(queryRunner: QueryRunner, sql: string): Promise<void> {
    return this.executeQuery(queryRunner, sql);
  }

  public testExecuteQueries(queryRunner: QueryRunner, queries: string[]): Promise<void> {
    return this.executeQueries(queryRunner, queries);
  }
}

describe('InitialMigration1731981975581', () => {
  let migration: TestInitialMigration;
  let mockQueryRunner: QueryRunner;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    migration = new TestInitialMigration();
    mockQuery = jest.fn();
    mockQueryRunner = {
      query: mockQuery,
    } as unknown as QueryRunner;
  });

  describe('getErrorMessage', () => {
    it('should handle Error instance', () => {
      const error = new Error('Test error');
      const result = migration.testGetErrorMessage(error);
      expect(result).toBe('Test error');
    });

    it('should handle string error', () => {
      const error = 'String error';
      const result = migration.testGetErrorMessage(error);
      expect(result).toBe('String error');
    });

    it('should handle unknown error type', () => {
      const error = { custom: 'error' };
      const result = migration.testGetErrorMessage(error);
      expect(result).toBe('Unknown error occurred');
    });
  });

  describe('executeQuery', () => {
    it('should throw error for invalid query runner', async () => {
      const invalidQueryRunner = {} as QueryRunner;
      await expect(migration.testExecuteQuery(invalidQueryRunner, 'SELECT 1'))
        .rejects
        .toThrow('Invalid query runner');
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Query execution failed');
      mockQuery.mockRejectedValue(error);

      await expect(migration.testExecuteQuery(mockQueryRunner, 'SELECT 1'))
        .rejects
        .toThrow('Migration failed executing query: SELECT 1\nError: Query failed: SELECT 1\nError: Query execution failed');
    });

    it('should execute query successfully', async () => {
      mockQuery.mockResolvedValue({});
      await expect(migration.testExecuteQuery(mockQueryRunner, 'SELECT 1'))
        .resolves
        .not
        .toThrow();
    });
  });

  describe('executeQueries', () => {
    it('should execute multiple queries successfully', async () => {
      mockQuery.mockResolvedValue({});
      const queries = ['SELECT 1', 'SELECT 2'];
      await expect(migration.testExecuteQueries(mockQueryRunner, queries))
        .resolves
        .not
        .toThrow();
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should throw error when any query fails', async () => {
      const error = new Error('Query execution failed');
      mockQuery.mockRejectedValue(error);
      const queries = ['SELECT 1', 'SELECT 2'];
      await expect(migration.testExecuteQueries(mockQueryRunner, queries))
        .rejects
        .toThrow('Migration failed executing query: SELECT 1\nError: Query failed: SELECT 1\nError: Query execution failed');
    });
  });

  describe('up', () => {
    it('should execute migration up successfully', async () => {
      mockQuery.mockResolvedValue({});
      await expect(migration.up(mockQueryRunner)).resolves.not.toThrow();
      // Verify all required queries were executed
      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle errors during up migration', async () => {
      const error = new Error('Migration failed');
      mockQuery.mockRejectedValue(error);
      await expect(migration.up(mockQueryRunner))
        .rejects
        .toThrow('Migration up failed: Migration failed');
    });
  });

  describe('down', () => {
    it('should execute migration down successfully', async () => {
      mockQuery.mockResolvedValue({});
      await expect(migration.down(mockQueryRunner)).resolves.not.toThrow();
      // Verify all required queries were executed
      expect(mockQuery).toHaveBeenCalled();
    });

    it('should handle errors during down migration', async () => {
      const error = new Error('Migration failed');
      mockQuery.mockRejectedValue(error);
      await expect(migration.down(mockQueryRunner))
        .rejects
        .toThrow('Migration down failed: Migration failed');
    });
  });
});
