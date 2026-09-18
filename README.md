# Doom or Bloom

A local, adaptive assessment of AI worldviews and demonstrated reasoning. A scrollable question-and-answer thread with one active authored question; provisional results become available when supported coverage is sufficient, potentially after one detailed answer. Jev supplies narrow typed judgments, and application code owns routing, recovery and projections.

Implementation is in progress. New assessments use 138 references and 14 reading suggestions in a clearly labeled local draft release. All 111 currently mapped required URLs and their 117 mapped snapshot identities are represented; three required originals remain unavailable for a substantive snapshot. Human review, the full required corpus and held-out evaluation are still required. Saved assessments on either earlier release retain their 42- or 135-reference corpus until restart. See [execution status](docs/mvp-implementation-plan.md) and the [project handoff](docs/README.md).

## Local setup

Use Node.js 24 or newer and the pnpm version pinned in `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Use [Portless](https://portless.sh) for local development URLs. `pnpm dev` runs Next through Portless at `doom-or-bloom.localhost`; open the URL Portless prints. It reuses your proxy's protocol and port, assigns the upstream port automatically, and prefixes the hostname in linked Git worktrees. To resolve the current URL:

```sh
pnpm exec portless get doom-or-bloom
```

Create `.env.local` using [.env.example](.env.example), preserving any existing credentials. Real assessments require `TYPESAFE_API_KEY`; it stays on the server. `TYPESAFE_MODEL` defaults to the pinned `jev-1.13.0`. The app sends usable answer context to TypeSafe; it has no assessment database or account system.

## Fixture and debug modes

`ASSESSMENT_PROVIDER=fixture` runs explicitly labeled synthetic judgments without a key or inference requests. It is available only in development and tests and is useful for exercising UI behavior, not assessment accuracy.

`NEXT_PUBLIC_ASSESSMENT_DEBUG=true` makes an optional, clearly marked debug panel available. It shows recorded typed Jev inputs/outputs, routing decisions, counters, evidence readiness, timings and usage. Dotted JSON keys explain judgments and internal terms on hover or keyboard focus. Toggling/inspecting adds no inference calls; debug operations persist in browser IndexedDB across refresh and clear on restart. Runtime corpus grounding is paused; existing historical exchanges remain readable.

## Persistence and recovery

Progress and drafts live in one browser-local record per origin. Reload resumes the same prompt. Use the same Portless URL across server restarts; progress saved at an earlier direct-port URL remains on that origin. A conflicting tab pauses until it loads the newer record; corrupt or incompatible data can be exported before restarting. If storage is unavailable, progress lasts only while the tab remains open.

Answers may contain up to 20,000 characters when submitted. The text box has no hard input cap: longer typing, dictation and pasted drafts stay intact, including after reload when browser storage is available. Only when a draft exceeds that limit, a counter and message explain how much to shorten; Continue stays disabled until the draft fits. Neither the browser nor the server silently truncates an answer.

An unusable or unclear reply gets bounded authored recovery. Two confident consecutive non-answers trigger a one-time, dismissible paperclip pause; relevant humor and honest uncertainty remain usable. A prompt permits the original semantic submission plus two recovery submissions. Failed requests and navigation do not consume that allowance. Uncertain network retries reuse their request ID; process restarts do not guarantee exactly-once billing.

Previous questions and submitted replies remain visible in the same page, using the browser's page scrollbar. Longer answers show a compact exact-text preview and a disclosure to read the full answer; opening it adds no inference request. Reload retains the conversation and resets disclosures to their compact state. Earlier recovery/navigation replies stay in local interaction history, outside scoring, later requests and report text. Local history is retained subject to browser storage availability and quota. Twelve issued prompts, including clarification, force finalization from usable evidence. Insufficient evidence produces an honest unplaced result.

## Checks and evaluation

```sh
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm check:browser
```

Ordinary checks need no external credentials and make no inference calls. Browser regressions launch through Portless as `browser.doom-or-bloom.localhost`; intercepted analytics checks use `analytics.doom-or-bloom.localhost`. Both resolve the existing proxy configuration automatically. Start your Portless proxy once using its normal local setup. Stop another Next development server in this checkout first because two dev servers share a development lock. Takumi is kept external to the server bundle so its native PNG backend loads correctly.

Opt-in live commands use only their synthetic inputs and read `.env.local` without printing credentials:

```sh
pnpm eval:smoke --allow-paid --max-requests=1
# Only after agreeing a small development run; stops when its budget is spent:
pnpm eval:engine --allow-paid --max-requests=12
```

Live runs consume TypeSafe usage and require a small reviewed suite with an explicit cost budget. Both commands refuse to run without the explicit paid flag and a whole-run physical request ceiling (1–24), including retries and batches. Failures retain a conservative budget reservation. New reports go under ignored `eval/runs/`; historical measurements are preserved. Use fixtures for bounds and workflow checks; no paid pressure-testing command is provided. Existing measurements are historical development evidence, not held-out accuracy validation; see [measurement notes](docs/benchmark-notes.md).

No new paid evaluation run is currently approved. Follow the [evaluation protocol](docs/evaluation-protocol.md) for reviewed labels, blinding, prospective tolerances and an explicitly approved monetary/request budget before a future run. Supplying a key or paid command flag does not authorize evaluation spending.

## Authored content

Prompts, references, findings and resources live under `content/releases/`; rubric categories, weights and Jev question templates live under `content/rubrics/`. IDs, rules, graph reachability, provenance, review status and hashes are validated by `pnpm test:content`. The expanded historical seed was returned for revision. Follow [current source guidance](docs/SOURCES.md) and [argument journeys](docs/JOURNEYS.md) before the next editorial review.

Use `pnpm content:coverage` for a metadata-only Markdown index of required originals, snapshot/research mappings, access gaps and overlapping subject tags. The [dated source index](docs/research/source-coverage-2026-09-17.md) is generated from those records; it does not approve or activate content.

The current `0.4.0-draft` release adds three contemporary incident/demonstration entries with the existing graph, rubric and result assets. Its [provenance](content/releases/0.4.0-draft/provenance.json) records original file paths, content versions and hashes. Original drafts and the pinned `0.2.0-draft` and `0.3.0-draft` releases remain available. API operations use the saved assessment's content version; reload never relabels an earlier result. Restart adopts the current draft without an automatic inference call.

`pnpm content:assemble SOURCE_DRAFT_VERSION TARGET_DRAFT_VERSION` creates a new supported draft directory and updates the current manifest after validation. It refuses overwrites and does not confer human review. Register a future supported version deliberately and update the default version only after assembly; use a new version for semantic changes. Freeze additionally requires every required intake original to have compatible reviewed snapshots, so access/review gaps cannot be hidden by complete asset hashes.

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
