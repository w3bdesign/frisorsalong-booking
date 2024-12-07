import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";
import { CreateOrders1731981975583 } from "./1731981975583-CreateOrders";

type SafeQueryRunner = {
  createTable: jest.Mock<Promise<Table>, [Table, boolean]>;
  createForeignKey: jest.Mock<Promise<void>, [string, TableForeignKey]>;
  getTable: jest.Mock<Promise<Table>, [string]>;
  dropForeignKey: jest.Mock<Promise<void>, [string, TableForeignKey]>;
  dropTable: jest.Mock<Promise<void>, [string]>;
};

describe("CreateOrders1731981975583", () => {
  let migration: CreateOrders1731981975583;
  let queryRunner: SafeQueryRunner;

  beforeEach(() => {
    migration = new CreateOrders1731981975583();
    queryRunner = {
      createTable: jest.fn().mockResolvedValue(new Table({ name: "orders", columns: [] })),
      createForeignKey: jest.fn().mockResolvedValue(undefined),
      getTable: jest.fn().mockResolvedValue(new Table({
        name: "orders",
        columns: [],
        foreignKeys: [new TableForeignKey({
          columnNames: ["booking_id"],
          referencedColumnNames: ["id"],
          referencedTableName: "bookings",
          onDelete: "CASCADE"
        })]
      })),
      dropForeignKey: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
    };
  });

  describe("up", () => {
    it("should create orders table with correct columns", async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledWith(
        expect.any(Table),
        true,
      );

      const table = queryRunner.createTable.mock.calls[0]?.[0];
      if (!(table instanceof Table)) {
        throw new Error('Invalid createTable mock call');
      }

      expect(table.name).toBe("orders");
      expect(table.columns).toHaveLength(7);

      // Check specific columns
      const columns = table.columns;
      expect(columns[0].name).toBe("id");
      expect(columns[0].type).toBe("uuid");
      expect(columns[0].isPrimary).toBe(true);

      expect(columns[1].name).toBe("booking_id");
      expect(columns[1].type).toBe("uuid");

      expect(columns[2].name).toBe("completed_at");
      expect(columns[2].type).toBe("timestamp");

      expect(columns[3].name).toBe("total_amount");
      expect(columns[3].type).toBe("decimal");
      expect(columns[3].precision).toBe(10);
      expect(columns[3].scale).toBe(2);

      expect(columns[4].name).toBe("notes");
      expect(columns[4].type).toBe("text");
      expect(columns[4].isNullable).toBe(true);

      expect(columns[5].name).toBe("created_at");
      expect(columns[5].type).toBe("timestamp");

      expect(columns[6].name).toBe("updated_at");
      expect(columns[6].type).toBe("timestamp");
    });

    it("should create foreign key for booking_id", async () => {
      await migration.up(queryRunner as unknown as QueryRunner);

      expect(queryRunner.createForeignKey).toHaveBeenCalledWith(
        "orders",
        expect.any(TableForeignKey),
      );

      const foreignKey = queryRunner.createForeignKey.mock.calls[0]?.[1];
      if (!(foreignKey instanceof TableForeignKey)) {
        throw new Error('Invalid createForeignKey mock call');
      }

      expect(foreignKey.columnNames).toEqual(["booking_id"]);
      expect(foreignKey.referencedColumnNames).toEqual(["id"]);
      expect(foreignKey.referencedTableName).toBe("bookings");
      expect(foreignKey.onDelete).toBe("CASCADE");
    });
  });

  describe("down", () => {
    it("should drop foreign key and table", async () => {
      await migration.down(queryRunner as unknown as QueryRunner);

      expect(queryRunner.getTable).toHaveBeenCalledWith("orders");
      expect(queryRunner.dropForeignKey).toHaveBeenCalledWith(
        "orders",
        expect.any(TableForeignKey)
      );
      expect(queryRunner.dropTable).toHaveBeenCalledWith("orders");

      // Verify the mock calls have correct types
      const foreignKey = queryRunner.dropForeignKey.mock.calls[0]?.[1];
      if (!(foreignKey instanceof TableForeignKey)) {
        throw new Error('Invalid dropForeignKey mock call');
      }
    });
  });
});
