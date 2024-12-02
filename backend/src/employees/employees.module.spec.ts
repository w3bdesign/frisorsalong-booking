import { Test } from '@nestjs/testing';
import { EmployeesModule } from './employees.module';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './entities/employee.entity';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { UsersModule } from '../users/users.module';
import { BookingsModule } from '../bookings/bookings.module';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forFeature: jest.fn().mockReturnValue({
      module: class MockTypeOrmModule {},
      providers: [],
    }),
  },
}));

describe('EmployeesModule', () => {
  let module: EmployeesModule;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forFeature([Employee, User, Booking]),
        UsersModule,
        BookingsModule,
        OrdersModule,
        AuthModule,
      ],
      controllers: [EmployeesController],
      providers: [EmployeesService],
      exports: [EmployeesService],
    }).compile();

    module = moduleRef.get<EmployeesModule>(EmployeesModule);
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have correct imports', () => {
    const metadata = Reflect.getMetadata('imports', EmployeesModule);
    expect(metadata).toBeDefined();
    expect(metadata).toContain(UsersModule);
    expect(metadata).toContain(AuthModule);
    
    // Verify TypeOrmModule.forFeature was called with all required entities
    expect(TypeOrmModule.forFeature).toHaveBeenCalledWith([Employee, User, Booking]);
  });

  it('should handle circular dependencies correctly', () => {
    const metadata = Reflect.getMetadata('imports', EmployeesModule);
    const forwardRefs = metadata.filter(imp => typeof imp === 'function');
    expect(forwardRefs).toHaveLength(2); // BookingsModule and OrdersModule
  });

  it('should have correct providers', () => {
    const metadata = Reflect.getMetadata('providers', EmployeesModule);
    expect(metadata).toContain(EmployeesService);
  });

  it('should have correct exports', () => {
    const metadata = Reflect.getMetadata('exports', EmployeesModule);
    expect(metadata).toContain(EmployeesService);
  });

  it('should have correct controllers', () => {
    const metadata = Reflect.getMetadata('controllers', EmployeesModule);
    expect(metadata).toContain(EmployeesController);
  });
});
