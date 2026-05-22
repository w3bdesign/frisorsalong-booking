import { BookingsModule } from "./bookings.module";
import { BookingsService } from "./bookings.service";
import { SharedModule } from "../shared/shared.module";
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

    // Check SharedModule is imported
    expect(moduleDecorator).toContain(SharedModule);

    // Get all module names
    const moduleNames = moduleDecorator
      .map((item): string | null => {
        if (typeof item === "function") {
          const name: string = item.name;
          return name;
        }
        if (item && typeof item === "object" && "name" in item) {
          const nameValue: unknown = (item as Record<string, unknown>).name;
          return typeof nameValue === 'string' ? nameValue : null;
        }
        return null;
      })
      .filter((name): name is string => Boolean(name));

    // Check for expected modules
    const expectedModules = [
      "SharedModule",
      "UsersModule",
      "EmployeesModule",
      "ServicesModule",
      "OrdersModule",
      "ShopsModule",
      "AuthModule",
    ];
    expectedModules.forEach((moduleName) => {
      expect(moduleNames).toContain(moduleName);
    });
  });

  it("should export BookingsService", () => {
    const rawExports: unknown = Reflect.getMetadata("exports", BookingsModule);
    const exports = rawExports as (Type<unknown> | DynamicModule)[];
    expect(exports).toContain(BookingsService);
  });
});
