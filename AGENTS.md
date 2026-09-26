# Working in Doom or Bloom

Doom or Bloom helps participants articulate their AI worldview through a bounded adaptive interview. Preserve faithful interpretation, honest uncertainty, and separation of worldview from demonstrated reasoning.

## Start here

- Use [docs/README.md](docs/README.md) to select the contract for your task. For initial orientation or work across modules, read [docs/architecture.md](docs/architecture.md) for the request flow, code ownership, and decision rationale.
- Setup and environment selection: [CONTRIBUTING.md](CONTRIBUTING.md). Choose checks by the changed boundary in [docs/testing.md](docs/testing.md).
- Update the relevant current contract when behavior changes. Implementation plans and dated research record decisions and verification; completed checkpoints are history, not a new task list. When working an open plan task, mark it `[x]` only after verification and commit at its checkpoint.
- The top-level [README.md](README.md) is a human-facing marketing page. Keep agent guidance in this file and `docs/`.

## Development conventions

- Use `pnpm`, modern TypeScript, and no semicolons. Format with `pnpm fix:format`; fix lint with `pnpm fix:lint`.
- Use shadcn/ui for recurring UI primitives and follow [PRODUCT.md](docs/PRODUCT.md) for interaction rules.
- Start local development with `pnpm dev` and use its printed Portless URL. Resolve the root checkout with `pnpm exec portless get doom-or-bloom --no-worktree`; linked worktrees retain their branch-prefixed URL.
- Use native local PostgreSQL and a separate disposable test database; no Docker. Database/auth/publication changes follow [PERSISTENCE.md](docs/PERSISTENCE.md).
- Use credential-free fixtures for routine checks. Live journeys make paid OpenAI and Jev calls; follow the bounded workflow in [user-journeys.md](docs/user-journeys.md). Paid pressure testing is excluded.
- Development work is local by default. Deployment, production migrations, and production persona imports are separate tasks; a Git push to production-tracking `main` can deploy the site.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
