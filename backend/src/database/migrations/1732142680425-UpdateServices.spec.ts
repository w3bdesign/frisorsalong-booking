import { QueryRunner } from 'typeorm';
import { UpdateServices1732142680425 } from './1732142680425-UpdateServices';

describe('UpdateServices1732142680425', () => {
  let migration: UpdateServices1732142680425;
  let queryRunner: QueryRunner;
  let queryMock: jest.Mock;

  beforeEach(() => {
    queryMock = jest.fn();
    queryRunner = {
      query: queryMock,
    } as unknown as QueryRunner;
    migration = new UpdateServices1732142680425();
  });

  describe('up', () => {
    it('should clear existing services and insert updated Norwegian services', async () => {
      await migration.up(queryRunner);

      // Verify deletion queries
      expect(queryRunner.query).toHaveBeenCalledWith(`DELETE FROM "employee_services"`);
      expect(queryRunner.query).toHaveBeenCalledWith(`DELETE FROM "services"`);

      // Verify insertion of updated services
      const calls = queryMock.mock.calls;
      if (!Array.isArray(calls) || calls.length < 3) {
        throw new Error('Expected at least 3 query calls');
      }

      const insertQuery = calls[2][0];
      if (typeof insertQuery !== 'string') {
        throw new Error('Expected string query');
      }

      expect(insertQuery).toContain('INSERT INTO "services"');
      expect(insertQuery).toContain('Standard Klipp');
      expect(insertQuery).toContain('299.00');
      expect(insertQuery).toContain('Styling Klipp');
      expect(insertQuery).toContain('399.00');
      expect(insertQuery).toContain('Skjegg Trim');
      expect(insertQuery).toContain('199.00');
      expect(insertQuery).toContain('Full Service');
      expect(insertQuery).toContain('549.00');
    });
  });

  describe('down', () => {
    it('should delete updated Norwegian services', async () => {
      await migration.down(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        `DELETE FROM "services" WHERE "name" IN ('Standard Klipp', 'Styling Klipp', 'Skjegg Trim', 'Full Service')`
      );
    });
  });
});
