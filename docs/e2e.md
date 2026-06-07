# Playwright E2E Tests

Sanbi has a narrow Playwright suite for protected app workflows. The suite uses Clerk's official Playwright helpers, a deterministic Postgres seed, and failure-only Playwright artifacts.

## Required Environment

Use a disposable database. The E2E seed truncates Sanbi tables and exits unless `SANBI_E2E=1` is present.

Required variables:

```sh
DATABASE_URL=postgresql://postgres:password@localhost:5432/sanbi_e2e
POSTGRES_URL=postgresql://postgres:password@localhost:5432/sanbi_e2e
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
E2E_CLERK_USER_EMAIL=e2e+clerk_test@example.com
E2E_CLERK_USER_ID=user_...
SANBI_E2E=1
```

Use Clerk test or development instance keys only. The Clerk test user must exist, and its Clerk user ID must match `E2E_CLERK_USER_ID`.

## Runtime Flags

These variables control how the E2E harness behaves:

| Variable | Context |
| --- | --- |
| `SANBI_E2E=1` | Required for all E2E database seeding and Playwright app startup. The seed refuses to run without it because it truncates Sanbi tables before rebuilding the deterministic test data. |
| `E2E_CLERK_USER_EMAIL` | Email address passed to Clerk's Playwright helper during the setup project. Prefer a dedicated Clerk test-mode address using the `+clerk_test` subaddress, for example `e2e+clerk_test@example.com`, so the suite does not depend on real email delivery. |
| `E2E_CLERK_USER_ID` | Clerk user ID inserted into the local E2E database as the seeded admin user. This must match the Clerk user behind `E2E_CLERK_USER_EMAIL`; otherwise authenticated pages will load with a Clerk session that has no matching Sanbi membership. |
| `E2E_PORT` | Optional port used when Playwright starts the Next dev server itself. Defaults to `3100`. |
| `PLAYWRIGHT_BASE_URL` | Optional base URL for tests. If unset, Playwright uses `http://localhost:${E2E_PORT}`. Set this when you intentionally run against an already-started E2E app server. |
| `PLAYWRIGHT_SKIP_WEB_SERVER=1` | Disables Playwright's built-in Next dev server startup. `pnpm test:e2e:reuse` sets this automatically and should be paired with a `PLAYWRIGHT_BASE_URL` that points at an app started with `.env.e2e`. |
| `CI` | CircleCI sets this automatically. Playwright uses it to reject `test.only`, run with two retries, serialize workers, and keep CI reporting predictable. |

## Local Run

1. Point `DATABASE_URL` and `POSTGRES_URL` at a disposable E2E database.
2. Run `pnpm db:e2e:push`.
3. Run `pnpm test:e2e`.

The repo includes `.env.e2e.example` as a template. Copy the database credentials from your normal local `DATABASE_URL`, but use the `sanbi_e2e` database name.

The default E2E command starts its own Next dev server on port `3100`. If an E2E server is already running on that port, Playwright reuses it after checking `/api/e2e/health`.

If you intentionally start the app yourself with `.env.e2e`, run the tests without Playwright starting another server:

```sh
PLAYWRIGHT_BASE_URL=http://localhost:3100 pnpm test:e2e:reuse
```

Do not point `test:e2e:reuse` at a normal local dev server unless that server was started with `.env.e2e`; otherwise the app will use the wrong database while the Playwright setup seeds the E2E database.

For seed debugging without running browsers:

```sh
pnpm db:e2e:seed
```

## Test Organization

The seed creates a placeholder `Stoneway` organization for the current `/` route and a separate `E2E Stoneway` organization for authenticated app workflows. The authenticated organization includes one admin membership for the Clerk test user, one future set, two sections, two songs, one tag, and one resource. Stable IDs and display values live in `src/testUtils/e2e/fixtures.ts`.

Playwright project names describe the test runner group:

- `setup`: seeds the database and stores Clerk auth state.
- `unauthenticated-desktop-chromium`: verifies signed-out desktop behavior, including the temporary `/` route.
- `unauthenticated-iphone-se-webkit`: verifies signed-out iPhone SE behavior, including the temporary `/` route.
- `authenticated-desktop-chromium`: runs signed-in desktop app workflow tests.
- `authenticated-iphone-se-webkit`: runs signed-in iPhone SE app workflow tests.

Project names do not need to match filenames. Spec files are mapped to projects by `testMatch` in `playwright.config.ts`: files ending in `.unauthenticated.spec.ts` run in both unauthenticated projects, and files ending in `.authenticated.spec.ts` run in both authenticated projects. Organize spec files by product area or workflow, while keeping the suffix that maps to the right Playwright project. For example, use `tests/e2e/sets/set-detail.authenticated.spec.ts` for authenticated set detail coverage and `tests/e2e/songs/create-song.authenticated.spec.ts` for the create-song workflow.

## Artifacts

Playwright keeps traces, videos, and screenshots only for failures. The generated `playwright-report`, `test-results`, and `playwright/.clerk` auth storage directory are ignored by git and uploaded by CircleCI.

## Coverage Strategy

Keep the always-on CI suite focused on workflows that are expensive or risky to verify below the browser level:

- Auth boundaries: signed-out users cannot see protected organization data, and signed-in users land in their seeded organization.
- Organization-scoped reads: pages render only data from the active organization and do not leak placeholder or unrelated seeded data.
- Critical happy-path mutations: create or edit the records users rely on most, such as songs, sets, set sections, resources, and tags.
- Navigation and responsive smoke coverage: each protected workflow should keep working on desktop Chromium and iPhone SE WebKit when the layout changes.

Use unit or backend procedure tests instead of Playwright when the behavior is pure validation, authorization branching, conflict mapping, normalization, or data-access orchestration. Those tests are cheaper, faster, and can cover more edge cases without paying the browser startup cost.

Each new `.authenticated.spec.ts` runs in both authenticated Playwright projects, and each `.unauthenticated.spec.ts` runs in both unauthenticated projects. In CI, those projects run with one worker and two retries, so broad E2E backfills should be added deliberately. Prefer a small smoke suite on every PR, then backfill high-value workflows as features change or as regressions are found. If the suite grows enough to slow PR feedback, split broader coverage into a scheduled or manually triggered job before adding more browsers or exhaustive permutations to the default workflow.

Avoid E2E tests that create Clerk users, send invitations, send real email/SMS, exercise live third-party billing, or depend on production credentials. The current harness signs in one dedicated Clerk test user during setup, stores that browser state, and reuses the seeded local database for app data. That keeps Clerk usage and CI runtime predictable while still covering the Sanbi workflows users experience.
