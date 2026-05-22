import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "../bookings/entities/booking.entity";
import { Employee } from "../employees/entities/employee.entity";
import { Order } from "../orders/entities/order.entity";
import { User } from "../users/entities/user.entity";
import { Service } from "../services/entities/service.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Employee, Order, User, Service]),
  ],
  exports: [TypeOrmModule],
})
export class SharedModule {}
