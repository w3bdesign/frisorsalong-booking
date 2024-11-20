import { Test } from '@nestjs/testing';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { bootstrap } from './main';

// Mock all external modules
jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRoot: jest.fn().mockReturnValue({}),
    forRootAsync: jest.fn().mockReturnValue({}),
    forFeature: jest.fn().mockReturnValue({}),
  },
  getRepositoryToken: jest.fn(),
  InjectRepository: () => jest.fn(),
}));

jest.mock('@nestjs/cache-manager', () => ({
  CacheModule: {
    register: jest.fn().mockReturnValue({}),
    registerAsync: jest.fn().mockReturnValue({}),
  },
}));

jest.mock('@nestjs/config', () => ({
  ConfigModule: {
    forRoot: jest.fn().mockReturnValue({}),
  },
  ConfigService: jest.fn().mockImplementation(() => ({
    get: jest.fn().mockImplementation((key) => {
      if (key === 'cache') {
        return {
          host: 'localhost',
          port: 6379,
          ttl: 300,
        };
      }
      return null;
    }),
  })),
}));

// Mock feature modules
jest.mock('./auth/auth.module', () => ({
  AuthModule: jest.fn().mockReturnValue({}),
}));

jest.mock('./users/users.module', () => ({
  UsersModule: jest.fn().mockReturnValue({}),
}));

jest.mock('./employees/employees.module', () => ({
  EmployeesModule: jest.fn().mockReturnValue({}),
}));

jest.mock('./services/services.module', () => ({
  ServicesModule: jest.fn().mockReturnValue({}),
}));

jest.mock('./bookings/bookings.module', () => ({
  BookingsModule: jest.fn().mockReturnValue({}),
}));

// Mock app module
jest.mock('./app.module', () => ({
  AppModule: jest.fn().mockReturnValue({}),
}));

describe('Bootstrap', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Reset modules before each test
    jest.resetModules();

    app = {
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
    } as any;

    jest.spyOn(NestFactory, 'create').mockResolvedValue(app);
    jest.spyOn(SwaggerModule, 'createDocument').mockReturnValue({} as any);
    jest.spyOn(SwaggerModule, 'setup').mockReturnValue(undefined);
    jest.spyOn(DocumentBuilder.prototype, 'setTitle').mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, 'setDescription').mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, 'setVersion').mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, 'addBearerAuth').mockReturnThis();
    jest.spyOn(DocumentBuilder.prototype, 'build').mockReturnThis();

    // Mock console.log to reduce noise in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should create NestJS application', async () => {
    await bootstrap();
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should enable CORS with correct configuration', async () => {
    await bootstrap();
    expect(app.enableCors).toHaveBeenCalledWith({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
  });

  it('should set up global validation pipe', async () => {
    await bootstrap();
    expect(app.useGlobalPipes).toHaveBeenCalledWith(expect.any(ValidationPipe));
    
    const validationPipe = (app.useGlobalPipes as jest.Mock).mock.calls[0][0];
    expect(validationPipe).toBeInstanceOf(ValidationPipe);
  });

  it('should set up Swagger documentation', async () => {
    await bootstrap();
    
    expect(DocumentBuilder.prototype.setTitle).toHaveBeenCalledWith('Hair Salon Booking API');
    expect(DocumentBuilder.prototype.setDescription).toHaveBeenCalledWith('API documentation for the Hair Salon Booking System');
    expect(DocumentBuilder.prototype.setVersion).toHaveBeenCalledWith('1.0');
    expect(DocumentBuilder.prototype.addBearerAuth).toHaveBeenCalledWith(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    );
    expect(DocumentBuilder.prototype.build).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith('api', app, expect.any(Object), {
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'none',
        filter: true,
        showRequestDuration: true,
      },
    });
  });

  it('should listen on the configured port', async () => {
    const originalEnv = process.env.PORT;
    process.env.PORT = '4000';

    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith('4000');

    process.env.PORT = originalEnv;
  });

  it('should use default port 3000 when PORT env is not set', async () => {
    const originalEnv = process.env.PORT;
    delete process.env.PORT;

    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith(3000);

    process.env.PORT = originalEnv;
  });
});
