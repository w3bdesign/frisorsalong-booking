import { Test } from '@nestjs/testing';
import { EmployeesModule } from './employees.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { EmployeesService } from './employees.service';

describe('EmployeesModule', () => {
  let module: EmployeesModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        EmployeesModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Employee, Booking],
          synchronize: true,
        }),
      ],
    }).compile();

    module = moduleRef.get<EmployeesModule>(EmployeesModule);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should export EmployeesService', () => {
    const moduleExports = Reflect.getMetadata('exports', EmployeesModule);
    expect(moduleExports).toContain(EmployeesService);
  });

  it('should export TypeOrmModule', () => {
    const moduleExports = Reflect.getMetadata('exports', EmployeesModule);
    expect(moduleExports).toContain(TypeOrmModule);
  });
});
