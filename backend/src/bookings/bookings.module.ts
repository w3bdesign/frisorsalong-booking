import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Booking } from "./entities/booking.entity";
import { BookingsService } from "./bookings.service";
import { BookingsController } from "./bookings.controller";
import { UsersModule } from "../users/users.module";
import { EmployeesModule } from "../employees/employees.module";
import { ServicesModule } from "../services/services.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    UsersModule,
    EmployeesModule,
    ServicesModule,
  ],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService, TypeOrmModule],
})
export class BookingsModule {}
