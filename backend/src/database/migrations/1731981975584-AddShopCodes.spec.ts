import { QueryRunner } from 'typeorm';
import { AddShopCodes1731981975584 } from './1731981975584-AddShopCodes';

type SafeQueryRunner = {
  hasTable: jest.Mock<Promise<boolean>, [string]>;
  query: jest.Mock<Promise<void>, [string]>;
};

describe('AddShopCodes1731981975584', () => {
  let migration: AddShopCodes1731981975584;
  let queryRunner: SafeQueryRunner;

  beforeEach(() => {
    migration = new AddShopCodes1731981975584();
    queryRunner = {
      hasTable: jest.fn().mockResolvedValue(false),
      query: jest.fn().mockResolvedValue(undefined),
    };
  });

  it('should have correct name', () => {
    expect(migration.name).toBe('AddShopCodes1731981975584');
  });

  describe('up', () => {
    it('should create shop_codes table if it does not exist', async () => {
      queryRunner.hasTable.mockResolvedValue(false);

      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.hasTable).toHaveBeenCalledWith('shop_codes');
      expect(queryRunner.query).toHaveBeenCalledTimes(2);
      
      const calls = queryRunner.query.mock.calls;
      if (!Array.isArray(calls) || calls.length < 2) {
        throw new Error('Expected at least 2 query calls');
      }

      const createTableQuery = calls[0][0];
      const insertDataQuery = calls[1][0];

      if (typeof createTableQuery !== 'string' || typeof insertDataQuery !== 'string') {
        throw new Error('Expected string queries');
      }

      // Verify create table query
      expect(createTableQuery).toContain('CREATE TABLE "shop_codes"');
      expect(createTableQuery).toContain('"id" uuid NOT NULL DEFAULT uuid_generate_v4()');
      expect(createTableQuery).toContain('"code" character varying NOT NULL');
      expect(createTableQuery).toContain('"shop_name" character varying NOT NULL');
      expect(createTableQuery).toContain('"is_active" boolean NOT NULL DEFAULT true');
      expect(createTableQuery).toContain('"daily_booking_limit" integer NOT NULL DEFAULT 100');
      expect(createTableQuery).toContain('"last_booking_time" TIMESTAMP');
      expect(createTableQuery).toContain('"today_booking_count" integer NOT NULL DEFAULT 0');
      expect(createTableQuery).toContain('"created_at" TIMESTAMP NOT NULL DEFAULT now()');
      expect(createTableQuery).toContain('"updated_at" TIMESTAMP NOT NULL DEFAULT now()');
      
      // Verify initial data insertion
      expect(insertDataQuery).toContain('INSERT INTO "shop_codes"');
      expect(insertDataQuery).toContain('SHOP123');
      expect(insertDataQuery).toContain('Test Shop');
    });

    it('should not create shop_codes table if it already exists', async () => {
      queryRunner.hasTable.mockResolvedValue(true);

      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.hasTable).toHaveBeenCalledWith('shop_codes');
      expect(queryRunner.query).not.toHaveBeenCalled();
    });
  });

  describe('down', () => {
    it('should drop shop_codes table', async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.query).toHaveBeenCalledWith('DROP TABLE IF EXISTS "shop_codes"');

      const calls = queryRunner.query.mock.calls;
      if (!Array.isArray(calls) || calls.length === 0) {
        throw new Error('Expected at least one query call');
      }

      const dropTableQuery = calls[0][0];
      if (typeof dropTableQuery !== 'string') {
        throw new Error('Expected string query');
      }

      expect(dropTableQuery).toBe('DROP TABLE IF EXISTS "shop_codes"');
    });
  });
});
