# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Critical Commands
- `npm run seed` - Run database seeds (must run from backend/) in specific order: admin → initial data → bookings → orders
- `npm run seed:admin-password` - Update admin password specifically
- `npm run migration:run` - Run TypeORM migrations (migrations are hardcoded in typeorm.config.ts)
- `npm run lint:strict` - Enforce zero ESLint warnings (used in CI)

## Non-Standard Patterns
- JWT strategy includes extensive console.log debugging (lines 54-82 in jwt.strategy.ts) - intentional for production troubleshooting
- Admin frontend requires `x-shop-code` header for shop-specific operations via ShopCodeGuard
- Admin panel blocks regular "user" role - only "admin" and "employee" roles can access (auth.ts:91-95)
- Custom RequestWithShop interface extends Express Request to include shop property
- Database seeding has strict dependency order: createAdminUser → createInitialData → createSampleBookings → createSampleOrders

## Error Handling
- Frontend uses Norwegian error messages with custom status code mapping (auth.ts:118-129)
- Backend JWT validation returns plain objects, not entities (jwt.strategy.ts:84-90) to avoid serialization issues
- Session expiration triggers automatic logout and redirect to login

## Testing Requirements
- Jest coverage threshold enforced at 80% for branches/functions/lines/statements
- Tests must use `.spec.ts` suffix and be in same directory as source files
- Backend uses module path mapping: `src/(.*)` → `<rootDir>/$1`

## Architecture Constraints
- TypeORM entities use hardcoded migration paths in typeorm.config.ts (lines 12-34)
- All API routes prefixed with `/api` globally
- Frontend admin uses localStorage key `admin_token` specifically (not generic `token`)
- Swagger docs available at `/api-docs` with persistent authorization