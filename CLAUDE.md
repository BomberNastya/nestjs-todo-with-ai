# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS-based todo application following Test-Driven Development (TDD) principles. The app provides CRUD operations for tasks with a simple data model. Currently in development phase with PostgreSQL database integration via Prisma ORM.

## Common Development Commands

### Development
- `npm run start:dev` - Start development server with watch mode
- `npm run start` - Start server (production mode)
- `npm run start:debug` - Start server with debug mode
- `npm run start:prod` - Start production server from dist

### Build
- `npm run build` - Build the application using Nest CLI

### Testing
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:cov` - Run tests with coverage
- `npm run test:debug` - Run tests in debug mode
- `npm run test:e2e` - Run end-to-end tests
- Tests are located in `src/` directory as `.spec.ts` files and `test/` directory for e2e tests

### Code Quality
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- Always run linting before committing changes

## Architecture & Key Information

### Project Structure
- `src/main.ts` - Application entry point, bootstraps NestJS app on port 3000
- `src/app.module.ts` - Root application module
- `src/app.controller.ts` - Basic controller with GET endpoint returning "Hello World!"
- `src/app.service.ts` - Basic service providing "Hello World!" message
- `test/` - End-to-end test files

### Technology Stack
- **Framework**: NestJS v11.0.1
- **Runtime**: Node.js with TypeScript v5.7.3
- **Database**: PostgreSQL (Docker container) + Prisma ORM
- **Configuration**: @nestjs/config for environment management
- **Database Client**: pg (PostgreSQL driver)
- **Database Visualization**: TablePlus
- **Testing**: Jest v30.0.0 for unit tests, Supertest for e2e testing
- **Code Quality**: ESLint v9.18.0, Prettier v3.4.2
- **Build**: TypeScript compiler with Nest CLI

### TypeScript Configuration
- Target: ES2023
- Module: NodeNext with module resolution
- Decorators enabled (experimental and emit metadata)
- Strict null checks enabled
- Source maps enabled
- Output directory: `./dist`

### Current State
Todo application in development following TDD approach:
- Task entity with properties: id, status (enum), title, description, userId
- PostgreSQL database with Prisma ORM integration
- Comprehensive e2e tests for Task CRUD operations
- Hardcoded userId approach (no authentication yet)
- Docker container setup for PostgreSQL database

### Task Data Model
```typescript
interface Task {
  id: number;
  status: TaskStatus; // enum: TODO, IN_PROGRESS, DONE
  title: string;
  description: string;
  userId: string; // hardcoded for now
}
```

### Development Guidelines
- Follow Test-Driven Development (TDD) principles
- Write e2e tests before implementation
- Follow NestJS conventions and patterns
- Use Prisma for database operations
- Use TypeScript decorators for controllers, services, and modules
- Implement proper dependency injection and validation
- Use ESLint and Prettier for code consistency

### API Endpoints (Planned)
- `GET /tasks` - Get all tasks for user
- `GET /tasks/:id` - Get specific task
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update existing task
- `DELETE /tasks/:id` - Delete task

### Database Commands
- `npx prisma generate` - Generate Prisma client
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma Studio (database GUI)

## Next Steps
1. Set up PostgreSQL Docker container
2. Configure Prisma schema and database connection
3. Write comprehensive e2e tests for all CRUD operations
4. Implement Task module, controller, and service
5. Add proper validation and error handling
6. Consider adding API documentation with Swagger