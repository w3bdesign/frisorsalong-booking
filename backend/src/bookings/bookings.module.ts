import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { UsersModule } from '../users/users.module';
import { EmployeesModule } from '../employees/employees.module';
import { ServicesModule } from '../services/services.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking]),
    UsersModule,     // For customer relationship
    EmployeesModule, // For employee relationship
    ServicesModule,  // For service relationship
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class BookingsModule {}
