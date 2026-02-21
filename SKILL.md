# SKILL.md

## Skill Contract: NestJS Backend (DDD + Clean Architecture)
Use this workflow when implementing features in this repository.

## Workflow
1. Understand the requirement and impacted modules.
2. Design the smallest viable change respecting architecture boundaries.
3. Implement domain first, then use-case, then adapters/controller.
4. Add/update tests (unit first, then integration/e2e as needed).
5. Verify lint/test/build.
6. Summarize changed files, behavior, and verification commands.

## Design Checklist
- Is the business rule in `domain` or `application`, not controller?
- Are external dependencies hidden behind ports/interfaces?
- Is each module cohesive with clear ownership?
- Are error cases modeled and translated at boundaries?
- Is the change backward-compatible unless requested otherwise?

## Layer Rules
- `domain`
  - Pure business logic only.
  - No NestJS decorators/framework imports.
  - Entities/value objects enforce invariants.
- `application`
  - Use-cases orchestrate domain and ports.
  - No direct DB/HTTP client usage.
- `infrastructure`
  - Implement ports (repositories/clients).
  - Handle IO concerns, retries, and mapping.
- `presentation`
  - Controllers only parse input, invoke use-cases, and map responses.
  - Use guards/pipes/interceptors for cross-cutting concerns.

## Coding Standards
- Strong typing and explicit contracts.
- Avoid hidden coupling and shared mutable state.
- Keep methods short and intention-revealing.
- Prefer immutable returns for domain objects.
- Add comments only where they prevent misreading complex logic.

## Validation and Error Handling
- Validate all request inputs.
- Return stable error shapes with actionable messages.
- Use domain-specific errors for business violations.
- Map domain/application errors to HTTP exceptions in controllers/filters.

## Security and Privacy
- No secrets in code, tests, or logs.
- Log safely (mask sensitive fields).
- Enforce authorization on protected actions.
- Validate IDs, enums, and query parameters defensively.

## Testing Standard
- Unit tests:
  - Entities/value objects/use-cases.
  - Mock all external ports.
- Integration tests:
  - Repository and adapter behavior.
- E2E tests:
  - Critical user journeys and failure paths.
- Ensure deterministic test outcomes.

## Production-Grade Additions
- Observability:
  - Structured logs and request correlation.
  - Metrics for latency/error rate/throughput.
- Resilience:
  - Timeout + retry policy for external calls.
  - Graceful degradation/fallback strategy.
- API governance:
  - Versioning strategy.
  - OpenAPI/Swagger kept in sync with DTOs.
- Data governance:
  - Migrations reviewed and reversible.
  - Idempotency for critical write endpoints.
- Delivery:
  - CI gate on lint/test/build.
  - Rollback-safe releases.

## Completion Criteria
- Lint, unit tests, and relevant e2e tests pass.
- New behavior is covered by tests.
- `README.md` is updated on every change (code, config, CI, docs) so project documentation always stays current.
- `API.md` is the source of truth for all API request/response contracts.
- `API.md` is updated after every code change that affects endpoint inputs, outputs, or error shapes.
