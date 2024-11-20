import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    BookingsModule,
  ],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
