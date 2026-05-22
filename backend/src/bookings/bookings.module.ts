import { Module, forwardRef } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { UsersModule } from '../users/users.module';
import { EmployeesModule } from '../employees/employees.module';
import { ServicesModule } from '../services/services.module';
import { ShopsModule } from '../shops/shops.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    UsersModule,
    forwardRef(() => EmployeesModule),
    ServicesModule,
    ShopsModule,
    AuthModule,
  ],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    RolesGuard,
    JwtAuthGuard,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
