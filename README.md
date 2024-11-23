# Hair Salon Booking System

## This is still Work In Progress (WIP)!

## Test Coverage

| Backend                                                                                                                                                                         | Frontend                                                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [![Backend Coverage](https://codecov.io/gh/w3bdesign/frisorsalong-booking/graph/badge.svg?token=YDY1N2NMWA&flag=backend)](https://codecov.io/gh/w3bdesign/frisorsalong-booking) | [![Frontend Coverage](https://codecov.io/gh/w3bdesign/frisorsalong-booking/graph/badge.svg?token=YDY1N2NMWA&flag=frontend-customer)](https://codecov.io/gh/w3bdesign/frisorsalong-booking) |

A full-stack booking system for hair salons built with NestJS (backend) and Vue 3 (frontend). The system provides comprehensive functionality for managing appointments, employees, services, and user authentication.

## Frontend

![Admin Panel](screenshot/admin.png)

## Backend

![API Documentation](screenshot/swagger.png)

---

## Features

- 🔐 Secure JWT-based Authentication & Authorization
- 👥 Role-based User Management (Admin, Employee, Customer)
- 📅 Advanced Booking System
- 💇‍♀️ Service Management
- 👨‍💼 Employee Management & Scheduling
- 🗄️ PostgreSQL Database with TypeORM
- 🚀 Redis Caching for Performance
- 📚 Swagger API Documentation
- 🎨 Modern Admin Dashboard with Vue 3
- 📱 Responsive Design with Tailwind CSS

## System Architecture

The system follows a modular architecture separating frontend, backend, and database layers:

### Backend (NestJS)

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest

### Frontend (Vue 3)

- **Framework**: Vue 3 with TypeScript
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Testing**: Vitest

## Project Structure

```
├── backend/               # NestJS backend application
│   ├── src/
│   │   ├── auth/         # Authentication & authorization
│   │   ├── bookings/     # Booking management
│   │   ├── config/       # Configuration modules
│   │   ├── database/     # Migrations & seeds
│   │   ├── employees/    # Employee management
│   │   ├── services/     # Service management
│   │   └── users/        # User management
│   └── test/             # E2E tests
├── frontend/
│   ├── admin/            # Admin dashboard (Vue 3)
│   └── customer/         # Customer portal (Vue 3)
└── docs/                 # Project documentation
```

## Prerequisites

- Node.js (v20 or higher)
- pnpm
- PostgreSQL
- Docker

## Getting Started

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:

```bash
cp .env.example .env
# Update the values in .env according to your setup
```

4. Run database migrations:

```bash
pnpm migration:run
```

5. Seed initial data:

```bash
pnpm seed
```

6. Start the development server:

```bash
pnpm start:dev
```

The API will be available at `http://localhost:3000` with Swagger documentation at `http://localhost:3000/api`

### Frontend Setup

1. Navigate to the admin frontend directory:

```bash
cd frontend/admin
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

The admin dashboard will be available at `http://localhost:5173`

### Using Docker

1. Build and run the Docker containers:

```bash
docker-compose up --build
```

2. Access the services:

- Backend API: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3001`

## Development Guidelines

### Code Style

- Follow the conventions defined in [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
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

4. Commit using conventional commits:

```
feat: add new feature
fix: resolve bug
docs: update documentation
style: formatting changes
refactor: code restructuring
test: add tests
chore: maintenance
```

5. Create a pull request to `develop`

## Testing

### Backend

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

### Frontend

```bash
# Unit tests
pnpm test

# Component tests
pnpm test:unit
```

## API Documentation

The API documentation is available through Swagger UI when running the backend:

```
http://localhost:3000/api
```

## Environment Variables

### Backend (.env)

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
CACHE_TTL=300
```

## Security

- All endpoints are protected with JWT authentication
- Role-based access control (RBAC) implementation
- Input validation using class-validator
- Rate limiting for API endpoints
- CORS configuration
- Secure password hashing with bcrypt
- Environment variable protection
- SQL injection prevention through TypeORM

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Architecture Documentation

For detailed information about the system architecture, please refer to [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
