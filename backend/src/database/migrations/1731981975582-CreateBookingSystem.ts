import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingSystem1731981975582 implements MigrationInterface {
  name = 'CreateBookingSystem1731981975582';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create services table
    await queryRunner.query(`
      CREATE TABLE "services" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "name" varchar NOT NULL,
        "description" text NOT NULL,
        "duration" integer NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create employees table
    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL UNIQUE,
        "specializations" text[] DEFAULT '{}',
        "availability" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_employee_user" FOREIGN KEY ("user_id") 
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    // Create employee_services junction table
    await queryRunner.query(`
      CREATE TABLE "employee_services" (
        "employee_id" uuid NOT NULL,
        "service_id" uuid NOT NULL,
        CONSTRAINT "pk_employee_services" PRIMARY KEY ("employee_id", "service_id"),
        CONSTRAINT "fk_employee_services_employee" FOREIGN KEY ("employee_id") 
          REFERENCES "employees"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_employee_services_service" FOREIGN KEY ("service_id") 
          REFERENCES "services"("id") ON DELETE CASCADE
      )
    `);

    // Create bookings table
    await queryRunner.query(`
      CREATE TABLE "bookings" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "customer_id" uuid NOT NULL,
        "employee_id" uuid NOT NULL,
        "service_id" uuid NOT NULL,
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "status" varchar NOT NULL DEFAULT 'pending',
        "notes" text,
        "total_price" decimal(10,2) NOT NULL,
        "reminder_sent" boolean NOT NULL DEFAULT false,
        "cancelled_at" TIMESTAMP,
        "cancellation_reason" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "fk_booking_customer" FOREIGN KEY ("customer_id") 
          REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_booking_employee" FOREIGN KEY ("employee_id") 
          REFERENCES "employees"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_booking_service" FOREIGN KEY ("service_id") 
          REFERENCES "services"("id") ON DELETE CASCADE
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX "idx_bookings_customer" ON "bookings"("customer_id");
      CREATE INDEX "idx_bookings_employee" ON "bookings"("employee_id");
      CREATE INDEX "idx_bookings_service" ON "bookings"("service_id");
      CREATE INDEX "idx_bookings_start_time" ON "bookings"("start_time");
      CREATE INDEX "idx_bookings_status" ON "bookings"("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "idx_bookings_status"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_start_time"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_service"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_employee"`);
    await queryRunner.query(`DROP INDEX "idx_bookings_customer"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "bookings"`);
    await queryRunner.query(`DROP TABLE "employee_services"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TABLE "services"`);
  }
}
