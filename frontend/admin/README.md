# Hair Salon Booking System Frontend (Admin Dashboard)

A modern admin dashboard for managing hair salon bookings, built with Vue 3. This system provides comprehensive functionality for managing appointments, employees, services, and user authentication.

## Features

- 🔐 JWT-based Authentication & Authorization
- 👥 User Management
- 📅 Booking System
- 💇‍♀️ Service Management
- 👨‍💼 Employee Management
- 📚 API Documentation

## Tech Stack

- Vue 3
- TypeScript
- Pinia
- Vue Router
- Tailwind CSS
- Axios

## Prerequisites

- Node.js (v18 or higher)
- pnpm

## Installation

1. Install dependencies:
```bash
pnpm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values according to your setup

## Running the Application

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm preview
```

## Testing

```bash
# Unit tests
pnpm test

# Component tests
pnpm test:unit
```

## Available Scripts

- `pnpm dev` - Start the development server
- `pnpm build` - Build the application
- `pnpm preview` - Preview the production build
- `pnpm test` - Run unit tests
- `pnpm test:unit` - Run component tests
- `pnpm lint` - Lint code with ESLint
- `pnpm format` - Format code with Prettier

## Project Structure

```
src/
├── assets/             # Static assets
├── components/         # Vue components
├── router/             # Vue Router configuration
├── stores/             # Pinia stores
├── views/              # Vue views
├── App.vue             # Root component
├── main.ts             # Application entry point
└── style.css           # Global styles
```

## Environment Variables

Required environment variables in `.env`:

```
# API
VITE_API_URL=http://localhost:3000
```

## API Documentation

The API documentation is available through Swagger UI when running the backend:

```
http://localhost:3000/api
```

## License

MIT
