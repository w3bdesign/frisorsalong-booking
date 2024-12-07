import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1731981975581 implements MigrationInterface {
  name = "InitialMigration1731981975581";

  private async executeQuery(queryRunner: QueryRunner, sql: string): Promise<void> {
    if (!queryRunner || typeof queryRunner.query !== 'function') {
      throw new Error('Invalid query runner');
    }

    try {
      await queryRunner.query(sql).catch((error: unknown) => {
        throw new Error(
          `Query failed: ${sql}\nError: ${error instanceof Error ? error.message : String(error)}`
        );
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Migration failed executing query: ${sql}\nError: ${errorMessage}`);
    }
  }

  private async executeQueries(queryRunner: QueryRunner, queries: string[]): Promise<void> {
    for (const query of queries) {
      await this.executeQuery(queryRunner, query);
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      // Create enums
      const createEnumQueries = [
        `CREATE TYPE "public"."users_role_enum" AS ENUM('customer', 'employee', 'admin')`,
        `CREATE TYPE "public"."bookings_status_enum" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show')`
      ];

      await this.executeQueries(queryRunner, createEnumQueries);

      // Create tables
      const createTableQueries = [
        `CREATE TABLE "users" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "firstName" character varying(100) NOT NULL,
          "lastName" character varying(100) NOT NULL,
          "email" character varying NOT NULL,
          "password" character varying NOT NULL,
          "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer',
          "phoneNumber" character varying,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
          CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        )`,
        `CREATE TABLE "employees" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "specializations" text,
          "availability" json,
          "isActive" boolean NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "userId" uuid,
          CONSTRAINT "REL_737991e10350d9626f592894ce" UNIQUE ("userId"),
          CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id")
        )`,
        `CREATE TABLE "services" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "description" text NOT NULL,
          "price" numeric(10,2) NOT NULL,
          "durationMinutes" integer NOT NULL,
          "isActive" boolean NOT NULL DEFAULT true,
          "categories" text,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id")
        )`,
        `CREATE TABLE "bookings" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "startTime" TIMESTAMP NOT NULL,
          "endTime" TIMESTAMP NOT NULL,
          "status" "public"."bookings_status_enum" NOT NULL DEFAULT 'pending',
          "notes" text,
          "totalPrice" numeric(10,2) NOT NULL,
          "reminderSent" boolean NOT NULL DEFAULT false,
          "cancelledAt" TIMESTAMP,
          "cancellationReason" text,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "customer_id" uuid NOT NULL,
          "employee_id" uuid NOT NULL,
          "service_id" uuid NOT NULL,
          CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id")
        )`,
        `CREATE TABLE "employee_services" (
          "service_id" uuid NOT NULL,
          "employee_id" uuid NOT NULL,
          CONSTRAINT "PK_673fd236e781ddb746dd590616a" PRIMARY KEY ("service_id", "employee_id")
        )`
      ];

      await this.executeQueries(queryRunner, createTableQueries);

      // Create indexes
      const createIndexQueries = [
        `CREATE INDEX "IDX_f19f9b60ab07ce81f9affcf797" ON "employee_services" ("service_id")`,
        `CREATE INDEX "IDX_1834a95212d94c86b540273df4" ON "employee_services" ("employee_id")`
      ];

      await this.executeQueries(queryRunner, createIndexQueries);

      // Add foreign key constraints
      const addForeignKeyQueries = [
        `ALTER TABLE "employees" ADD CONSTRAINT "FK_737991e10350d9626f592894cef" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        `ALTER TABLE "bookings" ADD CONSTRAINT "FK_8e21b7ae33e7b0673270de4146f" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        `ALTER TABLE "bookings" ADD CONSTRAINT "FK_eed284d1132173b29a4af74f05f" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        `ALTER TABLE "bookings" ADD CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        `ALTER TABLE "employee_services" ADD CONSTRAINT "FK_f19f9b60ab07ce81f9affcf7974" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        `ALTER TABLE "employee_services" ADD CONSTRAINT "FK_1834a95212d94c86b540273df4e" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE`
      ];

      await this.executeQueries(queryRunner, addForeignKeyQueries);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Migration up failed: ${errorMessage}`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Drop foreign key constraints
      const dropForeignKeyQueries = [
        `ALTER TABLE "employee_services" DROP CONSTRAINT "FK_1834a95212d94c86b540273df4e"`,
        `ALTER TABLE "employee_services" DROP CONSTRAINT "FK_f19f9b60ab07ce81f9affcf7974"`,
        `ALTER TABLE "bookings" DROP CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2"`,
        `ALTER TABLE "bookings" DROP CONSTRAINT "FK_eed284d1132173b29a4af74f05f"`,
        `ALTER TABLE "bookings" DROP CONSTRAINT "FK_8e21b7ae33e7b0673270de4146f"`,
        `ALTER TABLE "employees" DROP CONSTRAINT "FK_737991e10350d9626f592894cef"`
      ];

      await this.executeQueries(queryRunner, dropForeignKeyQueries);

      // Drop indexes
      const dropIndexQueries = [
        `DROP INDEX "public"."IDX_1834a95212d94c86b540273df4"`,
        `DROP INDEX "public"."IDX_f19f9b60ab07ce81f9affcf797"`
      ];

      await this.executeQueries(queryRunner, dropIndexQueries);

      // Drop tables in correct order
      const dropTableQueries = [
        `DROP TABLE "employee_services"`,
        `DROP TABLE "bookings"`,
        `DROP TABLE "services"`,
        `DROP TABLE "employees"`,
        `DROP TABLE "users"`
      ];

      await this.executeQueries(queryRunner, dropTableQueries);

      // Drop enums
      const dropEnumQueries = [
        `DROP TYPE "public"."users_role_enum"`,
        `DROP TYPE "public"."bookings_status_enum"`
      ];

      await this.executeQueries(queryRunner, dropEnumQueries);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Migration down failed: ${errorMessage}`);
    }
  }
}
