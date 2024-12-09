import { Test, TestingModule } from "@nestjs/testing";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";
import { Booking } from "./entities/booking.entity";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { EmployeesService } from "../employees/employees.service";
import { ServicesService } from "../services/services.service";
import { OrdersService } from "../orders/orders.service";
import { ShopsService } from "../shops/shops.service";
import { ShopCode } from "../shops/entities/shop-code.entity";

describe("BookingsModule", () => {
  let module: TestingModule;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const mockUsersService = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const mockEmployeesService = {
      findOne: jest.fn(),
      findAll: jest.fn(),
      isAvailable: jest.fn(),
    };

    const mockServicesService = {
      findOne: jest.fn(),
    };

    const mockOrdersService = {
      create: jest.fn(),
    };

    const mockShopsService = {
      findOne: jest.fn(),
      validateShopCode: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get("JWT_SECRET") || "test-secret",
            signOptions: {
              expiresIn: configService.get("JWT_EXPIRATION") || "1h",
            },
          }),
          inject: [ConfigService],
        }),
      ],
      controllers: [BookingsController],
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ShopCode),
          useValue: mockRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: ShopsService,
          useValue: mockShopsService,
        },
        RolesGuard,
        JwtAuthGuard,
        ConfigService,
      ],
    }).compile();
  });

  it("should be defined", () => {
    expect(module).toBeDefined();
  });

  it("should have BookingsService defined", () => {
    const bookingsService = module.get<BookingsService>(BookingsService);
    expect(bookingsService).toBeDefined();
  });

  it("should have BookingsController defined", () => {
    const bookingsController =
      module.get<BookingsController>(BookingsController);
    expect(bookingsController).toBeDefined();
  });

  it("should have guards defined", () => {
    const rolesGuard = module.get<RolesGuard>(RolesGuard);
    const jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);

    expect(rolesGuard).toBeDefined();
    expect(jwtAuthGuard).toBeDefined();
  });

  it("should have required services defined", () => {
    const usersService = module.get<UsersService>(UsersService);
    const employeesService = module.get<EmployeesService>(EmployeesService);
    const servicesService = module.get<ServicesService>(ServicesService);
    const ordersService = module.get<OrdersService>(OrdersService);
    const shopsService = module.get<ShopsService>(ShopsService);

    expect(usersService).toBeDefined();
    expect(employeesService).toBeDefined();
    expect(servicesService).toBeDefined();
    expect(ordersService).toBeDefined();
    expect(shopsService).toBeDefined();
  });
});
