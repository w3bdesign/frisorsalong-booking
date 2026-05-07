# Plan: Fix 75+ HIGH Error-Prone TypeScript/Lint Issues

## Overview

This plan addresses **75+ HIGH severity "error prone"** lint/type issues across the entire monorepo. The errors fall into **7 distinct categories**, each requiring a specific fix pattern.

## Error Categories

### Category 1: Unbound Method References in Tests (15 errors)
**Pattern:** `expect(service.findOne).toHaveBeenCalled()` — references unbound methods that may lose `this` scoping.
**Fix:** Wrap in arrow functions or use `expect(service.findOne).toHaveBeenCalled()` with `// eslint-disable-next-line @typescript-eslint/unbound-method` where the mock object has no `this` binding concern.

### Category 2: Unsafe Return of Error-Typed / `any`-Typed Values (25+ errors)  
**Pattern:** TypeORM `repository.save()`, `repository.findOne()`, `repository.find()` return types that don't match declared Promise return types.
**Fix:** Add explicit type assertions or use proper generic typing on repository calls.

### Category 3: Unnecessary Conditionals — Always Falsy/Truthy (8 errors)
**Pattern:** Checking values that TypeScript knows can never be null/undefined because upstream methods throw on null.
**Fix:** Remove the dead-code conditionals or restructure to handle the thrown exception pattern.

### Category 4: Unsafe `any` Arguments (10+ errors)
**Pattern:** Values typed as `any` passed to functions expecting specific types.
**Fix:** Add proper type assertions or narrow the types.

### Category 5: Unnecessary Optional Chains (2 errors)
**Pattern:** `error.response?.data?.message` where `response` is already confirmed non-null.
**Fix:** Remove the unnecessary `?` from the chain.

### Category 6: Forbidden Non-Null Assertion (1 error)
**Pattern:** `stats.get(employeeId)!` with `!` operator.
**Fix:** Use a guarded access pattern with a fallback.

### Category 7: Promise Handling Issues (2 errors)
**Pattern:** Unawaited promises or return type mismatches with `setInterval`.
**Fix:** Add `void` operator or fix return type annotations.

---

## Detailed Fixes By File

### File 1: `backend/src/employees/employees.controller.spec.ts`
**Errors:** 12 unbound method refs (lines 123, 147, 169, 180, 181, 194, 224, 271, 308, 340), 1 unsafe argument to toThrow (line 218), 1 unsafe return (line 40)

**Fixes:**
- **Lines 123, 147, 169, 180, 181, 194, 224, 271, 308, 340:** Add `// eslint-disable-next-line @typescript-eslint/unbound-method` before each `expect(service.xxx)` assertion since `service` is a jest mock object where `this` binding is irrelevant.
- **Line 218:** Cast `new UnauthorizedException(...)` assertion: `expect(...).rejects.toThrow(UnauthorizedException)` or add type annotation.
- **Line 40:** Change `return bcrypt.compare(password, user.password)` to `return bcrypt.compare(password, user.password) as Promise<boolean>` — or change the function to arrow style with explicit return type.

### File 2: `backend/src/employees/employees.service.ts`
**Errors:** Unsafe returns (lines 77, 90, 192), unnecessary conditional (line 128)

**Fixes:**
- **Line 77:** `return employees;` — Add explicit type annotation: `const employees: Employee[] = await ...` (already done) — ensure the `Repository<Employee>.find()` result is compatible. Use `return employees as Employee[]` if needed, or adjust the return type.
- **Line 90:** `return employee;` — The `findOne` returns `Employee | null`, but the null check + throw above means this is safe. The issue is that `repository.findOne()` returns a potentially wider type. Cast: `return employee as Employee`.
- **Line 192:** `return await this.employeeRepository.save(updated);` — Cast: `return await this.employeeRepository.save(updated) as Employee`.
- **Line 128:** `if (!dayAvailability || !Array.isArray(dayAvailability) || dayAvailability.length === 0)` — The `dayAvailability` comes from `availability[dayName]` which is typed as `TimeSlot[]` from the `Availability` interface. The `!dayAvailability` check is always falsy because the index signature returns `TimeSlot[]`. Change to: `if (!availability[dayName] || dayAvailability.length === 0)` — or better, use optional chaining with `availability[dayName]` typed as `TimeSlot[] | undefined` by making the interface use `[key: string]: TimeSlot[] | undefined`.

