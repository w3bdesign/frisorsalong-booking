import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { UsersModule } from '../users/users.module';
import { EmployeesModule } from '../employees/employees.module';
import { ServicesModule } from '../services/services.module';
import { OrdersModule } from '../orders/orders.module';
import { ShopsModule } from '../shops/shops.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    UsersModule,
    forwardRef(() => EmployeesModule),
    ServicesModule,
    forwardRef(() => OrdersModule),
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
})
export class BookingsModule {}
