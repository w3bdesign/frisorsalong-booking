import { Test } from '@nestjs/testing';
import { BookingsModule } from './bookings.module';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { UsersModule } from '../users/users.module';
import { EmployeesModule } from '../employees/employees.module';
import { ServicesModule } from '../services/services.module';
import { OrdersModule } from '../orders/orders.module';
import { ShopsModule } from '../shops/shops.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forFeature: jest.fn().mockReturnValue({
      module: class MockTypeOrmModule {},
      providers: [],
    }),
  },
}));

describe('BookingsModule', () => {
  let module: BookingsModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([Booking]),
        UsersModule,
        EmployeesModule,
        ServicesModule,
        OrdersModule,
        ShopsModule,
        AuthModule,
      ],
      controllers: [BookingsController],
      providers: [
        BookingsService,
        RolesGuard,
        JwtAuthGuard,
      ],
      exports: [BookingsService, TypeOrmModule],
    }).compile();

    module = moduleRef.get<BookingsModule>(BookingsModule);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have correct imports', () => {
    const metadata = Reflect.getMetadata('imports', BookingsModule);
    expect(metadata).toBeDefined();
    expect(metadata).toContain(UsersModule);
    expect(metadata).toContain(ServicesModule);
    expect(metadata).toContain(ShopsModule);
    expect(metadata).toContain(AuthModule);
    
    // Verify TypeOrmModule.forFeature was called with Booking entity
    expect(TypeOrmModule.forFeature).toHaveBeenCalledWith([Booking]);
  });

  it('should handle circular dependencies correctly', () => {
    const metadata = Reflect.getMetadata('imports', BookingsModule);
    const forwardRefs = metadata.filter(imp => typeof imp === 'function');
    expect(forwardRefs).toHaveLength(2); // EmployeesModule and OrdersModule
  });

  it('should have correct providers', () => {
    const metadata = Reflect.getMetadata('providers', BookingsModule);
    expect(metadata).toContain(BookingsService);
    expect(metadata).toContain(RolesGuard);
    expect(metadata).toContain(JwtAuthGuard);
  });

  it('should have correct exports', () => {
    const metadata = Reflect.getMetadata('exports', BookingsModule);
    expect(metadata).toContain(BookingsService);
    expect(metadata).toContainEqual(TypeOrmModule.forFeature([Booking]));
  });
});
