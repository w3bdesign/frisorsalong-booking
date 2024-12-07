CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/

app.module.spec.ts

206    const config = factoryFn(mockConfigService);

CRITICAL

Error prone

Unsafe argument of type `any` assigned to a parameter of type `string | RegExp | Constructable | Error | undefined`.
backend/src/auth/strategies/

jwt.strategy.spec.ts

108        .toThrow(new UnauthorizedException('User not found'));

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/auth/strategies/

jwt.strategy.ts

25@Injectable()

CRITICAL

Error prone

Unsafe member access .query on an `error` typed value.
backend/src/database/migrations/

1731981975582-CreateBookingSystem.ts

96    await queryRunner.query(`DROP TABLE "employees"`);

CRITICAL

Error prone

Unsafe assignment of type `Mock<any, any, any>` to a variable of type `Mock<Promise<void>, [string], any>`.
backend/src/database/migrations/

1731981975583-CreateOrders.spec.ts

32      dropTable: jest.fn().mockResolvedValue(undefined),

CRITICAL

Error prone

Unsafe assignment of type `Mock<any, any, any>` to a variable of type `Mock<Promise<Table>, [string], any>`.
backend/src/database/migrations/

1731981975583-CreateOrders.spec.ts

21      getTable: jest.fn().mockResolvedValue(new Table({

CRITICAL

Error prone

Unsafe construction of an any type value.
backend/src/database/migrations/

1731981975584-AddShopCodes.spec.ts

16    dataSource = new DataSource({

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/database/seeds/

create-initial-data.seed.ts

22  const employeeRepository = dataSource.getRepository(Employee);

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/database/seeds/

create-initial-data.seed.ts

75      const employeeUser = await userRepository.save({

CRITICAL

Error prone

Unsafe member access .execute on an `error` typed value.
backend/src/database/seeds/

create-initial-data.seed.ts

115        .execute();

CRITICAL

Error prone

Unsafe member access .find on an `any` value.
backend/src/database/seeds/

create-sample-bookings.seed.spec.ts

230    const cancelledBooking = savedBookings.find((b: Booking) => b.status === BookingStatus.CANCELLED);

CRITICAL

Error prone

Unsafe assignment of an `any` value.
backend/src/database/seeds/

create-sample-bookings.seed.spec.ts

160    const savedBookings = (mockBookingRepository.save as jest.Mock).mock.calls[0][0];

CRITICAL

Error prone

Unsafe call of an `any` typed value.
backend/src/database/seeds/

create-sample-bookings.seed.spec.ts

230    const cancelledBooking = savedBookings.find((b: Booking) => b.status === BookingStatus.CANCELLED);

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/database/seeds/

create-sample-bookings.seed.spec.ts

77        'User': mockUserRepository as Repository<User>,

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/database/seeds/

create-sample-bookings.seed.ts

49      const customer = await userRepository.save({

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/database/seeds/

create-sample-bookings.seed.ts

19  const bookingRepository: Repository<Booking> = dataSource.getRepository(Booking);

CRITICAL

Error prone

Unsafe member access .save on an `error` typed value.
backend/src/database/seeds/

create-sample-orders.seed.ts

53      const savedOrder = await orderRepository.save(order);

CRITICAL

Error prone

Unsafe member access .find on an `error` typed value.
backend/src/database/seeds/

create-sample-orders.seed.ts

14    const confirmedBookings = await bookingRepository.find({

CRITICAL

Error prone

Unsafe member access .length on an `error` typed value.
backend/src/employees/dto/

create-employee.dto.spec.ts

17    expect(errors.length).toBe(0);

CRITICAL

Error prone

Avoid referencing unbound methods which may cause unintentional scoping of `this`. If your function does not access `this`, you can annotate it with `this: void`, or consider using an arrow function instead.
backend/src/employees/

employees.controller.spec.ts

180      expect(service.findByUserId).toHaveBeenCalledWith(employeeUser.id);

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/employees/

employees.controller.spec.ts

81    controller = module.get<EmployeesController>(EmployeesController);

CRITICAL

Error prone

Unsafe return of an error typed value.
backend/src/employees/

employees.controller.spec.ts

30      return bcrypt.compare(password, this.password);

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/employees/

employees.controller.spec.ts

25        const salt = await bcrypt.genSalt();

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/employees/

employees.controller.ts

51  @Post(':id/reset-password')