# Project Documentation Rules (Non-Obvious Only)

## Architecture Context
- Monorepo with backend/ (NestJS) and frontend/ (admin Vue.js, customer Vue.js) 
- Backend uses TypeORM with PostgreSQL, frontend admin uses Pinia state management
- All API routes prefixed with `/api` - affects URL construction in frontends
- Shop-based multi-tenancy via `x-shop-code` header (not URL-based)

## Authentication Flow
- Admin panel only allows "admin" and "employee" roles (blocks "user" role)
- JWT tokens return plain objects in strategy to avoid serialization issues
- Session management via localStorage with `admin_token` key specifically

## Database Patterns
- Seeding order matters: admin user → services/employees → bookings → orders
- Migrations are explicitly hardcoded paths in typeorm.config.ts (not auto-discovered)
- Entities use pattern `src/**/*.entity{.ts,.js}` from project root

## Error Messages
- Frontend admin uses Norwegian error messages with status code mapping
- Backend JWT strategy includes extensive logging for production troubleshooting
- Session expiration handled automatically in axios interceptors

## Testing Architecture  
- Backend Jest runs from 'src' directory with module mapping
- Tests co-located with source files using .spec.ts suffix
- Coverage threshold enforced at 80% across all metrics

## Development Environment
- Swagger documentation at `/api-docs` with persistent authorization
- CORS enabled with credentials for cross-origin requests
- SSL disabled for development (rejectUnauthorized: false)