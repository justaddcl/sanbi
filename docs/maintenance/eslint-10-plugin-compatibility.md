# ESLint 10 Plugin Compatibility Audit

Checked on: June 2, 2026

## Summary

Sanbi should keep ESLint pinned to the current ESLint 9 stack until the `eslint-config-next` plugin chain is ready for ESLint 10. The main package-level blocker in the lint configuration is `eslint-plugin-import@2.32.0`: it is still the latest release and its peer dependency range allows ESLint 2 through 9, but not ESLint 10.

Most of the explicitly managed lint packages are already compatible with ESLint 10 or have latest releases that declare ESLint 10 support. The migration should be treated as a dependency-validation task, not only an `eslint` version bump, because `eslint-config-next` still depends on `eslint-plugin-import` and other transitive plugins.

## Current Lint Stack

The current Sanbi lint command is:

```sh
pnpm lint
```

`pnpm lint` runs:

```sh
eslint . && tsc --noEmit --project tsconfig.json
```

The active ESLint config is `eslint.config.mjs`. It uses:

- `eslint-config-next/core-web-vitals`
- `typescript-eslint` recommended type-checked and stylistic type-checked configs
- `@tanstack/eslint-plugin-query` flat recommended config
- Local plugin registrations for `@typescript-eslint`, `drizzle`, `import`, `react-hooks`, and `simple-import-sort`

## Compatibility Table

| Package | Current Sanbi version | Latest checked | ESLint 10 peer support | Notes |
| --- | --- | --- | --- | --- |
| `eslint` | `9.39.1` | `10.4.1` | N/A | Target major for the future migration. Latest package lists `jiti` as a peer. |
| `eslint-config-next` | `16.2.6` | `16.2.7` | Declares `eslint: >=9.0.0` | Top-level peer range allows ESLint 10, but its dependency chain still includes plugins that do not currently declare ESLint 10 support. |
| `typescript-eslint` | `8.59.4` | `8.60.1` | Yes: `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` | Likely compatible after upgrading to `8.60.1`. |
| `@typescript-eslint/eslint-plugin` | `8.59.4` | `8.60.1` | Yes: `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` | Keep aligned with `@typescript-eslint/parser` and `typescript-eslint`. |
| `@typescript-eslint/parser` | `8.59.4` | `8.60.1` | Yes: `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` | Keep aligned with `@typescript-eslint/eslint-plugin` and `typescript-eslint`. |
| `@tanstack/eslint-plugin-query` | `5.100.14` | `5.101.0` | Yes: `^8.57.0 \|\| ^9.0.0 \|\| ^10.0.0` | Latest release declares ESLint 10 support. |
| `eslint-plugin-drizzle` | `0.2.3` | `0.2.3` | Likely: `>=8.0.0` | The broad range includes ESLint 10, but this should still be smoke-tested because the package has not had a newer release. |
| `eslint-plugin-import` | `2.32.0` through `eslint-config-next` | `2.32.0` | No: `^2 \|\| ^3 \|\| ^4 \|\| ^5 \|\| ^6 \|\| ^7.2.0 \|\| ^8 \|\| ^9` | Main blocker. Sanbi also registers this plugin directly in `eslint.config.mjs`, but it is supplied transitively by `eslint-config-next`. |
| `eslint-plugin-react-hooks` | `7.1.1` through `eslint-config-next` | `7.1.1` | Yes: `^3.0.0 \|\| ^4.0.0 \|\| ^5.0.0 \|\| ^6.0.0 \|\| ^7.0.0 \|\| ^8.0.0-0 \|\| ^9.0.0 \|\| ^10.0.0` | Compatible with ESLint 10 by declared peer range. |
| `eslint-plugin-simple-import-sort` | `13.0.0` | `13.0.0` | Likely: `>=5.0.0` | Broad peer range includes ESLint 10. Smoke-test during migration. |
| `@types/eslint` | `9.6.1` | `9.6.1` | N/A | Type package has no ESLint peer dependency. Re-check during migration for an ESLint 10 type package or built-in type changes. |

## Additional `eslint-config-next` Risk

`eslint-config-next@16.2.7` depends on `eslint-plugin-import@^2.32.0`, so switching Sanbi to ESLint 10 before `eslint-plugin-import` updates its peer range would leave a peer dependency conflict in the Next lint stack.

The current Next plugin chain also includes `eslint-plugin-react@7.37.5` and `eslint-plugin-jsx-a11y@6.10.2`; their latest peer ranges also stop at ESLint 9. They are not registered directly in Sanbi's `eslint.config.mjs`, but they are part of the `eslint-config-next` dependency surface and should be rechecked when the migration starts.

## Recommended Migration Posture

Do not migrate Sanbi to ESLint 10 yet.

Recommended path:

1. Keep `eslint` on `9.x` for now.
2. Track `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-jsx-a11y`, and `eslint-config-next` for peer updates that explicitly support ESLint 10.
3. When those peers are ready, upgrade the lint stack together:
   - `eslint@10.4.1` or newer
   - A future `eslint-config-next` version that resolves the transitive blockers; `16.2.7` is not sufficient for ESLint 10
   - `typescript-eslint@8.60.1` or newer
   - `@typescript-eslint/eslint-plugin@8.60.1` or newer
   - `@typescript-eslint/parser@8.60.1` or newer
   - `@tanstack/eslint-plugin-query@5.101.0` or newer
   - `eslint-plugin-simple-import-sort@13.0.0` or newer
   - `eslint-plugin-drizzle@0.2.3` or newer
   - Transitive Next lint plugins such as `eslint-plugin-react-hooks`, `eslint-plugin-react`, and `eslint-plugin-jsx-a11y` through the compatible `eslint-config-next` release
4. Run `pnpm lint` and address only migration-related lint or type fallout.

If the ESLint 10 migration must proceed before `eslint-plugin-import` declares support, evaluate `eslint-plugin-import-x@4.16.2`, which currently declares `eslint: ^8.57.0 || ^9.0.0 || ^10.0.0`. This is not a drop-in decision for Sanbi because `eslint-config-next` still depends on `eslint-plugin-import`, so it would require validating how Next's config behaves with the replacement or waiting for Next to change its dependency chain.

## `eslint.config.mjs` Type Checking

`eslint.config.mjs` currently starts with:

```js
// @ts-nocheck
```

Leave this unchanged for SWY-128. This ticket is a compatibility audit, not the actual ESLint 10 migration. Revisit the directive during the migration after the dependency versions are installed and the config's runtime and type behavior can be validated against ESLint 10.

## Validation Notes

- No package or lockfile changes are required for this audit.
- No runtime tests are required because this is documentation-only.
- The smallest useful validation for a future migration is `pnpm lint` after installing the candidate dependency set.
