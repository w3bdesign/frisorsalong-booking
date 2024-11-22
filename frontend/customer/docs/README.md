# Hair Salon Booking System Documentation

## Overview

This is a full-stack booking system for hair salons built using NestJS (backend) and Vue 3 (frontend). The system allows customers to book appointments, employees to manage their schedules, and administrators to oversee all operations.

## Project Structure

```
├── backend/               # NestJS backend application
├── frontend/             # Vue 3 frontend application
├── docs/                 # Project documentation
└── architecture/         # System architecture and planning
```

## Technology Stack

### Backend
- NestJS (TypeScript)
- PostgreSQL (Database)
- Redis (Caching)
- Jest (Testing)
- Swagger (API Documentation)

### Frontend
- Vue 3
- Pinia (State Management)
- Vue Router
- TypeScript

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL
- Redis
- Docker (optional)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the variables with your configuration

4. Run database migrations:
   ```bash
   npm run migration:run
   ```

5. Start the development server:
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`
Swagger documentation will be at `http://localhost:3000/api`

### Running Tests

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Development Guidelines

### Code Style

- Follow the conventions defined in [CONVENTIONS.md](./CONVENTIONS.md)
- Use ESLint and Prettier for code formatting
- Write tests for all new features
- Follow TDD principles

### Git Workflow

1. Create a feature branch from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the conventions

3. Write tests for your changes

4. Commit your changes using conventional commits

5. Create a pull request to `develop`

### Database Changes

1. Create a new migration:
   ```bash
   npm run migration:create -- -n YourMigrationName
   ```

2. Update the migration file with your changes

3. Test the migration:
   ```bash
   npm run migration:run
   ```

4. Test the rollback:
   ```bash
   npm run migration:revert
   ```

## API Documentation

- API documentation is available through Swagger at `/api` when running the backend
- Keep the Swagger documentation up to date when making API changes
- Follow the API conventions defined in [CONVENTIONS.md](./CONVENTIONS.md)

## Testing Strategy

### Unit Tests

- Write unit tests for:
  - Services
  - Controllers
  - Guards
  - Pipes
  - Custom decorators

### Integration Tests

- Write integration tests for:
  - API endpoints
  - Database operations
  - Cache operations

### E2E Tests

- Write end-to-end tests for critical user flows
- Test the integration between frontend and backend

## Deployment

### Development

- Use `npm run start:dev` for local development
- Development server runs at `http://localhost:3000`

### Production

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start:prod
   ```

### Docker

1. Build the Docker image:
   ```bash
   docker build -t hair-salon-booking .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 hair-salon-booking
   ```

## Monitoring and Logging

- Use built-in NestJS logging
- Monitor application performance
- Track error rates and API usage
- Set up alerts for critical issues

## Security

- Follow security best practices
- Keep dependencies updated
- Use proper authentication and authorization
- Validate all inputs
- Implement rate limiting
- Use HTTPS in production

## Support

For any questions or issues:
1. Check the existing documentation
2. Review the codebase and tests
3. Contact the development team

## License

This project is licensed under the terms specified in the LICENSE file at the root of the repository.
