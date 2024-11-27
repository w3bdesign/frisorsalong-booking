import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { Booking } from "./entities/booking.entity";
import { UsersModule } from "../users/users.module";
import { EmployeesModule } from "../employees/employees.module";
import { ServicesModule } from "../services/services.module";
import { OrdersModule } from "../orders/orders.module";
import { ShopsModule } from "../shops/shops.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    UsersModule,
    EmployeesModule,
    ServicesModule,
    OrdersModule,
    ShopsModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
