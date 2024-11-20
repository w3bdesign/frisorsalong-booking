import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";
import { CreateOrders1731981975583 } from "./1731981975583-CreateOrders";

describe("CreateOrders1731981975583", () => {
  let migration: CreateOrders1731981975583;
  let queryRunner: QueryRunner;

  beforeEach(() => {
    migration = new CreateOrders1731981975583();
    queryRunner = {
      createTable: jest.fn(),
      createForeignKey: jest.fn(),
      getTable: jest.fn(),
      dropForeignKey: jest.fn(),
      dropTable: jest.fn(),
    } as unknown as QueryRunner;
  });

  describe("up", () => {
    it("should create orders table with correct columns", async () => {
      await migration.up(queryRunner);

      expect(queryRunner.createTable).toHaveBeenCalledWith(
        expect.any(Table),
        true,
      );

      const table = (queryRunner.createTable as jest.Mock).mock.calls[0][0];
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
      await migration.up(queryRunner);

      expect(queryRunner.createForeignKey).toHaveBeenCalledWith(
        "orders",
        expect.any(TableForeignKey),
      );

      const foreignKey = (queryRunner.createForeignKey as jest.Mock).mock
        .calls[0][1];
      expect(foreignKey.columnNames).toEqual(["booking_id"]);
      expect(foreignKey.referencedColumnNames).toEqual(["id"]);
      expect(foreignKey.referencedTableName).toBe("bookings");
      expect(foreignKey.onDelete).toBe("CASCADE");
    });
  });

  describe("down", () => {
    beforeEach(() => {
      (queryRunner.getTable as jest.Mock).mockResolvedValue({
        foreignKeys: [
          {
            columnNames: ["booking_id"],
          },
        ],
      });
    });

    it("should drop foreign key and table", async () => {
      await migration.down(queryRunner);

      expect(queryRunner.getTable).toHaveBeenCalledWith("orders");
      expect(queryRunner.dropForeignKey).toHaveBeenCalledWith(
        "orders",
        expect.anything(),
      );
      expect(queryRunner.dropTable).toHaveBeenCalledWith("orders");
    });
  });
});
