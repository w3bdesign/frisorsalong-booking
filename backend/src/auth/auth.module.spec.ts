import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth.module';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { User } from '../users/entities/user.entity';
import { DynamicModule, Provider, Type, ValueProvider, FactoryProvider } from '@nestjs/common';

type Constructor<T> = new (...args: unknown[]) => T;

interface ModuleMetadata {
  imports: Array<Type<unknown> | DynamicModule>;
  providers: Provider[];
  exports: Array<Type<unknown> | DynamicModule>;
  controllers: Constructor<unknown>[];
}

interface PassportConfig extends ValueProvider<{ defaultStrategy: string }> {
  provide: string;
  useValue: { defaultStrategy: string };
}

interface JwtConfig extends FactoryProvider {
  provide: string;
  useFactory: (...args: unknown[]) => unknown;
  inject: Type<unknown>[];
}

interface TypeOrmEntityConfig {
  provide: string;
  useValue: {
    targetEntitySchema: {
      target: Constructor<User>;
    };
  };
}

jest.mock('../users/users.module');

describe('AuthModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('module metadata', () => {
    it('should have the correct imports', () => {
      const imports = Reflect.getMetadata('imports', AuthModule) as ModuleMetadata['imports'];
      
      // Check UsersModule
      expect(imports).toContain(UsersModule);
      
      // Check PassportModule (as dynamic module)
      const passportModuleConfig = imports.find(
        (imp): imp is DynamicModule => 
          typeof imp === 'object' && 
          'module' in imp && 
          imp.module === PassportModule
      );
      expect(passportModuleConfig).toBeDefined();
      const passportProvider = passportModuleConfig?.providers?.[0] as PassportConfig;
      if (passportProvider) {
        expect(passportProvider.useValue).toEqual({
          defaultStrategy: 'jwt'
        });
      }

      // Check JwtModule
      const jwtModuleConfig = imports.find(
        (imp): imp is DynamicModule => 
          typeof imp === 'object' && 
          'module' in imp && 
          imp.module === JwtModule
      );
      expect(jwtModuleConfig).toBeDefined();
      const jwtProvider = jwtModuleConfig?.providers?.[0] as JwtConfig;
      if (jwtProvider) {
        expect(jwtProvider.inject).toContain(ConfigService);
      }

      // Check TypeOrmModule
      const typeOrmModuleConfig = imports.find(
        (imp): imp is DynamicModule => 
          typeof imp === 'object' && 
          'module' in imp && 
          imp.module === TypeOrmModule
      );
      expect(typeOrmModuleConfig).toBeDefined();
      const typeOrmProvider = typeOrmModuleConfig?.exports?.[0] as TypeOrmEntityConfig;
      if (typeOrmProvider?.useValue) {
        expect(typeOrmProvider.useValue.targetEntitySchema.target).toBe(User);
      }
    });

    it('should have the correct providers', () => {
      const providers = Reflect.getMetadata('providers', AuthModule) as Provider[];
      expect(providers).toContain(AuthService);
      expect(providers).toContain(JwtStrategy);
      expect(providers).toContain(RolesGuard);
    });

    it('should have the correct exports', () => {
      const exports = Reflect.getMetadata('exports', AuthModule) as ModuleMetadata['exports'];
      expect(exports).toContain(AuthService);
      expect(exports).toContain(JwtStrategy);
      expect(exports).toContain(RolesGuard);
      expect(exports).toContain(JwtModule);
      expect(exports).toContain(PassportModule);
    });

    it('should have the correct controllers', () => {
      const controllers = Reflect.getMetadata('controllers', AuthModule) as Constructor<unknown>[];
      expect(controllers).toBeDefined();
      expect(controllers.length).toBe(1);
    });
  });
});
