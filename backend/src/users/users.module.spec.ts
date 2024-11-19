import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersModule', () => {
  let module: UsersModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test',
          entities: [User],
          synchronize: true,
        }),
        UsersModule,
      ],
    }).compile();

    module = moduleRef.get(UsersModule);
  }, 10000); // Increased timeout to 10 seconds

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should export UsersService', () => {
    const moduleExports = Reflect.getMetadata('exports', UsersModule);
    expect(moduleExports).toContain(UsersService);
  });

  it('should export TypeOrmModule', () => {
    const moduleExports = Reflect.getMetadata('exports', UsersModule);
    expect(moduleExports).toContain(TypeOrmModule);
  });

  it('should not have any controllers', () => {
    const controllers = Reflect.getMetadata('controllers', UsersModule);
    expect(controllers).toEqual([]);
  });
});
