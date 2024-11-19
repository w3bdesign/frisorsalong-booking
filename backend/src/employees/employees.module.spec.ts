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
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test',
          entities: [Employee, Booking],
          synchronize: true,
        }),
        EmployeesModule,
      ],
    }).compile();

    module = moduleRef.get(EmployeesModule);
  }, 10000); // Increased timeout to 10 seconds

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
