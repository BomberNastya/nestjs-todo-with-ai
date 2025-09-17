
# Yet Another Todo App

A simple todo application built with NestJS, following Test-Driven Development (TDD) principles.

## Features

- CRUD operations for tasks
- Task status management (TODO, IN_PROGRESS, DONE)
- Comprehensive e2e test coverage
- PostgreSQL database with Prisma ORM

## Technology Stack

- **Framework**: NestJS v11.0.1
- **Database**: PostgreSQL (Docker container)
- **ORM**: Prisma
- **Testing**: Jest + Supertest
- **Language**: TypeScript

## Task Model

```typescript
interface Task {
  id: number;
  status: TaskStatus; // TODO | IN_PROGRESS | DONE
  title: string;
  description: string;
  userId: string; // hardcoded for now (no auth)
}
```

## API Endpoints

- `GET /tasks` - Get all tasks for user
- `GET /tasks/:id` - Get specific task
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update existing task
- `DELETE /tasks/:id` - Delete task

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Development Approach

This project follows Test-Driven Development (TDD) principles:
1. Write comprehensive e2e tests first
2. Implement features to make tests pass
3. Refactor while keeping tests green

## License

MIT Licensed
