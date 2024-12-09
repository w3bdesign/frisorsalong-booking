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
    }).compile();

    module = moduleRef.get<BookingsModule>(BookingsModule);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should export BookingsService', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BookingsModule],
    }).compile();

    const bookingsService = moduleRef.get<BookingsService>(BookingsService);
    expect(bookingsService).toBeDefined();
  });

  it('should have BookingsController defined', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BookingsModule],
    }).compile();

    const bookingsController = moduleRef.get<BookingsController>(BookingsController);
    expect(bookingsController).toBeDefined();
  });

  it('should have guards defined', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [BookingsModule],
    }).compile();

    const rolesGuard = moduleRef.get<RolesGuard>(RolesGuard);
    const jwtAuthGuard = moduleRef.get<JwtAuthGuard>(JwtAuthGuard);

    expect(rolesGuard).toBeDefined();
    expect(jwtAuthGuard).toBeDefined();
  });
});
