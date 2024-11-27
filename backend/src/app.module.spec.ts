import { Test } from "@nestjs/testing";
import { AppModule } from "./app.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { ShopCode } from "./shops/entities/shop-code.entity";
import { join } from "path";

// Mock the ConfigService
const mockConfigService = {
  get: jest.fn((key) => {
    switch (key) {
      case "DATABASE_URL":
        return "postgres://test:test@localhost:5432/test";
      case "NODE_ENV":
        return "test";
      default:
        return null;
    }
  }),
};

// Create mock repositories
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockShopCodeRepository = {
  ...mockRepository,
  findOne: jest.fn().mockResolvedValue({ code: "TEST123" }),
};

// Mock @nestjs/typeorm
jest.mock("@nestjs/typeorm", () => {
  return {
    TypeOrmModule: {
      forRootAsync: jest.fn().mockReturnValue({
        module: class MockTypeOrmModule {},
      }),
      forFeature: jest.fn().mockReturnValue({
        module: class MockTypeOrmFeatureModule {},
      }),
    },
    getRepositoryToken: jest.fn((entity) => {
      if (entity === ShopCode) {
        return "SHOP_CODE_REPOSITORY";
      }
      return "MockRepository";
    }),
    InjectRepository: jest.fn().mockReturnValue(() => mockRepository),
  };
});

// Mock feature modules
jest.mock("./auth/auth.module", () => ({
  AuthModule: class MockAuthModule {},
}));

jest.mock("./users/users.module", () => ({
  UsersModule: class MockUsersModule {},
}));

jest.mock("./employees/employees.module", () => ({
  EmployeesModule: class MockEmployeesModule {},
}));

jest.mock("./services/services.module", () => ({
  ServicesModule: class MockServicesModule {},
}));

jest.mock("./bookings/bookings.module", () => ({
  BookingsModule: class MockBookingsModule {},
}));

jest.mock("./orders/orders.module", () => ({
  OrdersModule: class MockOrdersModule {},
}));

jest.mock("./shops/shops.module", () => ({
  ShopsModule: class MockShopsModule {},
}));

// Mock entities
jest.mock("./users/entities/user.entity", () => ({
  User: class MockUser {},
}));

jest.mock("./employees/entities/employee.entity", () => ({
  Employee: class MockEmployee {},
}));

jest.mock("./services/entities/service.entity", () => ({
  Service: class MockService {},
}));

jest.mock("./bookings/entities/booking.entity", () => ({
  Booking: class MockBooking {},
}));

jest.mock("./orders/entities/order.entity", () => ({
  Order: class MockOrder {},
}));

jest.mock("./shops/entities/shop-code.entity", () => ({
  ShopCode: class MockShopCode {},
}));

describe("AppModule", () => {
  let app;
  let configService;
  let typeOrmModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider("SHOP_CODE_REPOSITORY")
      .useValue(mockShopCodeRepository)
      .compile();

    app = await moduleRef.createNestApplication();
    await app.init();

    configService = moduleRef.get<ConfigService>(ConfigService);
    typeOrmModule = require("@nestjs/typeorm").TypeOrmModule;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("should be defined", () => {
    expect(app).toBeDefined();
  });

  it("should configure TypeOrmModule with correct database settings", () => {
    expect(typeOrmModule.forRootAsync).toHaveBeenCalled();

    // Get the factory function from the forRootAsync call
    const options = typeOrmModule.forRootAsync.mock
      .calls[0][0] as TypeOrmModuleAsyncOptions;
    const factoryFn = options.useFactory;

    // Execute the factory function with our mocked ConfigService
    const config = factoryFn(mockConfigService);

    // Verify the configuration matches what's in app.module.ts
    expect(config).toEqual({
      type: "postgres",
      url: "postgres://test:test@localhost:5432/test",
      entities: [join(__dirname, "**", "*.entity{.ts,.js}")],
      synchronize: false,
      logging: false,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  });

  it("should configure TypeOrmModule with correct injection", () => {
    expect(typeOrmModule.forRootAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        imports: [ConfigModule],
        inject: [ConfigService],
      })
    );
  });
});
