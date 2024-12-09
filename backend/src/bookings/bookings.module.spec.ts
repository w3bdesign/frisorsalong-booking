import { BookingsModule } from "./bookings.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingsService } from "./bookings.service";
import { DynamicModule, ForwardReference, Type } from "@nestjs/common";

type ModuleImport =
  | Type<unknown>
  | DynamicModule
  | Promise<DynamicModule>
  | ForwardReference;

describe("BookingsModule", () => {
  it("should have correct module metadata", () => {
    // Get module metadata directly from the decorator
    const moduleDecorator = Reflect.getMetadata(
      "imports",
      BookingsModule
    ) as ModuleImport[];

    // Check TypeOrmModule.forFeature
    const typeOrmFeature = moduleDecorator.find(
      (item): item is DynamicModule =>
        item !== null &&
        typeof item === "object" &&
        "module" in item &&
        item.module === TypeOrmModule
    );
    expect(typeOrmFeature).toBeDefined();

    // Get all module names
    const moduleNames = moduleDecorator
      .map((item): string | null => {
        if (typeof item === "function") {
          return item.name;
        }
        if (item && typeof item === "object" && "name" in item) {
          return String(item.name);
        }
        return null;
      })
      .filter((name): name is string => Boolean(name));

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
    const exports = Reflect.getMetadata("exports", BookingsModule) as Array<
      Type<unknown> | DynamicModule
    >;
    expect(exports).toContain(BookingsService);

    const hasTypeOrmExport = exports.some(
      (exp): boolean =>
        exp === TypeOrmModule ||
        (exp !== null &&
          typeof exp === "object" &&
          "module" in exp &&
          exp.module === TypeOrmModule)
    );
    expect(hasTypeOrmExport).toBe(true);
  });
});
