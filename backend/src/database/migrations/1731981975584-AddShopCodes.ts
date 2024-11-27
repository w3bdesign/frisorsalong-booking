import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShopCodes1731981975584 implements MigrationInterface {
  name = "AddShopCodes1731981975584";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if table exists first
    const tableExists = await queryRunner.hasTable("shop_codes");
    if (!tableExists) {
      await queryRunner.query(`
                CREATE TABLE "shop_codes" (
                    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                    "code" character varying NOT NULL,
                    "shop_name" character varying NOT NULL,
                    "is_active" boolean NOT NULL DEFAULT true,
                    "daily_booking_limit" integer NOT NULL DEFAULT 100,
                    "last_booking_time" TIMESTAMP,
                    "today_booking_count" integer NOT NULL DEFAULT 0,
                    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                    "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                    CONSTRAINT "UQ_shop_codes_code" UNIQUE ("code"),
                    CONSTRAINT "PK_shop_codes" PRIMARY KEY ("id")
                )
            `);

      // Insert initial shop code for testing
      await queryRunner.query(`
                INSERT INTO "shop_codes" ("code", "shop_name")
                VALUES ('SHOP123', 'Test Shop')
            `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "shop_codes"`);
  }
}
