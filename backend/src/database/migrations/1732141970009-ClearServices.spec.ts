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
      
      // Verify deletion queries
      const deleteQueries = calls.map((call: unknown[]) => call[0] as string);
      expect(deleteQueries).toEqual(
        expect.arrayContaining([
          'DELETE FROM "employee_services"',
          'DELETE FROM "services"'
        ])
      );

      // Verify insertion of new services
      const insertQueries = calls.map((call: unknown[]) => call[0] as string);
      const expectedServices = [
        'Standard Klipp',
        'Styling Klipp',
        'Skjegg Trim',
        'Full Service'
      ];

      expectedServices.forEach(serviceName => {
        const hasService = insertQueries.some(query => 
          query.includes('INSERT INTO "services"') && 
          query.includes(serviceName)
        );
        expect(hasService).toBe(true);
      });
    });
  });

  describe('down', () => {
    it('should delete Norwegian services', async () => {
      await migration.down(queryRunner);

      const expectedQuery = 'DELETE FROM "services" WHERE "name" IN (\'Standard Klipp\', \'Styling Klipp\', \'Skjegg Trim\', \'Full Service\')';
      const { calls } = (queryRunner.query as jest.Mock).mock;
      const actualQueries = calls.map((call: unknown[]) => call[0] as string);
      
      expect(actualQueries).toContain(expectedQuery);
    });
  });
});
