import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Employee } from "./entities/employee.entity";
import { Booking } from "../bookings/entities/booking.entity";
import { User } from "../users/entities/user.entity";
import { EmployeesService } from "./employees.service";
import { EmployeesController } from "./employees.controller";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, Booking, User]),
    UsersModule
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService, TypeOrmModule],
})
export class EmployeesModule {}
