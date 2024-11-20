import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrders1731981975583 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "orders",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "booking_id",
            type: "uuid",
          },
          {
            name: "completed_at",
            type: "timestamp",
          },
          {
            name: "total_amount",
            type: "decimal",
            precision: 10,
            scale: 2,
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      "orders",
      new TableForeignKey({
        columnNames: ["booking_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "bookings",
        onDelete: "CASCADE",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable("orders");
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("booking_id") !== -1,
    );
    await queryRunner.dropForeignKey("orders", foreignKey);
    await queryRunner.dropTable("orders");
  }
}
