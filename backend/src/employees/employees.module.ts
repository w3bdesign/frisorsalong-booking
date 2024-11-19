import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee]),
    UsersModule, // We need this for employee-user relationship
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class EmployeesModule {}
