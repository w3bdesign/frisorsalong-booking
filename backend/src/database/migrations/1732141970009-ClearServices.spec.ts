import { QueryRunner } from 'typeorm';
import { ClearServices1732141970009 } from './1732141970009-ClearServices';

describe('ClearServices1732141970009', () => {
  let migration: ClearServices1732141970009;
  let queryRunner: QueryRunner;

  beforeEach(() => {
    migration = new ClearServices1732141970009();
    queryRunner = {
      query: jest.fn(),
    } as unknown as QueryRunner;
  });

  describe('up', () => {
    it('should clear existing services and insert new Norwegian services', async () => {
      await migration.up(queryRunner);
      const { calls } = (queryRunner.query as jest.Mock).mock;
      const queries = calls.map((call: unknown[]) => call[0] as string);
      
      // Verify deletion queries
      expect(queries).toContain('DELETE FROM "employee_services"');
      expect(queries).toContain('DELETE FROM "services"');

      // Verify service insertions
      const insertQuery = queries.find(q => q.includes('INSERT INTO "services"'));
      expect(insertQuery).toBeDefined();
      
      const expectedServices = [
        'Standard Klipp',
        'Styling Klipp',
        'Skjegg Trim',
        'Full Service'
      ];

      expectedServices.forEach(service => {
        expect(insertQuery).toContain(service);
      });
    });
  });

  describe('down', () => {
    it('should delete Norwegian services', async () => {
      await migration.down(queryRunner);
      const { calls } = (queryRunner.query as jest.Mock).mock;
      const queries = calls.map((call: unknown[]) => call[0] as string);
      
      const expectedQuery = 'DELETE FROM "services" WHERE "name" IN (\'Standard Klipp\', \'Styling Klipp\', \'Skjegg Trim\', \'Full Service\')';
      expect(queries).toContain(expectedQuery);
    });
  });
});
