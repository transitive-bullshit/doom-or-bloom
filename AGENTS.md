## Conventions

- use `pnpm`
- Local development: use `pnpm dev` and the Portless URL it prints; `pnpm exec portless get doom-or-bloom --no-worktree` resolves it.
- use modern typescript
- no semicolons
- oxfmt for formatting (`pnpm fix:format`)
- oxlint for linting (`pnpm fix:lint`)

## Project context

- Start with [docs/README.md](docs/README.md) for the handoff index and locked product language.
- Persistence, anonymous ownership, synchronous assessment operations, public assessments, personas, or X login: follow [docs/persistence-implementation-plan.md](docs/persistence-implementation-plan.md) and [docs/PERSISTENCE.md](docs/PERSISTENCE.md); mark verified tasks `[x]` and commit at checkpoints. Use native local Postgres; no Docker.
- Implementing the original MVP: follow [docs/mvp-implementation-plan.md](docs/mvp-implementation-plan.md); mark completed tasks `[x]` and commit at its checkpoints.
- Product scope or UI: [docs/PRODUCT.md](docs/PRODUCT.md). Use shadcn/ui for recurring primitives.
- Profiles, routing, answer recovery, readiness, or projections: [docs/ASSESSMENT.md](docs/ASSESSMENT.md).
- Jev integration or inference boundaries: [docs/TYPESAFE.md](docs/TYPESAFE.md).
- Prompts, rubrics, reference snapshots, findings, or resources: [docs/AUTHORING.md](docs/AUTHORING.md).
- Source selection or freshness: [docs/SOURCES.md](docs/SOURCES.md). Common-opinion journeys or safety terminology: [docs/JOURNEYS.md](docs/JOURNEYS.md).
- Analytics, privacy, or evaluation: [docs/MEASUREMENT.md](docs/MEASUREMENT.md).
- Domain terminology or state modeling: [docs/CONTEXT.md](docs/CONTEXT.md).

Current scope is local development; deployment is a separate task. The handoff defines product semantics; the implementation plan records repository decisions and execution status.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
