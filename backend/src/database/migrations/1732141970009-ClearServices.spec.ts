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

      // Verify deletion queries
      expect(queryRunner.query).toHaveBeenCalledWith(`DELETE FROM "employee_services"`);
      expect(queryRunner.query).toHaveBeenCalledWith(`DELETE FROM "services"`);

      // Verify insertion of new services
      expect(queryRunner.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO "services"'));
      expect(queryRunner.query).toHaveBeenCalledWith(expect.stringContaining('Standard Klipp'));
      expect(queryRunner.query).toHaveBeenCalledWith(expect.stringContaining('Styling Klipp'));
      expect(queryRunner.query).toHaveBeenCalledWith(expect.stringContaining('Skjegg Trim'));
      expect(queryRunner.query).toHaveBeenCalledWith(expect.stringContaining('Full Service'));
    });
  });

  describe('down', () => {
    it('should delete Norwegian services', async () => {
      await migration.down(queryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith(
        `DELETE FROM "services" WHERE "name" IN ('Standard Klipp', 'Styling Klipp', 'Skjegg Trim', 'Full Service')`
      );
    });
  });
});
