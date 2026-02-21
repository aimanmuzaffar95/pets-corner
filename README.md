# Pets Corner API

NestJS API scaffold for the Pets Corner backend.

Current stage:
- Nest app is running with a starter endpoint.
- Dockerized development and production stacks are configured.
- Supporting services: PostgreSQL and pgAdmin.
- TypeORM is configured with migration-first workflow.
- Initial `Pet` persistence foundation is in place (`pets` + `species` tables).
- JWT-based user authentication is available (`users` + `auth` modules).

## Development model

This project is primarily developed by AI coding agents, with minimal direct human coding.

## Tech stack

- Node.js + NestJS (TypeScript)
- PostgreSQL 16 (`postgres:16-alpine`)
- pgAdmin 4 (`dpage/pgadmin4:8`)
- Docker Compose (separate dev/prod files)

## Current API

- `GET /pets`
- `GET /pets/species`
- `GET /pets/:id`
- `POST /pets`
- `PATCH /pets/:id`
- `DELETE /pets/:id`
- `POST /auth/register`
- `POST /auth/login`
- `GET /users/me` (JWT bearer required)

## Response contract (breaking change)

All non-`204` endpoints now return a standardized envelope.

Success response shape:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "timestamp": "2026-02-21T15:04:05.000Z",
    "path": "/auth/login"
  }
}
```

Error response shape:

```json
{
  "success": false,
  "error": {
    "type": "https://api.petscorner.dev/problems/validation",
    "code": "VALIDATION_ERROR",
    "title": "Validation failed",
    "status": 400,
    "detail": "One or more fields are invalid",
    "errors": [
      {
        "field": "email",
        "message": "email must be an email"
      }
    ],
    "timestamp": "2026-02-21T15:04:05.000Z",
    "path": "/auth/register"
  }
}
```

`204 No Content` endpoints (e.g. `DELETE /pets/:id`) still return an empty body.

## Project structure

- `docker-compose.dev.yml`: development stack (API, Postgres, pgAdmin)
- `docker-compose.prod.yml`: production stack (API, Postgres, optional pgAdmin profile)
- `Dockerfile`: multi-stage image (`development` + `production`)
- `.env.development`: runtime env for dev compose
- `.env.production`: runtime env for prod compose
- `src/pet`: `PetModule` + `PetEntity` + `SpeciesEntity`
- `src/users`: user entity, service, and profile endpoint
- `src/auth`: auth controller/service, JWT strategy, and DTOs
- `src/database/migrations`: TypeORM SQL migrations
- `src/database/typeorm.datasource.ts`: TypeORM CLI datasource

## Prerequisites

- Node.js 22+
- npm
- Docker Desktop (or Docker Engine + Compose plugin)

## Run locally without Docker

```bash
npm install
npm run start:dev
```

App runs on `http://localhost:3000`.

## Docker usage

### 1) Environment files

If needed, regenerate local env files from examples:

```bash
cp .env.development.example .env.development
cp .env.production.example .env.production
```

Before production usage, update sensitive values in `.env.production`:
- `POSTGRES_PASSWORD`
- `PGADMIN_DEFAULT_PASSWORD`

Required DB env vars for non-test runtime:
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`

Required auth env vars:
- `JWT_ACCESS_TOKEN_SECRET`
- `JWT_ACCESS_TOKEN_EXPIRES_IN` (default `24h`)
- `BCRYPT_SALT_ROUNDS` (default `12`)

### 2) Development stack

```bash
docker compose -f docker-compose.dev.yml up --build
```

Services:
- API: `http://localhost:3000`
- Postgres: `localhost:5432`
- pgAdmin: `http://localhost:5050`

Stop:

```bash
docker compose -f docker-compose.dev.yml down
```

### 3) Production stack

Run app + Postgres:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Run app + Postgres + pgAdmin:

```bash
docker compose -f docker-compose.prod.yml --profile admin up --build -d
```

Stop:

```bash
docker compose -f docker-compose.prod.yml --profile admin down
```

## Useful commands

```bash
npm run build
npm run test
npm run test:e2e
npm run lint
npm run migration:run
npm run migration:revert
```

## Migrations

Generate a migration from entity changes:

```bash
npm run migration:generate
```

Create an empty migration:

```bash
npm run migration:create
```

Run and rollback:

```bash
npm run migration:run
npm run migration:revert
```

Current DB schema baseline:
- `species` lookup table (`DOG`, `CAT`, `BIRD`, `OTHER`)
- `pets` table with FK to `species` and soft-delete column (`deleted_at`)
- `users` table for local auth accounts with unique email

## Auth payloads

`POST /auth/register` request:

```json
{
  "email": "user@example.com",
  "password": "Strong!123",
  "firstName": "Aiman",
  "lastName": "Muzaffar",
  "bio": "Optional text"
}
```

`POST /auth/login` request:

```json
{
  "email": "user@example.com",
  "password": "Strong!123"
}
```

`POST /auth/register` success `data.user` includes timestamps:

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "expiresIn": "24h",
    "user": {
      "id": "<uuid>",
      "email": "user@example.com",
      "firstName": "Aiman",
      "lastName": "Muzaffar",
      "bio": null,
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z"
    }
  },
  "meta": {
    "timestamp": "2026-02-21T15:04:05.000Z",
    "path": "/auth/login"
  }
}
```

`POST /auth/login` success `data.user` excludes `createdAt` and `updatedAt`:

```json
{
  "success": true,
  "data": {
    "accessToken": "<jwt>",
    "tokenType": "Bearer",
    "expiresIn": "24h",
    "user": {
      "id": "<uuid>",
      "email": "user@example.com",
      "firstName": "Aiman",
      "lastName": "Muzaffar",
      "bio": null
    }
  },
  "meta": {
    "timestamp": "2026-02-21T15:04:05.000Z",
    "path": "/auth/login"
  }
}
```

## Troubleshooting

- Use the exact compose filenames:
  - `docker-compose.dev.yml`
  - `docker-compose.prod.yml`
- If ports are already in use (`3000`, `5432`, `5050`), stop conflicting containers or change values in env files.
- Check container logs:

```bash
docker logs pets-corner-api-dev
docker logs pets-corner-db-dev
docker logs pets-corner-pgadmin-dev
```