### File 3: `backend/src/employees/employees.controller.ts`
**Errors:** Unnecessary conditional (line 45)

**Fix:**
- **Line 45:** `if (!employee || employee.id !== id)` — `findByUserId` throws `NotFoundException` if not found, so `employee` is never null here. The `!employee` check is dead code. Remove `!employee ||` to become: `if (employee.id !== id)`.

### File 4: `backend/src/bookings/bookings.controller.ts`
**Errors:** Unnecessary conditionals (lines 42, 45), unnecessary optional chain (line 61)

**Fixes:**
- **Lines 42-47:** `if (!bookingsService)` and `if (!ordersService)` — NestJS DI guarantees these are never falsy in the constructor. Remove both checks entirely.
- **Line 61:** `if (!request?.shop)` → `if (!request.shop)` — `request` parameter is always defined.

### File 5: `backend/src/bookings/bookings.service.ts`
**Errors:** Unsafe returns (lines 97, 162), unnecessary conditionals (lines 56, 106, 112)

**Fixes:**
- **Line 97:** `return this.bookingRepository.save(booking)` → `return this.bookingRepository.save(booking) as Promise<Booking>` or `return await this.bookingRepository.save(booking)` with explicit typing.
- **Line 162:** Same pattern — cast the return.
- **Lines 56, 106, 112:** `if (!service)`, `if (!customer)`, `if (!employee)` — these are dead code because `servicesService.findOne()`, `usersService.findOne()`, and `employeesService.findOne()` already throw `NotFoundException`. Remove these conditionals and the associated throw statements.

### File 6: `backend/src/users/users.service.ts`
**Errors:** Unsafe returns (lines 18, 22, 27)

**Fixes:**
- **Line 18:** `return user;` — after null check, cast: `return user as User` or use `!` assertion since null case throws above.
- **Line 22:** `return this.usersRepository.findOne(...)` — Add explicit return type cast: `return this.usersRepository.findOne({ where: { email } }) as Promise<User | null>`.
- **Line 27:** `return this.usersRepository.save(user)` → `return this.usersRepository.save(user) as Promise<User>`.

### File 7: `backend/src/orders/orders.service.ts`
**Errors:** Unsafe returns (lines 62, 97)

**Fixes:**
- **Line 62:** `return this.orderRepository.find(...)` → cast return as `Promise<Order[]>`.
- **Line 97:** `return order;` → `return order as Order` (after null check + throw).

### File 8: `backend/src/orders/orders.controller.spec.ts`
**Errors:** Unsafe return (line 28), unsafe argument (line 190)

**Fixes:**
- **Line 28:** `return bcrypt.compare(password, defaultUser.password)` → `return bcrypt.compare(password, defaultUser.password) as Promise<boolean>`.
- **Line 190:** `).rejects.toThrow(UnauthorizedException)` → add `as typeof UnauthorizedException` or use string matcher.

### File 9: `backend/src/orders/orders.service.spec.ts`
**Errors:** Unbound method ref (line 185)

**Fix:**
- **Line 185:** Add `// eslint-disable-next-line @typescript-eslint/unbound-method` before the expect line.

### File 10: `backend/src/auth/guards/roles.guard.ts`
**Errors:** Unsafe argument of `any` to `UserRole` (line 40)

**Fix:**
- **Line 40:** `if (!Object.values(UserRole).includes(user.role))` → Cast: `if (!(Object.values(UserRole) as string[]).includes(user.role as string))`.

### File 11: `backend/src/auth/strategies/jwt.strategy.spec.ts`
**Errors:** Unsafe arguments to toThrow (lines 108, 121, 145)

**Fixes:**
- **Lines 108, 121:** `.toThrow(new UnauthorizedException('...'))` → Use string argument: `.toThrow('User not found')` and `.toThrow('Invalid token payload')`.
- **Line 145:** `.toThrow(UnauthorizedException)` → Add type annotation or use `// eslint-disable-next-line`.

