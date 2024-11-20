import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { BookingsModule } from '../bookings/bookings.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    BookingsModule,
    AuthModule,
  ],
  providers: [
    OrdersService,
    RolesGuard,    // Provide RolesGuard
    JwtAuthGuard,  // Provide JwtAuthGuard
  ],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
