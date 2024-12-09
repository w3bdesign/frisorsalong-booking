import { ValidationPipe, INestApplication } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from "@nestjs/swagger";
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

type MockNestApp = {
  [K in keyof INestApplication]: jest.Mock;
};

interface SwaggerSetupOptions {
  swaggerOptions: {
    persistAuthorization: boolean;
    docExpansion: string;
    filter: boolean;
    showRequestDuration: boolean;
  };
}

describe("Bootstrap", () => {
  let app: MockNestApp;
  const mockSwaggerDoc: OpenAPIObject = {
    openapi: "3.0.0",
    paths: {},
    components: {},
    info: {
      title: "Test API",
      version: "1.0",
    },
  };

  beforeEach(() => {
    // Reset modules before each test
    jest.resetModules();

    // Create a more complete mock implementation of INestApplication
    app = {
      enableCors: jest.fn().mockReturnThis(),
      useGlobalPipes: jest.fn().mockReturnThis(),
      listen: jest.fn().mockResolvedValue(undefined),
      init: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      useGlobalFilters: jest.fn().mockReturnThis(),
      useGlobalInterceptors: jest.fn().mockReturnThis(),
      useGlobalGuards: jest.fn().mockReturnThis(),
      use: jest.fn().mockReturnThis(),
      setGlobalPrefix: jest.fn().mockReturnThis(),
      enableVersioning: jest.fn().mockReturnThis(),
      getUrl: jest.fn().mockReturnThis(),
      useWebSocketAdapter: jest.fn().mockReturnThis(),
      connectMicroservice: jest.fn().mockReturnThis(),
      getMicroservices: jest.fn().mockReturnThis(),
      getHttpServer: jest.fn().mockReturnThis(),
      startAllMicroservices: jest.fn().mockReturnThis(),
      stopAllMicroservices: jest.fn().mockReturnThis(),
      createNestApplication: jest.fn().mockReturnThis(),
      registerRequestByName: jest.fn().mockReturnThis(),
      registerRequestById: jest.fn().mockReturnThis(),
      flushLogs: jest.fn().mockReturnThis(),
      getHttpAdapter: jest.fn().mockReturnThis(),
      resolve: jest.fn().mockReturnThis(),
      registerRequestByContextId: jest.fn().mockReturnThis(),
      useLogger: jest.fn().mockReturnThis(),
      enableShutdownHooks: jest.fn().mockReturnThis(),
    } as unknown as MockNestApp;

    jest.spyOn(NestFactory, "create").mockResolvedValue(app as unknown as INestApplication);
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

    const validationPipeCalls = app.useGlobalPipes.mock.calls;
    const validationPipe = validationPipeCalls[0][0] as ValidationPipe;
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

    const setupMock = SwaggerModule.setup as jest.Mock;
    const setupCalls = setupMock.mock.calls;
    const [path, setupApp, document, options] = setupCalls[0] as [string, INestApplication, OpenAPIObject, SwaggerSetupOptions];

    expect(path).toBe("api-docs");
    expect(setupApp).toBe(app);
    expect(document).toEqual<OpenAPIObject>({
      openapi: "3.0.0",
      paths: {},
      components: {},
      info: {
        title: expect.any(String),
        version: expect.any(String),
      },
    });
    expect(options).toEqual<SwaggerSetupOptions>({
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
