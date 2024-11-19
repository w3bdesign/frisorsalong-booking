import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { EmployeesModule } from '../employees/employees.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    EmployeesModule, // We need this for service-employee relationships
  ],
  providers: [],
  controllers: [],
  exports: [TypeOrmModule],
})
export class ServicesModule {}
