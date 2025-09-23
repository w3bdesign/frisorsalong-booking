# Project Coding Rules (Non-Obvious Only)

## Database Seeding
- Seeds must run in exact order: admin → initial data → bookings → orders (circular dependencies)
- Always use `npm run seed` from backend/ directory, NOT root
- Seed files use createDataSource() factory pattern instead of standard TypeORM imports

## Authentication Patterns
- JWT strategy deliberately returns plain objects (lines 84-90) to prevent serialization issues
- ShopCodeGuard requires `x-shop-code` header - adds shop property to Request object via custom interface
- Admin token stored as `admin_token` in localStorage (not generic `token`)

## Error Handling
- Norwegian error messages hardcoded in frontend auth store (lines 118-129)
- AxiosError handling has specific precedence: status codes → backend messages → fallback messages
- Session expiration auto-triggers logout in axios interceptors

## Testing Constraints  
- Jest rootDir set to 'src' - affects all module paths and coverage calculation
- Tests must be `.spec.ts` suffix in same directory as source files
- Module mapping `src/(.*)` assumes tests run from backend/src/ context

## TypeORM Specifics
- Migration paths hardcoded in typeorm.config.ts lines 12-34 (not auto-discovered)
- Entities pattern: `src/**/*.entity{.ts,.js}` from project root
- SSL rejectUnauthorized: false set for all environments