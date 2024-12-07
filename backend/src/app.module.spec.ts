import { Test } from "@nestjs/testing";
import { AppModule } from "./app.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { ShopCode } from "./shops/entities/shop-code.entity";
import { join } from "path";
import type { INestApplication } from "@nestjs/common";

// Mock the ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
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

// Create mock repositories with proper typing
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

// Mock TypeOrmModule with proper typing
const MockTypeOrmModule = {
  forRoot: () => ({}),
};

const MockTypeOrmFeatureModule = {
  forFeature: () => ({}),
};

// Create a properly typed mock for TypeOrmModule
const typeOrmModuleMock = {
  forRootAsync: jest.fn().mockReturnValue({
    module: class {
      static forRoot() {
        return MockTypeOrmModule;
      }
    },
  }),
  forFeature: jest.fn().mockReturnValue({
    module: class {
      static forFeature() {
        return MockTypeOrmFeatureModule;
      }
    },
  }),
};

// Mock @nestjs/typeorm with proper typing
jest.mock("@nestjs/typeorm", () => ({
  TypeOrmModule: typeOrmModuleMock,
  getRepositoryToken: (entity: typeof ShopCode) => {
    if (entity === ShopCode) {
      return "SHOP_CODE_REPOSITORY";
    }
    return "MockRepository";
  },
  InjectRepository: () => () => mockRepository,
}));

// Mock feature modules with proper typing
jest.mock("./auth/auth.module", () => ({
  AuthModule: class MockAuthModule {
    static register() {
      return {};
    }
  },
}));

jest.mock("./users/users.module", () => ({
  UsersModule: class MockUsersModule {
    static register() {
      return {};
    }
  },
}));

jest.mock("./employees/employees.module", () => ({
  EmployeesModule: class MockEmployeesModule {
    static register() {
      return {};
    }
  },
}));

jest.mock("./services/services.module", () => ({
  ServicesModule: class MockServicesModule {
    static register() {
      return {};
    }
  },
}));

jest.mock("./bookings/bookings.module", () => ({
  BookingsModule: class MockBookingsModule {
    static register() {
      return {};
    }
  },
}));

jest.mock("./orders/orders.module", () => ({
  OrdersModule: class MockOrdersModule {
    static register() {
      return {};
    }
  },
}));

jest.mock("./shops/shops.module", () => ({
  ShopsModule: class MockShopsModule {
    static register() {
      return {};
    }
  },
}));

// Mock entities with proper typing
jest.mock("./users/entities/user.entity", () => ({
  User: class MockUser {
    constructor() {}
  },
}));

jest.mock("./employees/entities/employee.entity", () => ({
  Employee: class MockEmployee {
    constructor() {}
  },
}));

jest.mock("./services/entities/service.entity", () => ({
  Service: class MockService {
    constructor() {}
  },
}));

jest.mock("./bookings/entities/booking.entity", () => ({
  Booking: class MockBooking {
    constructor() {}
  },
}));

jest.mock("./orders/entities/order.entity", () => ({
  Order: class MockOrder {
    constructor() {}
  },
}));

jest.mock("./shops/entities/shop-code.entity", () => ({
  ShopCode: class MockShopCode {
    constructor() {}
  },
}));

describe("AppModule", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider("SHOP_CODE_REPOSITORY")
      .useValue(mockShopCodeRepository)
      .compile();

    app = moduleRef.createNestApplication();
    // init() returns a Promise, so await is needed
    await app.init();
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
    expect(typeOrmModuleMock.forRootAsync).toHaveBeenCalled();

    // Get the factory function from the forRootAsync call with proper typing
    const mockCalls = typeOrmModuleMock.forRootAsync.mock?.calls;
    if (!mockCalls?.length) {
      throw new Error("forRootAsync was not called");
    }

    const options = mockCalls[0][0] as TypeOrmModuleAsyncOptions;
    const factoryFn = options.useFactory;

    if (!factoryFn) {
      throw new Error("Factory function not found");
    }

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
    expect(typeOrmModuleMock.forRootAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        imports: [ConfigModule],
        inject: [ConfigService],
      })
    );
  });
});
