# Code Conventions and Best Practices

## General Principles

- Follow TDD (Test-Driven Development)
- Apply DRY (Don't Repeat Yourself)
- Follow KISS (Keep It Simple, Stupid)
- Apply YAGNI (You Aren't Gonna Need It)
- Follow SOLID Principles:
  - Single Responsibility
  - Open/Closed
  - Liskov Substitution
  - Interface Segregation
  - Dependency Inversion

## TypeScript/JavaScript Conventions

### Naming Conventions

- Use `PascalCase` for:
  - Classes
  - Interfaces
  - Type aliases
  - Enums
- Use `camelCase` for:
  - Variables
  - Functions
  - Methods
  - Properties
  - Parameters
- Use `UPPER_SNAKE_CASE` for constants
- Use descriptive names that reflect the purpose

### File Naming

- Use `kebab-case` for file names
- Suffix files based on their type:
  - `.controller.ts` for controllers
  - `.service.ts` for services
  - `.entity.ts` for database entities
  - `.dto.ts` for Data Transfer Objects
  - `.spec.ts` for test files

### Code Organization

- One class per file
- Group related functionality in modules
- Keep files focused and small
- Use barrel exports (index.ts) for clean imports

## Testing Conventions

### Test Structure

- Follow the AAA pattern:
  - Arrange: Set up test data
  - Act: Execute the code being tested
  - Assert: Verify the results
- Use descriptive test names that explain the scenario
- Group related tests using describe blocks
- Mock external dependencies

### Test Coverage

- Aim for 80%+ code coverage
- Write unit tests for:
  - Services
  - Controllers
  - Guards
  - Pipes
  - Custom decorators
- Include integration tests for:
  - API endpoints
  - Database operations

## API Conventions

### RESTful Endpoints

- Use plural nouns for resources
- Follow HTTP method semantics:
  - GET: Read
  - POST: Create
  - PUT: Full update
  - PATCH: Partial update
  - DELETE: Remove
- Use proper HTTP status codes

### Request/Response

- Use DTOs for request validation
- Follow consistent response format:
  ```typescript
  {
    success: boolean;
    data?: any;
    error?: {
      code: string;
      message: string;
    }
  }
  ```

## Database Conventions

### Entity Design

- Use singular names for entity classes
- Include created_at and updated_at timestamps
- Use proper column types and constraints
- Define explicit relationships

### Migrations

- One migration per change
- Descriptive migration names
- Include both up and down migrations
- Test migrations before deployment

## Documentation

- Use JSDoc for code documentation
- Keep README files up to date
- Document API endpoints using Swagger
- Include setup instructions

## Version Control

- Write clear commit messages
- Use feature branches
- Follow conventional commits format:
  - feat: New feature
  - fix: Bug fix
  - docs: Documentation
  - style: Formatting
  - refactor: Code restructuring
  - test: Adding tests
  - chore: Maintenance

## Error Handling

- Use custom exception filters
- Implement proper logging
- Return appropriate error responses
- Handle async/await properly with try/catch

## Security

- Validate all inputs
- Sanitize data before storage
- Use proper authentication/authorization
- Follow security best practices
- Keep dependencies updated

## Performance

- Use appropriate caching strategies
- Optimize database queries
- Implement pagination for lists
- Monitor and optimize resource usage
