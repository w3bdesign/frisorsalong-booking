MEDIUM

Security

Insecure Modules Libraries

An action sourced from a third-party repository on GitHub is not pinned to a full length commit SHA. Pinning an action to a full length commit SHA is currently the only way to use an action as an immutable release.
.github/workflows/

codecov.yml

29        uses: pnpm/action-setup@v4

MEDIUM

Security

Insecure Modules Libraries

An action sourced from a third-party repository on GitHub is not pinned to a full length commit SHA. Pinning an action to a full length commit SHA is currently the only way to use an action as an immutable release.
.github/workflows/

codecov.yml

54        uses: codecov/codecov-action@v5

MINOR

Code style

Expected: 1; Actual: 5; Style: 1/1/1

README.md

1255. Seed initial data:

MINOR

Code style

Expected: 3; Actual: 4; Style: 1/2/3

README.md

1954. Commit using conventional commits:

MINOR

Code style

Expected: 1; Actual: 2; Style: 1/1/1

README.md

1062. Install dependencies:

MINOR

Code style

Expected: 1; Actual: 4; Style: 1/1/1

README.md

1194. Run database migrations:

MINOR

Code style

Expected: 2; Actual: 3; Style: 1/2/3

README.md

1933. Write tests for your changes

MINOR

Code style

Expected: 1; Actual: 5; Style: 1/1/1

README.md

2075. Create a pull request to `develop`

MINOR

Code style

Expected: 1; Actual: 2; Style: 1/1/1

README.md

1692. Access the services:

MINOR

Code style

Multiple headings with the same content

README.md

211### Backend

MINOR

Code style

Expected: 1; Actual: 2; Style: 1/2/3

README.md

1912. Make your changes following the conventions

MINOR

Code style

Expected: 1; Actual: 6; Style: 1/1/1

README.md

1316. Start the development server:

MINOR

Code style

Multiple headings with the same content

README.md

224### Frontend

MINOR

Code style

Expected: 1; Actual: 3; Style: 1/1/1

README.md

1533. Start the development server:

MINOR

Code style

Expected: 1; Actual: 3; Style: 1/1/1

README.md

1123. Configure environment variables:

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
backend/

README.md

502. Seed initial data:502. Seed initial data:

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
backend/

README.md

451. Run migrations:451. Run migrations:

MINOR

Code style

Expected: 1; Actual: 2; Style: 1/1/1
backend/

README.md

392. Configure environment variables:

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
backend/

README.md

341. Install dependencies:341. Install dependencies:

MINOR

Code style

Expected: 1; Actual: 2; Style: 1/1/1
backend/

README.md

502. Seed initial data:

MINOR

Code style

Emphasis used instead of a heading
backend/docs/

ARCHITECTURE.md

317_Total Estimated Time: Approximately 3 months_

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
backend/docs/

README.md

2051. Check the existing documentation205
2061. Check the existing documentation

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
backend/docs/

README.md

26- Vue 326
27- Vue 3

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
backend/docs/

README.md

19- NestJS (TypeScript)19
20- NestJS (TypeScript)

MINOR

Code style
Quick fix

Expected: 1; Actual: 0; Below
backend/docs/

README.md

25### Frontend25### Frontend

MINOR

Code style
Quick fix

Expected: 1; Actual: 0; Below
backend/docs/

README.md

18### Backend18### Backend

CRITICAL

Error prone

Unsafe return of an `any` typed value.
backend/src/auth/guards/

jwt-auth.guard.spec.ts

