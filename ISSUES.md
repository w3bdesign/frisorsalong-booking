CRITICAL

Error prone

'status' is defined but never used.
backend/src/auth/guards/

jwt-auth.guard.ts

46    status?: any

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

71  @Get("upcoming")

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

117  async cancel(@Param("id") id: string) {

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

124  @Put(":id/complete")

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

39  @Get("upcoming/count")

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

95  @Get(":id")

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

66  async create(@Body() createBookingDto: CreateBookingDto) {

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

47    @Body() createWalkInBookingDto: CreateWalkInBookingDto,

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

48    @Req() request: RequestWithShop

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

107    @Param("id") id: string,

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

44  @Post("walk-in")

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

108    @Body() updateBookingDto: UpdateBookingDto

CRITICAL

Error prone

'ordersService' is defined but never used.
backend/src/bookings/

bookings.controller.ts

36    private readonly ordersService: OrdersService

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

45  @UseGuards(ShopCodeGuard)

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

79  @Get("customer/:customerId")

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

87  @Get("employee/:employeeId")

CRITICAL

Error prone

'bookingsService' is defined but never used.
backend/src/bookings/

bookings.controller.ts

35    private readonly bookingsService: BookingsService,

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

82  async findByCustomer(@Param("customerId") customerId: string) {

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

127  async complete(@Param("id") id: string) {

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

63  @Post()

CRITICAL

Error prone

Unsafe construction of an any type value.
backend/src/bookings/

bookings.controller.ts

53      throw new BadRequestException('Shop information is required for walk-in bookings');

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

32@Controller("bookings")

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

64  @UseGuards(JwtAuthGuard, RolesGuard)

CRITICAL

Error prone

Unsafe argument of type `any` assigned to a parameter of type `string | RegExp | Constructable | Error | undefined`.
backend/src/bookings/

bookings.service.spec.ts

272        new NotFoundException('Booking with ID non-existent-id not found'),

CRITICAL

Error prone

Unsafe assignment of an `any` value.
backend/src/bookings/

bookings.service.spec.ts

117      email: expect.stringMatching(/^walkin_\d+@temp.com$/),

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.service.spec.ts

53    const module: TestingModule = await Test.createTestingModule({

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.service.spec.ts

83    servicesService = module.get<ServicesService>(ServicesService);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.service.spec.ts

79    service = module.get<BookingsService>(BookingsService);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.service.spec.ts

81    usersService = module.get<UsersService>(UsersService);

CRITICAL

Error prone

'ordersService' is assigned a value but never used.
backend/src/bookings/

bookings.service.spec.ts

23  let ordersService: OrdersService;

CRITICAL

Error prone

'bookingRepository' is assigned a value but never used.
backend/src/bookings/

bookings.service.spec.ts

19  let bookingRepository: Repository<Booking>;

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/bookings/

bookings.service.spec.ts

79    service = module.get<BookingsService>(BookingsService);

CRITICAL

Error prone

Unsafe argument of type `any` assigned to a parameter of type `string | RegExp | Constructable | Error | undefined`.
backend/src/bookings/

bookings.service.spec.ts

223        new NotFoundException('Employee not found'),

CRITICAL

Error prone

Unsafe argument of type `any` assigned to a parameter of type `string | RegExp | Constructable | Error | undefined`.
backend/src/bookings/

bookings.service.spec.ts

145        .rejects.toThrow(new NotFoundException('Service not found'));

CRITICAL

Error prone

'employeesService' is assigned a value but never used.
backend/src/bookings/

bookings.service.spec.ts

21  let employeesService: EmployeesService;

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/bookings/

bookings.service.spec.ts

82    employeesService = module.get<EmployeesService>(EmployeesService);

CRITICAL

Error prone

Unsafe construction of an any type value.
backend/src/bookings/

bookings.service.spec.ts

272        new NotFoundException('Booking with ID non-existent-id not found'),

CRITICAL

Error prone

Unsafe member access .createTestingModule on an `error` typed value.
backend/src/bookings/

bookings.service.spec.ts

53    const module: TestingModule = await Test.createTestingModule({

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/bookings/

bookings.service.spec.ts

81    usersService = module.get<UsersService>(UsersService);

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/bookings/

bookings.service.spec.ts

80    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));

CRITICAL

Error prone

Unsafe construction of an any type value.
backend/src/bookings/

bookings.service.spec.ts

214        new NotFoundException('Customer not found'),

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/bookings/

bookings.service.spec.ts

79    service = module.get<BookingsService>(BookingsService);

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/bookings/

bookings.service.spec.ts

82    employeesService = module.get<EmployeesService>(EmployeesService);

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/bookings/

bookings.service.spec.ts

81    usersService = module.get<UsersService>(UsersService);

CRITICAL

Error prone

Unsafe argument of type `any` assigned to a parameter of type `string | RegExp | Constructable | Error | undefined`.
backend/src/bookings/

bookings.service.spec.ts

233        new NotFoundException('Service not found'),