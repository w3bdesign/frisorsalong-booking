import { Test } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

// Mock UsersModule
jest.mock('../users/users.module', () => ({
  UsersModule: class MockUsersModule {},
}));

// Mock AuthService
jest.mock('./auth.service', () => ({
  AuthService: jest.fn().mockImplementation(() => ({})),
}));

describe('AuthModule', () => {
  it('should be defined', () => {
    expect(AuthModule).toBeDefined();
  });

  describe('module metadata', () => {
    it('should have the correct imports', () => {
      const imports = Reflect.getMetadata('imports', AuthModule);
      expect(imports).toContain(UsersModule);
      expect(imports).toContain(PassportModule);
      // Check if JwtModule is included (it will be a dynamic module)
      expect(imports.some(imp => imp.module === JwtModule)).toBeTruthy();
    });

    it('should have the correct providers', () => {
      const providers = Reflect.getMetadata('providers', AuthModule);
      expect(providers).toEqual(
        expect.arrayContaining([
          AuthService,
          JwtStrategy,
          RolesGuard,
        ])
      );
    });

    it('should have the correct controllers', () => {
      const controllers = Reflect.getMetadata('controllers', AuthModule);
      expect(controllers).toContain(AuthController);
    });

    it('should export JwtModule', () => {
      const exports = Reflect.getMetadata('exports', AuthModule);
      expect(exports).toContain(JwtModule);
    });
  });

  describe('module compilation', () => {
    it('should compile the module', async () => {
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [() => ({
              jwt: {
                secret: 'test-secret',
                signOptions: {
                  expiresIn: '1h',
                },
              },
            })],
          }),
          AuthModule,
        ],
      })
        .overrideProvider(AuthService)
        .useValue({})
        .overrideProvider(JwtStrategy)
        .useValue({})
        .overrideProvider(ConfigService)
        .useValue({
          get: jest.fn((key: string) => {
            switch (key) {
              case 'jwt.secret':
                return 'test-secret';
              case 'jwt.signOptions.expiresIn':
                return '1h';
              default:
                return null;
            }
          }),
        })
        .overrideProvider(getRepositoryToken(User))
        .useValue({
          find: jest.fn(),
          findOne: jest.fn(),
          save: jest.fn(),
        })
        .compile();

      expect(module).toBeDefined();
    });
  });
});
