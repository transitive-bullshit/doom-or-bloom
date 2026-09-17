# Doom or Bloom

A local, adaptive assessment of AI worldviews and demonstrated reasoning. One authored question at a time; results become available after three substantive answers. Jev supplies narrow typed judgments, and application code owns routing, recovery and projections.

Implementation is in progress. The app works with a sourced seed and labeled draft assets; the full reviewed corpus and held-out evaluation are still required. See [execution status](docs/mvp-implementation-plan.md) and the [project handoff](docs/README.md).

## Local setup

Use Node.js 24 or newer and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by the development server. To use a direct port instead of the included local proxy:

```sh
pnpm exec next dev -p 3000
```

Create `.env.local` using [.env.example](.env.example), preserving any existing credentials. Real assessments require `TYPESAFE_API_KEY`; it stays on the server. `TYPESAFE_MODEL` defaults to the pinned `jev-1.13.0`. The app sends usable answer context to TypeSafe; it has no assessment database or account system.

## Fixture and debug modes

`ASSESSMENT_PROVIDER=fixture` runs explicitly labeled synthetic judgments without a key or inference requests. It is available only in development and tests and is useful for exercising UI behavior, not assessment accuracy.

`NEXT_PUBLIC_ASSESSMENT_DEBUG=true` makes an optional, clearly marked debug panel available. It shows the latest operation’s typed Jev inputs/outputs, routing decisions, counters, timings and usage. Toggling it adds no inference calls; traces are transient and clear on restart.

## Persistence and recovery

Progress and drafts live in one browser-local record. Reload resumes the same prompt. A conflicting tab pauses until it loads the newer record; corrupt or incompatible data can be exported before restarting. If storage is unavailable, progress lasts only while the tab remains open.

An unusable or unclear reply gets bounded authored recovery. Two confident consecutive non-answers trigger a one-time, dismissible paperclip pause; relevant humor and honest uncertainty remain usable. A prompt permits the original semantic submission plus two recovery submissions. Failed requests and navigation do not consume that allowance. Uncertain network retries reuse their request ID; process restarts do not guarantee exactly-once billing.

Rejected text stays in a bounded local interaction history, outside scoring, later requests and report text. Twelve issued prompts, including clarification, force finalization from usable evidence. Insufficient evidence produces an honest unplaced result.

## Checks and evaluation

```sh
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm check:browser
```

Ordinary checks need no external credentials and make no inference calls. Browser regressions launch a separate fixture server on port 3011; stop another Next development server in this checkout first because Next holds a development lock. Takumi is kept external to the server bundle so its native PNG backend loads correctly.

Opt-in live commands use only their synthetic inputs and read `.env.local` without printing credentials:

```sh
pnpm eval:smoke
pnpm eval:engine
```

Live runs consume TypeSafe usage and require a small reviewed suite with an explicit cost budget. Use fixtures for bounds and workflow checks; no paid pressure-testing command is provided. Existing measurements are historical development evidence, not held-out accuracy validation; see [measurement notes](docs/benchmark-notes.md).

## Authored content

Prompts, references, findings and resources live under `content/releases/`; rubric categories, weights and Jev question templates live under `content/rubrics/`. IDs, rules, graph reachability, provenance, review status and hashes are validated by `pnpm test:content`. The expanded historical seed was returned for revision. Follow [current source guidance](docs/SOURCES.md) and [argument journeys](docs/JOURNEYS.md) before the next editorial review.

Format and validate before freezing a fully human-reviewed bundle:

```sh
pnpm fix:format
pnpm test:content
pnpm content:freeze 'Actual human reviewer' 'Release changelog'
```

Freezing rejects drafts and hashes every asset. Modifying a frozen file invalidates the release; create a new version for later changes.

## Optional analytics

Analytics is off by default and always disabled in fixture mode. `NEXT_PUBLIC_ANALYTICS_ENABLED=true` enables the optional traffic and explicit-event adapters. PostHog also needs `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`, and `POSTHOG_IP_DISPOSAL_CONFIRMED=true` after confirming project-level IP disposal in PostHog.

Events use allowlisted identifiers and coarse buckets. Answers, excerpts, free-form clarification, URL queries/hashes, replay, autocapture and person profiles are excluded. A random per-assessment ID links resumed visits and rotates on restart. See the [privacy page](app/privacy/page.tsx) and [measurement contract](docs/MEASUREMENT.md). Deployment is a separate task.
