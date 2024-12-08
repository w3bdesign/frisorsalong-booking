import { ValidationPipe, INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { bootstrap } from "./main";

// Mock all external modules
jest.mock("@nestjs/typeorm", () => ({
  TypeOrmModule: {
    forRoot: jest.fn().mockReturnValue({}),
    forRootAsync: jest.fn().mockReturnValue({}),
    forFeature: jest.fn().mockReturnValue({}),
  },
  getRepositoryToken: jest.fn(),
  InjectRepository: () => jest.fn(),
}));

jest.mock("@nestjs/cache-manager", () => ({
  CacheModule: {
    register: jest.fn().mockReturnValue({}),
    registerAsync: jest.fn().mockReturnValue({}),
  },
}));

jest.mock("@nestjs/config", () => ({
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue({}),
  },
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockImplementation((key: string) => {
      if (key === "cache") {
        return {
          host: "localhost",
          port: 6379,
          ttl: 300,
        };
      }
      return null;
    }),
  })),
}));

// Mock feature modules
jest.mock("./auth/auth.module", () => ({
  AuthModule: jest.fn().mockReturnValue({}),
}));

jest.mock("./users/users.module", () => ({
  UsersModule: jest.fn().mockReturnValue({}),
}));

jest.mock("./employees/employees.module", () => ({
  EmployeesModule: jest.fn().mockReturnValue({}),
}));

jest.mock("./services/services.module", () => ({
  ServicesModule: jest.fn().mockReturnValue({}),
}));

jest.mock("./bookings/bookings.module", () => ({
  BookingsModule: jest.fn().mockReturnValue({}),
}));

// Mock app module
jest.mock("./app.module", () => ({
  AppModule: jest.fn().mockReturnValue({}),
}));

describe("Bootstrap", () => {
  let app: INestApplication;

  beforeEach(() => {
    // Reset modules before each test
    jest.resetModules();

    // Create a more complete mock implementation of INestApplication
    const mockApp = {
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
      init: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
      select: jest.fn(),
      useGlobalFilters: jest.fn(),
      useGlobalInterceptors: jest.fn(),
      useGlobalGuards: jest.fn(),
      use: jest.fn(),
      setGlobalPrefix: jest.fn(),
      enableVersioning: jest.fn(),
      getUrl: jest.fn(),
      useWebSocketAdapter: jest.fn(),
      connectMicroservice: jest.fn(),
      getMicroservices: jest.fn(),
      getHttpServer: jest.fn(),
      startAllMicroservices: jest.fn(),
      stopAllMicroservices: jest.fn(),
      createNestApplication: jest.fn(),
      registerRequestByName: jest.fn(),
      registerRequestById: jest.fn(),
      flushLogs: jest.fn(),
      getHttpAdapter: jest.fn(),
      resolve: jest.fn(),
      registerRequestByContextId: jest.fn(),
      useLogger: jest.fn(),
      enableShutdownHooks: jest.fn(),
    };

    // Cast the mock to INestApplication
    app = mockApp as unknown as INestApplication;

    jest.spyOn(NestFactory, "create").mockResolvedValue(app);
    const mockSwaggerDoc = {
      openapi: "3.0.0",
      paths: {},
      components: {},
      info: {
        title: "Test API",
        version: "1.0",
      },
    };
    jest.spyOn(SwaggerModule, "createDocument").mockReturnValue(mockSwaggerDoc);
    jest.spyOn(SwaggerModule, "setup").mockReturnValue(undefined);
    jest.spyOn(DocumentBuilder.prototype, "setTitle").mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, "setDescription").mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, "setVersion").mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, "addBearerAuth").mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, "build").mockReturnThis();

    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create NestJS application", async () => {
    await bootstrap();
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it("should enable CORS with correct configuration", async () => {
    await bootstrap();
    expect(app.setGlobalPrefix).toHaveBeenCalledWith("api");
    expect(app.enableCors).toHaveBeenCalledWith({
      origin: true,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
      credentials: true,
    });
  });

  it("should set up global validation pipe", async () => {
    await bootstrap();
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));

    const validationPipeCalls = (app.useGlobalPipes as jest.Mock).mock.calls as [ValidationPipe][];
    if (!Array.isArray(validationPipeCalls) || validationPipeCalls.length === 0) {
      throw new Error('Expected at least one validation pipe call');
    }

    const validationPipe = validationPipeCalls[0][0];
    expect(validationPipe).toBeInstanceOf(ValidationPipe);
  });

  it("should set up Swagger documentation", async () => {
    await bootstrap();

    expect(DocumentBuilder.prototype.setTitle).toHaveBeenCalledWith(
      "Hair Salon Booking API"
    );
    expect(DocumentBuilder.prototype.setDescription).toHaveBeenCalledWith(
      "API documentation for the Hair Salon Booking System"
    );
    expect(DocumentBuilder.prototype.setVersion).toHaveBeenCalledWith("1.0");
    expect(DocumentBuilder.prototype.addBearerAuth).toHaveBeenCalledWith(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth"
    );
    expect(DocumentBuilder.prototype.build).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();

    const setupCalls = (SwaggerModule.setup as jest.Mock).mock.calls;
    if (!Array.isArray(setupCalls) || setupCalls.length === 0) {
      throw new Error('Expected at least one Swagger setup call');
    }

    const [path, setupApp, document, options] = setupCalls[0];
    expect(path).toBe("api-docs");
    expect(setupApp).toBe(app);
    expect(document).toEqual(expect.objectContaining({
      openapi: "3.0.0",
      paths: expect.any(Object),
      components: expect.any(Object),
      info: expect.objectContaining({
        title: expect.any(String),
        version: expect.any(String),
      }),
    }));
    expect(options).toEqual({
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: "none",
        filter: true,
        showRequestDuration: true,
      },
    });
  });

  it("should listen on the configured port", async () => {
    const originalEnv = process.env.PORT;
    process.env.PORT = "4000";

    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith("4000");

    process.env.PORT = originalEnv;
  });

  it("should use default port 3000 when PORT env is not set", async () => {
    const originalEnv = process.env.PORT;
    delete process.env.PORT;

    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith(3000);

    process.env.PORT = originalEnv;
  });
});
