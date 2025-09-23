# Project Debug Rules (Non-Obvious Only)

## Debugging Environment
- JWT strategy logs extensively to console (lines 54-82) - intentional production debugging
- Database connection logs only in development (NODE_ENV=development)
- Swagger docs at `/api-docs` with persistent authorization for API testing

## Critical Debugging Commands
- `npm run seed` from backend/ directory to reset test data
- `npm run test:debug` for backend debugging with --inspect-brk
- `npm run start:debug` runs NestJS with debug flag and watch mode

## Database Debugging
- TypeORM logging controlled by NODE_ENV environment variable
- SSL settings affect connection troubleshooting (rejectUnauthorized: false)
- Migration files hardcoded - check typeorm.config.ts lines 12-34 for exact paths

## Frontend Debugging
- Admin panel session expiration triggers automatic logout (main.ts:19-30)
- Norwegian error messages may hide underlying API errors (auth.ts:118-129)
- `admin_token` localStorage key specifically used (not generic `token`)

## Testing Debug
- Jest runs from 'src' rootDir - affects module resolution
- Coverage reports go to '../coverage' from src directory
- Test files must be co-located with source files (.spec.ts suffix)