CRITICAL

Error prone

'mockUser' is assigned a value but never used.
backend/src/auth/guards/

jwt-auth.guard.spec.ts

116      const mockUser: Partial<User> = {

CRITICAL

Error prone

Unsafe argument of type `any` assigned to a parameter of type `string | RegExp | Constructable | Error | undefined`.
backend/src/auth/guards/

jwt-auth.guard.spec.ts

52        new UnauthorizedException('Token not provided')

CRITICAL

Error prone

Unsafe return of an error typed value.
backend/src/auth/guards/

jwt-auth.guard.spec.ts

35      expect(() => guard.canActivate(mockExecutionContext)).toThrow(

CRITICAL

Error prone

'status' is defined but never used.
backend/src/auth/guards/

jwt-auth.guard.ts

46    status?: any

CRITICAL

Error prone

Unsafe member access .findOne on an `error` typed value.
backend/src/auth/strategies/

jwt.strategy.spec.ts

97      (mockUsersRepository.findOne as jest.Mock).mockResolvedValue(null);

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/auth/strategies/

jwt.strategy.spec.ts

55    expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');

CRITICAL

Error prone

Unsafe member access .fromAuthHeaderAsBearerToken on an `error` typed value.
backend/src/auth/strategies/

jwt.strategy.ts

38      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

79  @Get("customer/:customerId")

CRITICAL

Error prone

'bookingRepository' is assigned a value but never used.
backend/src/bookings/

bookings.service.spec.ts

19  let bookingRepository: Repository<Booking>;

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/bookings/

bookings.service.spec.ts

83    servicesService = module.get<ServicesService>(ServicesService);

CRITICAL

Error prone

Unsafe argument of type `any` assigned to a parameter of type `string | RegExp | Constructable | Error | undefined`.
backend/src/bookings/

bookings.service.spec.ts

272        new NotFoundException('Booking with ID non-existent-id not found'),

CRITICAL

Error prone

Unsafe return of an `any` typed value.
backend/src/database/migrations/

1731981975581-InitialMigration.spec.ts

117        call => call[0],

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/database/migrations/

1731981975581-InitialMigration.ts

82    await queryRunner.query(`DROP TABLE "services"`);

CRITICAL

Error prone

Unsafe member access .query on an `error` typed value.
backend/src/database/migrations/

1731981975582-CreateBookingSystem.ts

96    await queryRunner.query(`DROP TABLE "employees"`);

CRITICAL

Error prone

Unsafe member access .foreignKeys on an `error` typed value.
backend/src/database/migrations/

1731981975583-CreateOrders.ts

63    const foreignKey = table.foreignKeys.find(

CRITICAL

Error prone

Unsafe member access .mock on an `error` typed value.
backend/src/database/migrations/

1731981975584-AddShopCodes.spec.ts

50      expect(querySpy.mock.calls[1][0]).toContain('Test Shop');

CRITICAL

Error prone

Unsafe member access .into on an `error` typed value.
backend/src/database/seeds/

create-initial-data.seed.spec.ts

127    expect(mockQueryBuilder.into).toHaveBeenCalledWith('employee_services');

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/database/seeds/

create-initial-data.seed.ts

92            employee_id: employee.id,

CRITICAL

Error prone

Unsafe return of an error typed value.
backend/src/database/seeds/

create-sample-bookings.seed.spec.ts

72      if (entity === Booking) return mockBookingRepository as Repository<Booking>;

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/database/seeds/

create-sample-bookings.seed.ts

81      const endTime = new Date(startTime.getTime() + service.duration * 60 * 1000);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/database/seeds/

create-sample-bookings.seed.ts

44        password: await bcrypt.hash('password123', 10),

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/database/seeds/

create-sample-bookings.seed.ts

13  const bookingRepository = dataSource.getRepository(Booking);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/database/seeds/

create-sample-orders.seed.ts

13    const confirmedBookings = await bookingRepository.find({

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

Unsafe assignment of an error typed value.
backend/src/employees/

employees.controller.spec.ts

25        const salt = await bcrypt.genSalt();

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/employees/

employees.service.spec.ts

68          provide: getRepositoryToken(Booking),

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/employees/

employees.service.spec.ts

78    service = module.get<EmployeesService>(EmployeesService);

CRITICAL

Error prone

Unsafe member access .save on an `error` typed value.
backend/src/employees/

employees.service.spec.ts

152      expect(userRepository.save).not.toHaveBeenCalled();

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/employees/

employees.service.spec.ts

80    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/employees/

employees.service.ts

14    @InjectRepository(Employee)

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/employees/

employees.service.ts

72    const employee = await this.employeeRepository.findOne({

CRITICAL

Error prone

Unsafe member access .start on an `any` value.
backend/src/employees/

employees.service.ts

126      const [startHour, startMinute] = slot.start.split(':').map(Number);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/

main.spec.ts

118    jest.spyOn(DocumentBuilder.prototype, "addBearerAuth").mockReturnThis();

CRITICAL

Error prone

Unsafe member access .prototype on an `error` typed value.
backend/src/

main.spec.ts

119    jest.spyOn(DocumentBuilder.prototype, "build").mockReturnThis();

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/orders/

orders.controller.spec.ts

26        this.password = await bcrypt.hash(this.password, salt);