All issues

2433
Code patterns
@typescript eslint: No unsafe call

978
@typescript eslint: No unsafe member access

911
@typescript eslint: No unsafe assignment

342
No unused vars

55
@typescript eslint: No unsafe return

53
@typescript eslint: Unbound method

33
@typescript eslint: No unsafe argument

30
@typescript eslint: No unused vars

15
@typescript eslint: No floating promises

7
@typescript eslint: No var requires

3
react-insecure-request

2
Others

4
CRITICAL

Error prone

Unsafe member access .length on an `error` typed value.
backend/src/employees/dto/

create-employee.dto.spec.ts

17    expect(errors.length).toBe(0);

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/employees/

employees.controller.spec.ts

25        const salt = await bcrypt.genSalt();

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/employees/

employees.controller.spec.ts

81    controller = module.get<EmployeesController>(EmployeesController);

CRITICAL

Error prone

Avoid referencing unbound methods which may cause unintentional scoping of `this`. If your function does not access `this`, you can annotate it with `this: void`, or consider using an arrow function instead.
backend/src/employees/

employees.controller.spec.ts

180      expect(service.findByUserId).toHaveBeenCalledWith(employeeUser.id);

CRITICAL

Error prone

Unsafe return of an error typed value.
backend/src/employees/

employees.controller.spec.ts

30      return bcrypt.compare(password, this.password);

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/employees/

employees.controller.ts

51  @Post(':id/reset-password')

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/employees/

employees.service.spec.ts

80    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/employees/

employees.service.spec.ts

68          provide: getRepositoryToken(Booking),

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

78    service = module.get<EmployeesService>(EmployeesService);

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

Unsafe member access .prototype on an `error` typed value.
backend/src/

main.spec.ts

119    jest.spyOn(DocumentBuilder.prototype, "build").mockReturnThis();

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/

main.spec.ts

118    jest.spyOn(DocumentBuilder.prototype, "addBearerAuth").mockReturnThis();

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/orders/

orders.controller.spec.ts

70    controller = module.get<OrdersController>(OrdersController);

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

Unsafe assignment of an error typed value.
backend/src/orders/

orders.service.spec.ts

87    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/orders/

orders.service.ts

20    const booking = await this.bookingRepository.findOne({

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

services.controller.ts

41  async findByEmployee(@Param('employeeId') employeeId: string): Promise<Service[]> {

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/services/

services.module.spec.ts

59    Reflect.defineMetadata('imports', [TypeOrmModule.forFeature([Service])], ServicesModule);

CRITICAL

Error prone

Unsafe member access .get on an `error` typed value.
backend/src/services/

services.service.spec.ts

37    serviceRepository = module.get<Repository<Service>>(getRepositoryToken(Service));

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/services/

services.service.spec.ts

37    serviceRepository = module.get<Repository<Service>>(getRepositoryToken(Service));

CRITICAL

Error prone

Unsafe assignment of an error typed value.
backend/src/services/

services.service.spec.ts

26    const module: TestingModule = await Test.createTestingModule({

CRITICAL

Error prone

Unsafe call of an `error` type typed value.
backend/src/services/

services.service.ts

6@Injectable()

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
