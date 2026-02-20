# AGENT.md

## Purpose
You are the coding agent for this NestJS service. Deliver small, correct, secure changes that keep the codebase clean, scalable, and testable.

## Core Rules
- Plan briefly, then implement.
- Prefer minimal, PR-sized changes over broad rewrites.
- Keep module boundaries explicit and stable.
- No breaking API changes unless explicitly requested.
- Never commit secrets, credentials, or tokens.
- Keep behavior deterministic in tests and build outputs.

## Architecture Baseline
- Use Clean Architecture + DDD boundaries:
  - `domain`: entities, value objects, domain services, domain errors.
  - `application`: use-cases, ports/interfaces, orchestration.
  - `infrastructure`: DB/external adapters implementing ports.
  - `presentation`: controllers, DTOs, guards, pipes, interceptors.
- Domain layer must not depend on NestJS or infrastructure.
- Controllers stay thin; business rules belong in use-cases/domain.
- Repositories are accessed via interfaces (ports), not concrete classes.

## Code Quality Standards
- TypeScript strict-friendly code. Avoid `any` unless justified.
- Favor `readonly`, `const`, explicit return types for public APIs.
- No circular dependencies.
- Keep side effects isolated.
- Prefer composition over inheritance.
- Add concise comments only where logic is non-obvious.

## API and Validation
- Validate all inbound data at the boundary.
- Return consistent response contracts.
- Map internal models to response DTOs.
- Translate domain/application errors into clear HTTP errors.
- Add pagination/filtering/sorting contracts for list endpoints when relevant.

## Security Baseline
- Validate and sanitize user-controlled inputs.
- Apply authn/authz guards on non-public endpoints.
- Use least-privilege access for integrations.
- Do not log secrets or sensitive PII.
- Add rate limiting and CORS policy for internet-facing APIs.

## Reliability and Operations
- Health/readiness endpoints for runtime and dependencies.
- Structured logging with correlation/request IDs.
- Timeouts/retries/circuit-breaker strategy for external calls.
- Graceful shutdown handling.
- Idempotency strategy for critical write operations.

## Testing Expectations
- Unit tests for domain and use-case logic.
- Integration tests for adapters/repositories.
- E2E tests for main API flows and error paths.
- Tests must avoid real network/time flakiness.
- Keep test data builders/factories for readability.

## Data and Persistence
- Use migrations for schema changes.
- Keep transactions explicit for multi-step writes.
- Enforce unique constraints and indexes from business rules.
- Plan for optimistic locking/versioning where concurrency matters.

## CI/CD and Delivery
- Required checks: lint, test, build.
- Treat warnings as actionable debt.
- Keep branch changes focused and reversible.
- Document env vars in `.env.example`.
- Update `README.md` on every change (code, config, CI, docs) so project documentation stays current.

## Quick Commands
```bash
npm i
npm run start:dev
npm run lint
npm test
npm run test:e2e
npm run build
```
