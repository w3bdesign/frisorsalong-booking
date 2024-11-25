import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";
import { Booking } from "./entities/booking.entity";
import { UsersModule } from "../users/users.module";
import { EmployeesModule } from "../employees/employees.module";
import { ServicesModule } from "../services/services.module";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    UsersModule,
    EmployeesModule,
    ServicesModule,
    forwardRef(() => OrdersModule),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
