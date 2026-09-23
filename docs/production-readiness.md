# Persistence and account production readiness

Prepared September 24, 2026. This records infrastructure preparation, not an application deployment.

## Production configuration

- Vercel project: `saasify/doom-or-bloom` (`prj_X1uPkNyyap8QfXeEaPsQIgRdqpAQ`). Production tracks `main`; this work remains on the PR branch.
- Canonical origin: `https://www.doom-or-bloom.com`. The bare domain redirects here. `BETTER_AUTH_URL` uses the canonical origin; the production X callback is `https://www.doom-or-bloom.com/api/auth/callback/twitter`.
- Production-only variables installed: pooled `DATABASE_URL`, independently generated `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `X_CLIENT_ID`, and `X_CLIENT_SECRET`. Credentials are sensitive Vercel variables. The auth secret and origin are also recorded in ignored `.env.production.local`, mode 0600.
- Existing Jev/model/provider and analytics variables were retained. Vercel masks their sensitive values, so presence was checked; their runtime behavior must be checked on the new deployment.
- Direct `DATABASE_MIGRATION_URL` stays in the ignored production env file for controlled migrations, rather than in the application runtime.
- Vercel already uses Node 24, Next.js, Fluid Compute, and region `iad1`. The assessment POST route declares `maxDuration = 150`, accommodating the bounded 120-second operation deadline.
- Preview environments were not connected to the production database. A functional preview needs its own database/auth configuration.

## Database preparation

The supplied Neon production database (`jolly-dew-73357244`, production branch, `neondb`) was inspected and empty before applying the six checked-in Drizzle migrations, 0000–0005. Verified through the pooled runtime connection: six migrations, 44 personas with valid selected public result snapshots, zero participant assessments, and zero OAuth accounts. Curated persona imports use the checked-in historical journey data and incur no inference calls. No local participant assessments or accounts are copied into production.

## Functional evidence

Fresh checks for this preparation:

- Repository: owner isolation, first-run races, durable request replay, competing submissions, failed operations, explicit retry, late writes, and deletion during inference.
- Commit recovery: rollback and lost acknowledgment without duplicate evaluation or snapshots.
- Lifecycle: 12/24/30-question budgets, published-owner forks, independent history after deletion, publication/revocation, frozen attribution, public serializer.
- Provider-mocked real Better Auth callback: anonymous claim, sign-out, and account recovery across browsers.
- All seven persistence browser cases, including lazy drafts, ownership checks, publication/forks/revocation, and database personas.
- Production-mode build against native local Postgres, including bundled portrait/tracing checks.

Real development X authorization, anonymous assessment claim, sign-out, and subsequent login recovery were previously verified. Automated provider mocking does not verify the production X callback.

## Remaining after deployment

- [ ] Verify startup configuration, database connectivity and curated persona pages on the canonical HTTPS domain.
- [ ] Complete one live Jev assessment: first answer persists, refresh restores it, results generate, and status becomes ready to publish.
- [ ] Sign in through the production X application with an existing anonymous assessment; verify same-URL ownership transfer, avatar menu, logout, and recovery from another browser.
- [ ] Publish, open without a session, inspect captured identity/date and comparisons, then fork, make private and delete. Check anonymous denial after revocation for HTML, JSON and WebP.
- [ ] Check effective production no-store/noindex headers and function duration behavior, including a dropped browser connection and recovery without duplicate answers.
- [ ] Verify external social crawlers can fetch the generated WebP preview. Previously cached third-party previews cannot be revoked.
- [ ] Inspect production logs for unexpected configuration/provider/database errors after this smoke pass.

Production X consent may require the account holder to authorize the app. No additional third-party account provisioning is currently needed. Deployment and the hosted smoke pass remain separate from this preparation.