97      expect(() => guard.handleRequest(null, null, expiredError)).toThrow(

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/auth/guards/

jwt-auth.guard.ts

19    const token = authHeader.split(' ')[1];

CRITICAL

Error prone

Unsafe member access .split on an `error` typed value.
backend/src/auth/guards/

jwt-auth.guard.ts

19    const token = authHeader.split(' ')[1];

CRITICAL

Error prone

Unsafe member access .message on an `any` value.
backend/src/auth/guards/

jwt-auth.guard.ts

32    console.log('JWT Auth Guard - Error:', err?.message || err);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/auth/strategies/

jwt.strategy.spec.ts

31          provide: getRepositoryToken(User),

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/auth/strategies/

jwt.strategy.ts

19      secretOrKey: configService.get("JWT_SECRET"),

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/bookings/

bookings.controller.ts

37  @Post("walk-in")

CRITICAL

Error prone

Unsafe argument of type `any` assigned to a parameter of type `string | RegExp | Constructable | Error | undefined`.
backend/src/bookings/

bookings.service.spec.ts

272        new NotFoundException('Booking with ID non-existent-id not found'),

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/database/migrations/

1731981975581-InitialMigration.ts

82    await queryRunner.query(`DROP TABLE "services"`);

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

Unsafe return of an error typed value.
backend/src/database/seeds/

create-sample-bookings.seed.spec.ts

72      if (entity === Booking) return mockBookingRepository as Repository<Booking>;

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

MEDIUM

Best practice
Quick fix

This assertion is unnecessary since it does not change the type of the expression.
backend/src/database/seeds/

update-admin-password.seed.spec.ts

29      findOne: jest.fn() as jest.Mock,29      findOne: jest.fn(),

CRITICAL

Error prone

Unsafe member access .save on an `error` typed value.
backend/src/employees/

employees.service.spec.ts

152      expect(userRepository.save).not.toHaveBeenCalled();

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/employees/

employees.service.ts

14    @InjectRepository(Employee)

CRITICAL

Error prone

Unsafe member access .start on an `any` value.
backend/src/employees/

employees.service.ts

126      const [startHour, startMinute] = slot.start.split(':').map(Number);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/employees/

employees.service.ts

72    const employee = await this.employeeRepository.findOne({

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/

main.spec.ts

118    jest.spyOn(DocumentBuilder.prototype, "addBearerAuth").mockReturnThis();

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/orders/

orders.controller.spec.ts

26        this.password = await bcrypt.hash(this.password, salt);

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/orders/

orders.controller.spec.ts

71    service = module.get<OrdersService>(OrdersService);

CRITICAL

Error prone

Unsafe member access .forFeature on an `error` typed value.
backend/src/orders/

orders.module.spec.ts

63      TypeOrmModule.forFeature([Order]),

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/services/

services.controller.ts

13  @ApiResponse({

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/services/

services.controller.ts

34  @Get('employee/:employeeId')

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/services/

services.module.spec.ts

59    Reflect.defineMetadata('imports', [TypeOrmModule.forFeature([Service])], ServicesModule);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/services/

services.service.spec.ts

37    serviceRepository = module.get<Repository<Service>>(getRepositoryToken(Service));

CRITICAL

Error prone

Unsafe member access .find on an `error` typed value.
backend/src/services/

services.service.ts

26    return this.serviceRepository.find();

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/services/

services.service.ts

14    const service = await this.serviceRepository.findOne({

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/shops/guards/

shop-code.guard.spec.ts

25    shopsService = moduleRef.get<ShopsService>(ShopsService);

CRITICAL

Error prone

Unsafe return of an `any` typed value.
backend/src/shops/

shops.service.spec.ts

127      mockRepository.create.mockImplementation((data) => data);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/users/entities/

user.entity.ts

25  @Column({ length: 100 })

CRITICAL

Error prone

'usersRepository' is defined but never used.
backend/src/users/

users.service.ts

10    private readonly usersRepository: Repository<User>,

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/test/

app.e2e-spec.ts

20      .get("/")

MINOR

Code style

Emphasis used instead of a heading
docs/

ARCHITECTURE.md

317_Total Estimated Time: Approximately 3 months_

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
docs/

README.md

19- NestJS (TypeScript)19
20- NestJS (TypeScript)

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
docs/

README.md

26- Vue 326
27- Vue 3

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
docs/

README.md

2051. Check the existing documentation205
2061. Check the existing documentation

MINOR

Code style
Quick fix

Expected: 1; Actual: 0; Below
docs/

README.md

25### Frontend25### Frontend

MINOR

Code style
Quick fix

Expected: 1; Actual: 0; Below
docs/

README.md

18### Backend18### Backend

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
frontend/admin/

README.md

301. Install dependencies:301. Install dependencies:

MINOR

Code style

Expected: 1; Actual: 2; Style: 1/1/1
frontend/admin/

README.md

352. Configure environment variables:

MINOR

Code style

Emphasis used instead of a heading
frontend/admin/docs/

ARCHITECTURE.md

317_Total Estimated Time: Approximately 3 months_

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
frontend/admin/docs/

README.md

2051. Check the existing documentation205
2061. Check the existing documentation

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
frontend/admin/docs/

README.md

26- Vue 326
27- Vue 3

MINOR

Code style
Quick fix

Expected: 1; Actual: 0; Below
frontend/admin/docs/

README.md

25### Frontend25### Frontend

MINOR

Code style
Quick fix

Expected: 1; Actual: 0; Below
frontend/admin/docs/

README.md

18### Backend18### Backend

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
frontend/admin/docs/

README.md

19- NestJS (TypeScript)19
20- NestJS (TypeScript)

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
frontend/admin/src/components/base/__tests__/

Button.spec.ts

92  it('renders as submit button when type is submit', () => {

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
frontend/admin/src/components/base/__tests__/

Card.spec.ts

14    expect(wrapper.text()).toContain('42');

CRITICAL

Error prone

Unsafe member access .logout on an `error` typed value.
frontend/admin/src/

main.ts

25      authStore.logout();

CRITICAL

Error prone

Unsafe member access .isAuthenticated on an `error` typed value.
frontend/admin/src/stores/__tests__/

auth.spec.ts

29      expect(store.isAuthenticated).toBeTruthy();

CRITICAL

Error prone

Unsafe member access .error on an `any` value. `this` is typed as `any`. You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.
frontend/admin/src/stores/

auth.ts

117              this.error = "En feil oppstod under innlogging. Vennligst prøv igjen";

CRITICAL

Error prone

Unsafe assignment of an `any` value.
frontend/admin/src/stores/

employees.ts

101            this.error = error.response?.data?.message || "Kunne ikke opprette ansatt";

CRITICAL

Error prone

Unsafe member access .loading on an `any` value. `this` is typed as `any`. You can try to fix this by turning on the `noImplicitThis` compiler option, or adding a `this` parameter to the function.
frontend/admin/src/stores/

orders.ts

84        this.loading = false;

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
frontend/admin/src/views/__tests__/

DashboardView.spec.ts

110  it("should display refresh button", async () => {

MINOR

Code style

Emphasis used instead of a heading
frontend/customer/docs/

ARCHITECTURE.md

317_Total Estimated Time: Approximately 3 months_

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
frontend/customer/docs/

README.md

19- NestJS (TypeScript)19
20- NestJS (TypeScript)

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
frontend/customer/docs/

README.md

2051. Check the existing documentation205
2061. Check the existing documentation

MINOR

Code style
Quick fix

Expected: 1; Actual: 0; Below
frontend/customer/docs/

README.md

25### Frontend25### Frontend

MINOR

Code style
Quick fix

Lists should be surrounded by blank lines
frontend/customer/docs/

README.md

26- Vue 326
27- Vue 3

MINOR

Code style
Quick fix

Expected: 1; Actual: 0; Below
frontend/customer/docs/

README.md

18### Backend18### Backend

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
frontend/customer/src/components/__tests__/

BookingForm.spec.ts

50    vi.mocked(useServicesStore).mockReturnValue({

CRITICAL

Error prone

Unsafe member access .fn on an `error` typed value.
frontend/customer/src/components/__tests__/

BookingForm.spec.ts

23  useBookingStore: vi.fn(),

CRITICAL

Error prone

Unsafe member access .fn on an `error` typed value.
frontend/customer/src/components/__tests__/

BookingForm.spec.ts

11  push: vi.fn(),

CRITICAL

Error prone

Unsafe member access .mock on an `error` typed value.
frontend/customer/src/components/__tests__/

PaymentForm.spec.ts

12vi.mock('vue-router', () => ({

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
frontend/customer/src/components/__tests__/

WaitingTimeDisplay.spec.ts

21    setActivePinia(createPinia())

CRITICAL

Error prone

Unsafe member access .waitingSlots on an `error` typed value.
frontend/customer/src/stores/__tests__/

display.spec.ts

48    expect(store.waitingSlots[0]).toMatchObject({

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
frontend/customer/src/stores/__tests__/

services.spec.ts

35      global.fetch = vi.fn().mockImplementation(() =>

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
frontend/customer/src/stores/__tests__/

waiting.spec.ts

48  describe('API Methods', () => {

CRITICAL

Error prone

Unsafe argument of type `any` assigned to a parameter of type `string | undefined`.
frontend/customer/src/stores/

booking.ts

54        throw new Error(errorData?.message || 'Failed to create booking')

CRITICAL

Error prone

Unsafe assignment of an error typed value.
frontend/customer/src/views/__tests__/

TVDisplayView.spec.ts

41    startPolling: vi.fn(),