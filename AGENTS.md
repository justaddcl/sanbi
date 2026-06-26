# Sanbi Agent Guide

This file captures project conventions for coding agents and reviewers. It applies to the whole repository. Cursor-specific rules live in `.cursor/rules/sanbi-rules.mdc`; keep this file and that file aligned when changing agent guidance.

## Codebase Defaults

- Use TypeScript with accurate types. Prefer existing local patterns, helpers, schemas, and component APIs over new abstractions.
- Prefer named exports and small, focused modules. Add abstractions only when they remove real duplication or clarify a shared boundary.
- Use Zod schemas for validation and existing router/procedure patterns for API work.
- Keep edits scoped to the requested behavior. Do not clean up unrelated files as part of feature or review work.

## Testing Conventions

- Prefer real application code in tests. Mock only hard boundaries such as network clients, auth/session providers, browser APIs, time, randomness, or data access seams.
- When mocking is necessary, keep the mock narrow and explicit. Avoid mocking components only to make assertions easier; assert behavior through accessible UI, submitted inputs, query invalidation, or injected dependency calls.
- Put reusable test helpers in `src/testUtils` and import them through `@testUtils/*`.
- Organize test helpers by model/domain or concern, for example `models/resource`, `models/user`, and `generators`.
- Fixture helpers should return complete valid objects and accept partial overrides.
- Generate IDs, names, URLs, and other incidental data through shared generators instead of hard-coded literals.
- Assertions should reference values from fixture objects or test-local variables. Avoid duplicating exact strings or manually retyping input values unless the literal text is the behavior under test.
- Prefer integration-style component tests for user workflows and unit tests for pure helpers, validation, and backend service logic.
- Do not assert incidental rendering details that users do not experience and maintainers do not care about.

## Backend Procedure Tests

- Isolate business logic from the database with explicit dependency injection.
- Name injected seams by what they do in this codebase, such as `resourceDataAccess`, unless a broader repository pattern already exists.
- Cover authorization, missing data, cross-organization access, no-op updates, changed-field writes, validation/normalization, and expected conflict/error mappings.
- Avoid real database calls in unit tests. Use integration tests only when the database contract itself is what needs coverage.

## Review Conventions

- When reviewing agent-written code, look for stale mocks, duplicated fixture setup, hidden assumptions about organization membership or active context, unclear names, and helpers/components defined in a file only because it was convenient.
- Reuse existing production helpers before creating similar logic. If logic cannot be reused directly, extract a focused helper and add tests for it.
- Ask whether each test would fail for the real regression it claims to cover. Tests that only verify the mock shape are weak coverage.
- Prefer comments and documentation for non-obvious behavior; avoid comments that restate obvious code.

## PR Comment Handling

- Verify each PR finding against the current code before changing anything.
- Fix actionable issues. Skip obsolete, duplicate, or non-actionable comments with a short rationale.
- Keep each fix traceable to the review thread it addresses.
- Validate with the smallest relevant test set plus typecheck/lint when practical.
- After pushing commits that address review feedback, re-check open PR threads.
- If the pushed changes directly address a thread, leave a concise reply explaining what changed and include a link to the commit that addressed it. Then resolve that thread.
- It is appropriate to answer GitHub review threads with reasoning, tradeoffs, or intent when the answer will help human reviewers or review bots such as Greptile and CodeRabbit evaluate the code.
- Do not resolve threads that were not directly addressed by the pushed changes. Do not merge unless explicitly asked.
