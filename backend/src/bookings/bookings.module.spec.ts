import { BookingsModule } from "./bookings.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingsService } from "./bookings.service";

describe("BookingsModule", () => {
  it("should have correct module metadata", () => {
    // Get module metadata directly from the decorator
    const moduleDecorator = Reflect.getMetadata("imports", BookingsModule);

    // Check TypeOrmModule.forFeature
    const typeOrmFeature = moduleDecorator.find(
      (item: any) =>
        item && typeof item === "object" && item.module === TypeOrmModule
    );
    expect(typeOrmFeature).toBeDefined();

    // Get all module names
    const moduleNames = moduleDecorator
      .map((item: any) => {
        if (item && typeof item === "function") {
          return item.name;
        }
        if (item && typeof item === "object" && "name" in item) {
          return String(item.name);
        }
        return null;
      })
      .filter(Boolean);

    // Check for expected modules
    const expectedModules = [
      "UsersModule",
      "ServicesModule",
      "ShopsModule",
      "AuthModule",
    ];
    expectedModules.forEach((moduleName) => {
      expect(moduleNames).toContain(moduleName);
    });
  });

  it("should export BookingsService and TypeOrmModule", () => {
    const exports = Reflect.getMetadata("exports", BookingsModule);
    expect(exports).toContain(BookingsService);

    const hasTypeOrmExport = exports.some(
      (exp: any) =>
        exp === TypeOrmModule ||
        (exp && typeof exp === "object" && exp.module === TypeOrmModule)
    );
    expect(hasTypeOrmExport).toBe(true);
  });
});