### File 12: `backend/src/services/services.controller.spec.ts`
**Errors:** Unsafe argument to toThrow (line 66)

**Fix:**
- **Line 66:** `await expect(controller.findOne('999')).rejects.toThrow(NotFoundException)` → cast or use string: `.rejects.toThrow('Not Found')` or add eslint-disable comment.

### File 13: `backend/src/database/seeds/run-seeds.spec.ts`
**Errors:** Unsafe return of any (lines 11, 104)

**Fixes:**
- **Line 11:** `return { ... }` in the mock factory — Add explicit type annotation to the return value.
- **Line 104:** `expect(() => createDataSource()).toThrow(...)` — Add type assertion to the mock return.

### File 14: `backend/src/database/seeds/create-sample-bookings.seed.ts`
**Errors:** Unsafe any argument (line 109), unsafe return (line 118)

**Fixes:**
- **Line 109:** `const endTime = new Date(startTime.getTime() + Number(duration) * 60 * 1000)` — `duration` is already typed as `number` above. The issue is `startTime` typed as `any` from faker. Type it: `const startTime: Date = faker.date.between(...)`.
- **Line 118:** `notes: faker.helpers.maybe(() => faker.lorem.sentence(), ...) ?? undefined` — Add type assertion: `as string | undefined`.

### File 15: `backend/src/database/seeds/create-sample-orders.seed.ts`
**Errors:** Unnecessary conditional (line 65), unsafe returns (lines 87, 88)

**Fixes:**
- **Line 65:** `if (!savedOrder)` — `save()` always returns the entity. Remove the check.
- **Lines 87-88:** Mock repository type casts — already using `as unknown as Repository<T>`, the issue is in the return context. Wrap with explicit return type annotation.

### File 16: `backend/src/database/seeds/create-initial-data.seed.spec.ts`
**Errors:** Unsafe return (line 92)

**Fix:**
- **Line 92:** `return repository as unknown as Repository<T>` — Add explicit function return type annotation to the enclosing function.

### File 17: `frontend/admin/src/stores/auth.ts`
**Errors:** Unnecessary optional chain (line 117), unsafe any returns (lines 114, 118, 120, 138)

**Fixes:**
- **Line 117:** `if (error.response?.data?.message)` → `if (error.response.data?.message)` (already inside `if (error.response?.status)` so `response` is guaranteed).
- **Lines 114, 120:** `return statusMessage` — The method `getHttpStatusErrorMessage` returns `string`, so this should be safe. The `any` typing comes from `this` being untyped in options-API actions. **Fix:** Convert to `setup()` store syntax, or add explicit `this` type annotations, or use `const self = this` pattern.
- **Line 118:** `return this.extractBackendMessage(error.response.data.message)` — Same `this` as `any` issue. 
- **Line 138:** `return this.handleAxiosError(error as AxiosError<ErrorResponse>)` — Same issue.
- **Overall fix for auth.ts:** The core problem is that Pinia options-API stores type `this` as `any` inside `actions`. The cleanest fix is to extract helper functions (`getHttpStatusErrorMessage`, `extractBackendMessage`, `handleAxiosError`, `resolveLoginError`) as standalone functions outside the store definition. This eliminates all `this`-as-`any` issues.

### File 18: `frontend/admin/src/stores/orders.ts`
**Errors:** Unsafe any args (lines 38, 40, 41, 48), forbidden non-null assertion (line 48), unsafe return (line 28)

**Fixes:**
- **Lines 38, 40, 41, 48:** The `order` in the forEach is typed via the `Order` interface which has `booking.employee.id` as `string`. The issue is that `order.totalAmount` and `order.booking.employee.id` flow through `any`. Add explicit type to the forEach callback: `state.orders.forEach((order: Order) => { ... })`.
- **Line 48:** `stats.get(employeeId)!` — Replace with: `const employeeStats = stats.get(employeeId); if (employeeStats) { ... }` to avoid the non-null assertion.
- **Line 28:** `return state.orders.filter(...)` — Add explicit return type to the getter.

