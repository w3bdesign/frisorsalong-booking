import { Test } from '@nestjs/testing';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';

// Mock AppModule
jest.mock('./app.module', () => ({
  AppModule: class MockAppModule {},
}));

// Mock NestFactory
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
} as unknown as INestApplication;

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue(mockApp),
  },
}));

// Mock SwaggerModule
jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({
      openapi: '3.0.0',
      info: {
        title: 'Hair Salon Booking API',
        description: 'API documentation for the Hair Salon Booking System',
        version: '1.0',
      },
      paths: {},
    }),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn().mockReturnValue({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    addBearerAuth: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnThis(),
  }),
}));

// Mock console.log to reduce noise in tests
console.log = jest.fn();

describe('Bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetModules();
  });

  it('should create NestJS application', async () => {
    // Run the bootstrap function in isolation
    await jest.isolateModules(async () => {
      await require('./main');
      expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
    });
  });

  it('should enable CORS with correct configuration', async () => {
    await jest.isolateModules(async () => {
      await require('./main');
      expect(mockApp.enableCors).toHaveBeenCalledWith({
        origin: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
      });
    });
  });

  it('should set up global validation pipe with correct configuration', async () => {
    await jest.isolateModules(async () => {
      await require('./main');
      expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
        expect.any(ValidationPipe)
      );
      
      const validationPipe = (mockApp.useGlobalPipes as jest.Mock).mock.calls[0][0];
      expect(validationPipe.options).toEqual({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: false,
        validationError: {
          target: false,
          value: false,
        },
      });
    });
  });

  it('should set up Swagger documentation', async () => {
    await jest.isolateModules(async () => {
      await require('./main');
      
      const documentBuilder = new DocumentBuilder();
      expect(documentBuilder.setTitle).toHaveBeenCalledWith('Hair Salon Booking API');
      expect(documentBuilder.setDescription).toHaveBeenCalledWith('API documentation for the Hair Salon Booking System');
      expect(documentBuilder.setVersion).toHaveBeenCalledWith('1.0');
      expect(documentBuilder.addBearerAuth).toHaveBeenCalledWith(
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
      expect(documentBuilder.build).toHaveBeenCalled();
      expect(SwaggerModule.createDocument).toHaveBeenCalled();
      expect(SwaggerModule.setup).toHaveBeenCalledWith('api', mockApp, expect.any(Object), {
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: 'none',
          filter: true,
          showRequestDuration: true,
        },
      });
    });
  });

  it('should listen on the configured port', async () => {
    const originalEnv = process.env.PORT;
    process.env.PORT = '4000';

    await jest.isolateModules(async () => {
      await require('./main');
      expect(mockApp.listen).toHaveBeenCalledWith('4000');
    });

    process.env.PORT = originalEnv;
  });

  it('should use default port 3000 when PORT env is not set', async () => {
    const originalEnv = process.env.PORT;
    delete process.env.PORT;

    await jest.isolateModules(async () => {
      await require('./main');
      expect(mockApp.listen).toHaveBeenCalledWith(3000);
    });

    process.env.PORT = originalEnv;
  });
});
