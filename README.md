# Pets Corner API

NestJS API scaffold for the Pets Corner backend.

Current stage:
- Nest app is running with a starter endpoint.
- Dockerized development and production stacks are configured.
- Supporting services: PostgreSQL and pgAdmin.

## Development model

This project is primarily developed by AI coding agents, with minimal direct human coding.

## Tech stack

- Node.js + NestJS (TypeScript)
- PostgreSQL 16 (`postgres:16-alpine`)
- pgAdmin 4 (`dpage/pgadmin4:8`)
- Docker Compose (separate dev/prod files)

## Current API

- `GET /` -> `Hello Aiman!`

## Project structure

- `docker-compose.dev.yml`: development stack (API, Postgres, pgAdmin)
- `docker-compose.prod.yml`: production stack (API, Postgres, optional pgAdmin profile)
- `Dockerfile`: multi-stage image (`development` + `production`)
- `.env.development`: runtime env for dev compose
- `.env.production`: runtime env for prod compose

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
