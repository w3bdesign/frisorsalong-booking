import { DataSource } from 'typeorm';
import { AddShopCodes1731981975584 } from './1731981975584-AddShopCodes';

describe('AddShopCodes1731981975584', () => {
  let migration: AddShopCodes1731981975584;
  let dataSource: DataSource;

  beforeEach(() => {
    migration = new AddShopCodes1731981975584();
    dataSource = new DataSource({
      type: 'postgres',
      database: ':memory:',
      dropSchema: true,
      synchronize: false,
      logging: false,
      entities: [],
    });
  });

  it('should have correct name', () => {
    expect(migration.name).toBe('AddShopCodes1731981975584');
  });

  describe('up', () => {
    it('should create shop_codes table if it does not exist', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const hasTableSpy = jest.spyOn(queryRunner, 'hasTable').mockResolvedValue(false);
      const querySpy = jest.spyOn(queryRunner, 'query').mockResolvedValue(undefined);

      await migration.up(queryRunner);

      expect(hasTableSpy).toHaveBeenCalledWith('shop_codes');
      expect(querySpy).toHaveBeenCalledTimes(2);
      
      // Verify create table query
      expect(querySpy.mock.calls[0][0]).toContain('CREATE TABLE "shop_codes"');
      expect(querySpy.mock.calls[0][0]).toContain('"id" uuid NOT NULL DEFAULT uuid_generate_v4()');
      expect(querySpy.mock.calls[0][0]).toContain('"code" character varying NOT NULL');
      expect(querySpy.mock.calls[0][0]).toContain('"shop_name" character varying NOT NULL');
      expect(querySpy.mock.calls[0][0]).toContain('"is_active" boolean NOT NULL DEFAULT true');
      expect(querySpy.mock.calls[0][0]).toContain('"daily_booking_limit" integer NOT NULL DEFAULT 100');
      expect(querySpy.mock.calls[0][0]).toContain('"last_booking_time" TIMESTAMP');
      expect(querySpy.mock.calls[0][0]).toContain('"today_booking_count" integer NOT NULL DEFAULT 0');
      expect(querySpy.mock.calls[0][0]).toContain('"created_at" TIMESTAMP NOT NULL DEFAULT now()');
      expect(querySpy.mock.calls[0][0]).toContain('"updated_at" TIMESTAMP NOT NULL DEFAULT now()');
      
      // Verify initial data insertion
      expect(querySpy.mock.calls[1][0]).toContain('INSERT INTO "shop_codes"');
      expect(querySpy.mock.calls[1][0]).toContain('SHOP123');
      expect(querySpy.mock.calls[1][0]).toContain('Test Shop');
    });

    it('should not create shop_codes table if it already exists', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const hasTableSpy = jest.spyOn(queryRunner, 'hasTable').mockResolvedValue(true);
      const querySpy = jest.spyOn(queryRunner, 'query').mockResolvedValue(undefined);

      await migration.up(queryRunner);

      expect(hasTableSpy).toHaveBeenCalledWith('shop_codes');
      expect(querySpy).not.toHaveBeenCalled();
    });
  });

  describe('down', () => {
    it('should drop shop_codes table', async () => {
      const queryRunner = dataSource.createQueryRunner();
      const querySpy = jest.spyOn(queryRunner, 'query').mockResolvedValue(undefined);

      await migration.down(queryRunner);

      expect(querySpy).toHaveBeenCalledWith('DROP TABLE IF EXISTS "shop_codes"');
    });
  });
});
