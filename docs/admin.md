# Local admin and Drizzle Studio

The read-only operator dashboard lives at `/admin` in the existing Next.js app. It reuses participant result, conversation, and library components. It has no login impersonation, write actions, or inference calls.

## Start the dashboard

Stop the existing admin process before switching targets. Normal `pnpm dev` can keep running:

```sh
pnpm admin:local
# Or inspect production from this computer:
pnpm admin:production
```

Open `/admin` at the Portless URL printed by the launcher. `pnpm exec portless get admin.doom-or-bloom --no-worktree` resolves the admin URL. The sidebar labels the active database. Restart with the other command to switch; database URLs are never accepted through a browser parameter.

Both commands run `pnpm dev` with a separate `admin.doom-or-bloom` Portless route and `.next-admin` build directory, avoiding conflicts with normal development. Local inspection reads `.env.development.local`; production inspection reads `.env.production.local`. Only `ADMIN_DATABASE_URL` (preferred), `DATABASE_MIGRATION_URL` (direct connection), or `DATABASE_URL`, in that order, is copied from the selected file into the admin pool. The ordinary application continues using development credentials, including its development database and auth. The local command refuses a non-loopback database. Credentials are never printed or included in client props.

The production file is ignored by Git. If it is not already present, set `ADMIN_DATABASE_URL` there to a PostgreSQL connection URL for the production database. A database role with SELECT-only grants is preferable. An application credential also works; the dashboard pool sets PostgreSQL `default_transaction_read_only=on`, a 15-second statement timeout, and a maximum of three connections. It does not call the normal owner repository's reads that may update expired operations. Read-only connection settings prevent accidental writes, but are not a replacement for role-level permissions.

## Views and definitions

- **Overview:** saved starts, assessments with accepted answers, current results, distinct current owners, public assessments, and latest-operation failures/interruption. Defaults to all time and participants only.
- **Assessments:** database-backed filters for creation cohort (last 24 hours, week, 30 days, all time), state, origin, identity, text/ID search, and creation/update ordering. Lists use 25-row pages and project small summary fields rather than fetching all snapshots.
- **Assessment detail:** exact saved questions, accepted answers, earlier rejected replies, the current result, and a separate frozen published snapshot where available. It uses the participant's read-only results presentation. Unanswered prompts appear in the conversation tab. Metadata and the latest 30 operations, including failed/pending submitted replies, are collapsed by default. Simulation snapshots have a labeled result and transcript view.
- **Users:** current owners of matching assessments, including anonymous identities. Open an owner to see assessment history or the participant library presentation. Both views share the current filters and page; action menus are removed and links stay inside admin.

Dates select assessments by **creation time**, then show their current state, rather than counting events that occurred in the period. All displayed dates and times follow the viewer’s browser locale and timezone. Date column headers show the IANA timezone (for example, `Asia/Bangkok`); standalone timestamps include it inline. Opening a draft creates no assessment row; “started” means first submission persisted, or a fork created. Deleted assessments and unsubmitted drafts are absent. Accepted-answer counts include inherited answers in forks. “Completed” means the current snapshot has a result, including provisional/insufficient results, and does not establish that a user viewed it. An assessment can have results and also need attention after a later failed operation. Users here are current owners with matching records, not visitors, sessions, or deduplicated humans. Signing in can transfer ownership, so this is not a historical identity audit.

## Isolation

1. `next.config.ts` sets a build-time admin gate only for an explicitly enabled development server. Other phases rewrite every `/admin` path to an unconditional 404 before filesystem routes.
2. Every page and the database entry point independently check the build gate, `NODE_ENV=development`, `ADMIN_ENABLED=true`, absence of Vercel/preview/tunnel configuration, and local Host/forwarded-Host headers.
3. The dev launcher enables admin only through the explicit target flag, binds Next to `127.0.0.1`, rejects extra Portless flags, LAN, Tailscale, Funnel, and ngrok/tunnel usage, and disables analytics. Admin routes additionally suppress Vercel Analytics, are noindex and dynamically rendered. Next config requests private/no-store; Next 16 development rendering overrides this with `no-cache, must-revalidate`, so local browsers must revalidate. The production denial response is private/no-store.
4. The dedicated read-only pool has no fallback to the normal app pool. Only selected identity fields are queried; auth tokens, sessions, provider secrets, and transport diagnostics are not exposed.

`pnpm dev` without an admin flag disables the dashboard. `next build`/`next start`, including local production-mode builds, cannot enable it with runtime flags. This remains local tooling, not an authenticated remote admin service: do not expose the dev server through a public reverse proxy. Loopback binding and hostname checks do not authenticate other local processes/users.

## Drizzle Studio

```sh
pnpm db:studio           # alias for local
pnpm db:studio:local
pnpm db:studio:production
```

Studio uses `drizzle.studio.config.ts` and the same checked-in Drizzle schema, including Better Auth relations. It explicitly binds to `127.0.0.1:4983`; open the Studio URL printed by Drizzle. Only one Studio instance can use the port at a time.

Target credentials are loaded from the same files and keys as the dashboard, independently of shell `DATABASE_URL`. Neon requires a direct connection for the enforced startup settings; its pooled URL is rejected with setup instructions. Local Studio permits edits. Production Studio sets PostgreSQL read-only mode and a statement timeout by default; this is intended for inspection, and write attempts should fail. No migrations, schema pushes, or production writes run as part of either inspection command.

## Verification

`pnpm test` includes environment/host/build guard tests and filter/status checks. `pnpm check:browser tests/browser/admin.spec.ts` uses native test Postgres and synthetic inference to verify filtering, private result inspection without owner cookies, read-only library navigation, mobile navigation, cache headers, and unchanged stored revisions. `pnpm build:local` validates packaging; inspect its production server's `/admin` paths with admin runtime flags set to confirm they remain 404.
