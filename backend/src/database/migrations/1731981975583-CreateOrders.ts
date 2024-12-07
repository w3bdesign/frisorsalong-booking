import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrders1731981975583 implements MigrationInterface {
  private async executeQuery<T>(
    operation: () => Promise<T>,
    errorMessage: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw new Error(
        `${errorMessage}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.executeQuery(
      async () => {
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
      },
      "Failed to create orders table"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.executeQuery(
      async () => {
        const table = await queryRunner.getTable("orders");
        if (!table) {
          throw new Error("Orders table not found");
        }

        const foreignKeys = table.foreignKeys;
        if (!Array.isArray(foreignKeys)) {
          throw new Error("Invalid foreign keys structure");
        }

        const foreignKey = foreignKeys.find(
          (fk) => Array.isArray(fk.columnNames) && fk.columnNames.includes("booking_id")
        );

        if (!foreignKey) {
          throw new Error("Foreign key for booking_id not found");
        }

        await queryRunner.dropForeignKey("orders", foreignKey);
        await queryRunner.dropTable("orders");
      },
      "Failed to drop orders table"
    );
  }
}