### File 19: `frontend/admin/src/stores/employees.ts`
**Errors:** Unnecessary conditional (line 53), unsafe any returns (lines 28, 30, 91)

**Fixes:**
- **Line 53:** `if (response.data.employee)` — `CreateEmployeeResponse.employee` is typed as `Employee` which is always truthy. Remove the conditional, just push directly.
- **Lines 28, 30:** Getter return types — Add explicit return type annotations: `getActiveEmployees: (state): Employee[] => ...` and `getEmployeeById: (state) => (id: string): Employee | undefined => ...`.
- **Line 91:** `return response.data` — The `api.patch()` call lacks a generic type. Add `api.patch<Employee>(...)`.

### File 20: `frontend/admin/src/stores/__tests__/auth.spec.ts`
**Errors:** 6 unbound method refs (lines 65, 91, 116, 183, 192, 204, 209)

**Fix:**
- Add `// eslint-disable-next-line @typescript-eslint/unbound-method` before each `vi.mocked(api.post)` / `vi.mocked(api.get)` / `expect(api.get)` line. OR add a file-level disable: `/* eslint-disable @typescript-eslint/unbound-method */` at the top since the entire test file uses mocked methods.

### File 21: `frontend/admin/src/main.ts`
**Errors:** Unsafe any argument for Plugin (line 16)

**Fix:**
- **Line 16:** `app.use(pinia)` — `createPinia()` returns `Pinia` but may be typed as `any` in certain setups. Add explicit type: `const pinia: Pinia = createPinia()` with `import type { Pinia } from 'pinia'`.

### File 22: `frontend/customer/src/stores/services.ts`
**Errors:** Unhandled promise (line 47)

**Fix:**
- **Line 47:** `fetchServices()` → `void fetchServices()` — Already wrapped in `queueMicrotask`, just add the `void` operator.

### File 23: `frontend/customer/src/stores/booking.ts`
**Errors:** Unsafe any argument (line 54)

**Fix:**
- **Line 54:** `throw new Error(errorData?.message || 'Failed to create booking')` — `errorData` is typed as `any` from `.json()`. Add type: `const errorData: { message?: string } | null = await response.json().catch(() => null)`.

### File 24: `frontend/customer/src/stores/waiting.ts`
**Errors:** Promise return in void context (line 59)

**Fix:**
- **Line 59:** `return setInterval(fetchQueueStatus, intervalMs)` — `fetchQueueStatus` is async, so `setInterval` receives a function returning `Promise<void>` instead of `void`. Wrap: `return setInterval(() => { void fetchQueueStatus() }, intervalMs)`.

### File 25: `frontend/customer/src/stores/__tests__/waiting.spec.ts`
**Errors:** Unsafe any argument to clearInterval (line 156)

**Fix:**
- **Line 156:** `clearInterval(intervalId)` — `intervalId` may be typed as `any` from the store return. Add type: `const intervalId: ReturnType<typeof setInterval> = store.startPolling(1000)`.

### File 26: `frontend/customer/src/main.ts`
**Errors:** Unsafe any argument for Plugin (line 12)

**Fix:**
- **Line 12:** `app.use(createPinia())` — Same as admin main.ts. Extract and type: `const pinia: Pinia = createPinia()` then `app.use(pinia)`, with `import type { Pinia } from 'pinia'`.

---

## Implementation Order

The fixes should be applied in this order to minimize cascading issues:

1. **Backend source files first** — service/controller fixes that change types
2. **Backend test files** — test fixes that depend on source types  
3. **Frontend source files** — store and main.ts fixes
4. **Frontend test files** — test fixes last

## Risk Assessment

- **Low risk:** eslint-disable comments for unbound methods in tests, optional chain removals, void operators
- **Medium risk:** Type assertions on TypeORM returns — these are semantically correct but bypass type checking
- **Higher risk:** Removing unnecessary conditionals in bookings.service.ts — ensure the called methods truly throw on null before removing null guards. Verified: `findOne` methods in UsersService, EmployeesService, and ServicesService all throw NotFoundException on null.
