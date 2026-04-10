# Hair Salon Booking System Backend

A robust backend system for managing hair salon bookings, built with NestJS. This system provides comprehensive functionality for managing appointments, employees, services, and user authentication.

## Features

- 🔐 JWT-based Authentication & Authorization
- 👥 User Management
- 📅 Booking System
- 💇‍♀️ Service Management
- 👨‍💼 Employee Management
- 🗄️ PostgreSQL Database with TypeORM
- 📚 Swagger API Documentation

## Tech Stack

- NestJS v10
- TypeORM
- PostgreSQL
- Redis Cache
- Passport JWT
- Class Validator
- Swagger UI

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- PostgreSQL
- Redis

## Installation

1. Install dependencies:

```bash
pnpm install
```

1. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values according to your setup

## Database Setup

1. Run migrations:

```bash
pnpm migration:run
```

1. Seed initial data:

```bash
pnpm seed
```

To remove admin user:

```bash
pnpm remove-admin
```

## Running the Application

```bash
# Development
pnpm start:dev

# Production
pnpm start:prod

# Debug mode
pnpm start:debug
```

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Available Scripts

- `pnpm start` - Start the application
- `pnpm start:dev` - Start in watch mode
- `pnpm build` - Build the application
- `pnpm format` - Format code with Prettier
- `pnpm lint` - Lint code with ESLint
- `pnpm migration:generate` - Generate new migration
- `pnpm migration:run` - Run migrations
- `pnpm migration:revert` - Revert last migration
- `pnpm seed` - Seed initial data
- `pnpm remove-admin` - Remove admin user

## Project Structure

```
src/
├── auth/               # Authentication & authorization
├── bookings/          # Booking management
├── config/            # Configuration modules
├── database/          # Migrations & seeds
├── employees/         # Employee management
├── services/          # Service management
├── users/             # User management
└── main.ts            # Application entry point
```

## Environment Variables

Required environment variables in `.env`:

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=your_database

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=24h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

## License

MIT
