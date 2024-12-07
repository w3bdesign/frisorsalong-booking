// Mock implementations must be at the top level
const mockTypeOrmModule = {
  forRootAsync: jest.fn().mockReturnValue({
    module: class MockModule {
      static forRoot() {
        return {};
      }
    },
  }),
  forFeature: jest.fn().mockReturnValue({
    module: class MockFeatureModule {
      static forFeature() {
        return {};
      }
    },
  }),
};

// Mock modules must be defined before imports
jest.mock("@nestjs/typeorm", () => ({
  TypeOrmModule: mockTypeOrmModule,
  getRepositoryToken: () => "SHOP_CODE_REPOSITORY",
  InjectRepository: () => () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Now we can have our imports
import { Test } from "@nestjs/testing";
import { AppModule } from "./app.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import type { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { join } from "path";
import type { INestApplication } from "@nestjs/common";

// Mock repositories
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

// Mock ConfigService
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

// Mock feature modules
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

// Mock entities
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
    expect(mockTypeOrmModule.forRootAsync).toHaveBeenCalled();

    const calls = mockTypeOrmModule.forRootAsync.mock.calls;
    if (!calls?.length) {
      throw new Error("forRootAsync was not called");
    }

    const [options] = calls[0];
    const factoryFn = options.useFactory;

    if (!factoryFn) {
      throw new Error("Factory function not found");
    }

    const config = factoryFn(mockConfigService);

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
    expect(mockTypeOrmModule.forRootAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        imports: [ConfigModule],
        inject: [ConfigService],
      })
    );
  });
});
