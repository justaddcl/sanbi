# ADR 0002: API Standard and Service Testing

Status: Accepted

Date: June 25, 2026

## Context

Sanbi currently has two backend API surfaces:

- tRPC routers under `src/server/api/routers`, used by the Next.js app through
  the shared tRPC client and server caller helpers.
- oRPC resource routes under `src/server/orpc`, which expose RPC/OpenAPI-style
  handlers for the existing resource work.

Most Sanbi features are internal application workflows scoped to the signed-in
user's organization. New feature work should not re-decide between tRPC, oRPC,
and OpenAPI for each endpoint. The default should match the app's current
internal client/server model while preserving a path for future public API
contracts if Sanbi accepts that requirement.

## Decision

New internal Sanbi APIs use tRPC by default.

Use `createTRPCRouter` and the procedure helpers from `src/server/api/trpc.ts`.
For organization-owned data, start with `organizationProcedure` or
`adminProcedure` instead of repeating auth, user lookup, organization lookup, or
membership checks inside each endpoint. Use `publicProcedure` only for behavior
that is intentionally unauthenticated.

Input validation belongs at the procedure boundary with Zod. Prefer named,
exported schemas when an input shape is shared across callers, services, or
tests. Keep normalization either in the schema when it is pure input shaping or
in the service when it depends on existing data, permissions, or external work.

Keep simple reads and thin writes in the router when the procedure is only
validating input, applying the existing organization procedure guard, and making
a direct query. Extract non-trivial behavior into a focused service function
when a mutation has branching, normalization, conflict handling, side effects,
or data-access orchestration. Service functions should accept explicit injected
dependencies, such as a `resourceDataAccess`-style object, so tests can exercise
business behavior without a real database.

Reserve OpenAPI, oRPC-style contracts, and public documentation routes for a
future accepted public API requirement. Existing oRPC resource work should be
migrated separately rather than copied as the pattern for new internal features.

Chord chart API work should follow this decision: add organization-scoped tRPC
procedures for internal app workflows, extract complex chart behavior into
injectable services, and defer public/OpenAPI contract design until there is a
specific accepted public API need.

## Endpoint Shape

New internal endpoints should generally use this shape:

- Define Zod input and output shapes close to the domain, reusing existing
  schema helpers when available.
- Add procedures to a domain router under `src/server/api/routers`, then export
  and register that router through `src/server/api/routers/index.ts` and
  `src/server/api/root.ts`.
- Use `organizationProcedure` for organization-scoped reads and writes so the
  caller must provide a valid `organizationId` and the context includes the
  authenticated user, membership, and organization.
- Use shared auth and membership helpers instead of duplicating membership
  lookups or trusting organization IDs from client state.
- For complex mutations, call a service function from the procedure and pass
  only the dependencies that service needs: data access functions, clocks,
  metadata resolvers, loggers, or other hard boundaries.
- Map expected domain failures to tRPC errors at the boundary or inside the
  service, keeping error codes stable for callers and tests.

## Testing

Do not use Postman, generated OpenAPI clients, or browser UI tests as the
default way to verify internal procedures.

Test pure domain rules and complex mutations with service tests. Inject narrow
data-access fixtures from `src/testUtils` and assert authorization, missing
data, cross-organization access, no-op updates, changed-field writes,
validation/normalization, and expected conflict or error mappings. These tests
should not make real database calls unless the database contract itself is the
behavior under test.

Test router wiring and procedure behavior with tRPC callers. Create callers from
the domain router or app router with a test context, then call the procedure
directly. This covers Zod validation, procedure middleware, auth context,
membership handling, and response mapping without going through HTTP or UI.

Use Playwright only for user-visible workflows where browser behavior,
navigation, Clerk integration, rendering, or accessibility is the subject of the
test. Backend authorization, validation, and mutation branching should be
covered by service or tRPC caller tests first.

## Consequences

- Internal API work has one default: tRPC.
- Public API decisions are explicit product and architecture decisions, not a
  side effect of endpoint implementation.
- Services remain reusable and testable when behavior is too complex to live
  directly in a router.
- Procedure tests stay fast because they call services or tRPC callers without
  Postman, OpenAPI generation, a browser, or real database access by default.
- Existing oRPC resource routes remain in place until a separate migration moves
  that surface to tRPC.
