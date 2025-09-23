# Project Architecture Rules (Non-Obvious Only)

## Multi-Tenant Design
- Shop isolation via `x-shop-code` header validation (ShopCodeGuard)
- Request object extended with shop property via custom RequestWithShop interface
- Shop-based access control rather than URL-based multi-tenancy

## Authentication Architecture
- JWT strategy returns plain objects to prevent circular serialization issues
- Role-based access: admin/employee for admin panel, user role blocked
- Session expiration handled via axios interceptors, not middleware

## Database Architecture Constraints
- Seeding has circular dependencies - strict execution order required
- TypeORM migrations explicitly listed (not auto-discovered) in typeorm.config.ts
- All environments use SSL with rejectUnauthorized: false for compatibility

## Frontend Architecture
- Admin frontend: Vue 3 + Pinia + Tailwind with role-based access
- Customer frontend: Vue 3 + Pinia for booking display
- Both frontends consume same backend API with different authentication flows

## Error Handling Strategy
- Localized Norwegian error messages in admin frontend
- Backend includes extensive debug logging in JWT strategy (production-ready)
- HTTP status precedence: client errors use localized messages, server errors prefer backend messages

## Testing Architecture
- Jest configured with rootDir as 'src' affects all path resolution
- Tests co-located with source files for better maintainability
- Coverage enforced at 80% threshold across all metrics

## Deployment Constraints
- Docker Compose includes PostgreSQL + Redis + backend + frontend services
- Global API prefix '/api' affects all frontend API calls
- Environment-specific database logging and SSL configurations