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

jest.mock('../users/users.module');

describe('AuthModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('module metadata', () => {
    it('should have the correct imports', () => {
      const imports = Reflect.getMetadata('imports', AuthModule);
      
      // Check UsersModule
      expect(imports).toContain(UsersModule);
      
      // Check PassportModule (as dynamic module)
      const passportModuleConfig = imports.find(
        imp => imp.module === PassportModule
      );
      expect(passportModuleConfig).toBeDefined();
      expect(passportModuleConfig.providers[0].useValue).toEqual({
        defaultStrategy: 'jwt'
      });

      // Check JwtModule
      const jwtModuleConfig = imports.find(imp => imp.module === JwtModule);
      expect(jwtModuleConfig).toBeDefined();
      expect(jwtModuleConfig.providers).toBeDefined();
      expect(jwtModuleConfig.providers[0].inject).toContain(ConfigService);

      // Check TypeOrmModule
      const typeOrmModuleConfig = imports.find(imp => imp.module === TypeOrmModule);
      expect(typeOrmModuleConfig).toBeDefined();
      expect(typeOrmModuleConfig.exports[0].targetEntitySchema.target).toBe(User);
    });

    it('should have the correct providers', () => {
      const providers = Reflect.getMetadata('providers', AuthModule);
      expect(providers).toContain(AuthService);
      expect(providers).toContain(JwtStrategy);
      expect(providers).toContain(RolesGuard);
    });

    it('should have the correct exports', () => {
      const exports = Reflect.getMetadata('exports', AuthModule);
      expect(exports).toContain(AuthService);
      expect(exports).toContain(JwtStrategy);
      expect(exports).toContain(RolesGuard);
      expect(exports).toContain(JwtModule);
      expect(exports).toContain(PassportModule);
    });

    it('should have the correct controllers', () => {
      const controllers = Reflect.getMetadata('controllers', AuthModule);
      expect(controllers).toBeDefined();
      expect(controllers.length).toBe(1);
    });
  });
});
