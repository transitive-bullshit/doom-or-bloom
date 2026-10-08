# Dependency maintenance — October 8, 2026

Validated the uncommitted maintenance changes based on `f1b3e4860b2ea49797ef57f01f908c90572b3b27`, which matched freshly fetched `origin/main` before editing. Updated 21 app dependency versions and the standalone video's esbuild dependency, refreshed both lockfiles, and set both package-manager declarations to pnpm 12.10.1. Ran recursive updates separately in the app and video workspaces, preserving their separation, exact dependency specifiers and the app's release-age policy.

## Compatibility

- Kept oxfmt exactly pinned to 0.70.0. Version 0.72.0 crashes on `docs/BLOG.md` with `Expected end tag of kind LineSuffix but found LineSuffix`. Final registry checks report only this dependency below latest; the video has no outdated dependencies.
- Updated the admin browser assertion and current documentation for Next's development `Cache-Control: no-store` response. Kept Next's automatically updated agent-guidance heading.
- Updated the publication warmup test to find runtime responses in Next's route-owner cache namespace rather than the build-seed directory. It still observes files before any test GET can warm the newly published page, then verifies cache hits and immediate revocation. No application cache behavior changed.

## Validation

All checks below passed with local databases and synthetic assessment fixtures. At this initial validation checkpoint, no paid generation, production mutation, push or deployment was performed.

| Check | Result |
| --- | --- |
| Frozen installs in both packages | Passed |
| `pnpm test` | Passed; 121 Vitest files, 746 tests (7.73s), plus formatting, lint, types, content and unused-code checks |
| Final format/lint/types/content/unused checks | Passed after the admin changes; affected lint/format/types passed again after the cache test change |
| `pnpm build:local` | Passed; 381 static pages, production routing and asset tracing verified |
| Video `pnpm build` | Passed |
| `pnpm check:browser` and targeted admin rerun | All 108 scenarios passed; full run 4.8m, corrected admin rerun 20.9s |
| `pnpm check:persistence` | 9 passed (51.5s) |
| `pnpm check:analytics` | 4 passed (41.0s) |
| `pnpm check:prefetch` | 13 passed (15.1s), including built pages with an unreachable database |
| `pnpm check:public-cache` after the test update | 2 passed (3.9s), including publication warmup, immediate revocation and deletion |
| Database checks | `db:test`, `db:test:repository`, `db:test:auth`, `db:test:commit`, `db:test:lifecycle`, `db:test:personas`, `db:test:budget`, `db:test:feedback` passed |
| `pnpm db:test:restart` | Passed; disposable native database, repeated migrations/seed, killed POST, restarted server and recovered retry |

The shared test database retained selected persona runs newer than the local import fixtures, causing the exact-import assertion to fail there. That check passed in a fresh disposable native test database, with migrations applied twice; the database was removed afterward. Existing shared selections were preserved. Build/cache runs emitted metadataBase fallback warnings; asset, SEO, locale and cache assertions passed.

## Deployment follow-through

After the authorized commit and push (`f5c2c9a9`), GitHub's Node 24 test job passed. The automatic Vercel build completed Next's page generation but failed the custom production artifact checker: deployment adapters in Next 16.4 emit prerendered responses in `server/route-cache/<kind>/<owner>/$<pathname>` rather than `server/app/<pathname>`.

The checker now selects the artifact layout using the build's recorded adapter configuration and requires exactly one matching scoped response. It retains the existing HTML, PNG, revalidation, asset-trace and routing assertions. Fresh ordinary and adapter-mode local builds passed all checks for 213 profiles and two public assessment images; adapter-mode validation used a temporary no-op adapter with the local development database. The first adapter run encountered a local database connection timeout; the isolated rerun passed.

Additional negative checks against the adapter build confirmed that missing scoped HTML fails even when a legacy copy exists, and duplicate route-owner HTML also fails. Restoring the artifacts passed the complete checker again. Temporary build files were removed, and the final `pnpm test` passed all formatting, lint, type, content, unused-code and unit checks.
