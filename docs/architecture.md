# Architecture and working model

Read this once when entering the project or changing a boundary between modules. [The project guide](README.md) routes to detailed contracts; [CONTEXT.md](CONTEXT.md) owns domain terminology. This is a map of the implemented system, not a new implementation plan.

## What we are building

The interview helps a participant make their expectations, values, assumptions, and reasoning legible. It is bounded because a useful snapshot should not require an endless chat. It is adaptive because an unanswered distinction matters more than covering the same checklist for everyone. A coherent extreme can show strong reasoning; a moderate position can show weak reasoning. Familiarity, eloquence, agreement with preferred sources, and chart position are not quality scores.

The present assessment is a draft measurement instrument. Better interview mechanics do not establish semantic validity. Preserve uncertainty and inspect evidence before optimizing a score, completion rate, or a more visually satisfying map. The longer-term purpose and current scope live in [PRODUCT.md](PRODUCT.md#north-star).

## One participant operation

```text
Browser interview
  -> authenticated /api/assessments/[id] POST
  -> repository accepts immutable input against an expected revision
  -> engine interprets accepted evidence and routes or projects
  -> provider sends bounded authored judgments to Jev
  -> code applies typed judgments and calculates the new state
  -> repository commits snapshot + head + operation success atomically
  -> browser renders the committed state
```

The browser sends an operation, request key, and expected revision, never a replacement assessment. Better Auth supplies the owner. The repository checks ownership and concurrency; the engine does not decide access. Jev calls run outside database transactions, within the same bounded HTTP request. A failed operation retains its input and diagnostics while leaving the last committed snapshot unchanged. Replaying a request key recovers its saved outcome; an explicit retry after failure uses a new key. See [the operation contract](PERSISTENCE.md#synchronous-execution-and-idempotency).

Starting an interview is lazy: an explicit POST reserves a signed browser-backed draft URL without inserting assessment rows. The first submitted answer materializes it, even if evaluation later fails. A page render, prefetch, or crawler GET must not create an assessment. Browser storage protects unsubmitted text and recovery state; Postgres owns committed progress. The old singular `/api/assessment` endpoint returns 410.

The engine evaluates answer disposition before accepting evidence. Usable answers update whole-answer support and readiness, then route to an eligible authored question or results. Ordinary routing uses lightweight judgments; full results run on request, automatic stopping, or the prompt cap. Runtime participant prose is authored text, not free-form model output. Offline persona generation uses an explicit mode with additional excerpts and per-answer projections.

## Code ownership

| Area | Start here | Responsibility |
| --- | --- | --- |
| Routes and UI | `app/`, `components/assessment/`, `components/landing/`, `components/ui/` | Page composition, interview/results, maps, reusable shadcn primitives |
| Pure assessment model | [lib/assessment/schema.ts](../lib/assessment/schema.ts), `state.ts`, `readiness.ts`, `routing.ts`, `projections.ts`, `worldview-experiment.ts` | Typed state, budgets, evidence, eligibility and deterministic calculations |
| Inference orchestration | [lib/server/engine.ts](../lib/server/engine.ts), `questions.ts`, `provider.ts`, `live-provider.ts` | Stage order, authored evaluator questions, live/fixture provider boundary and call budgets |
| Persistence and HTTP boundary | [lib/assessments/repository.ts](../lib/assessments/repository.ts), `contracts.ts`, `drafts.ts`, `client.ts`, `http.ts` | Atomic operations, replay/retry, drafts, ownership and browser recovery |
| Database and identity | `lib/db/`, `drizzle/`, `lib/auth/` | PostgreSQL schema/migrations and Better Auth, including anonymous ownership claims |
| Authored assets | `content/releases/`, `content/rubrics/`, [lib/content/loader.ts](../lib/content/loader.ts), `lib/authoring/` | Validated versioned prompts, rubrics, references, findings and resources |
| Simulated users | [lib/journeys/catalog.ts](../lib/journeys/catalog.ts), `lib/journeys/`, `lib/personas/` | Source briefs, offline runner/local artifacts, immutable database simulations and selected public profiles |
| Reports, privacy and diagnostics | `lib/sharing/`, `lib/analytics/`, `lib/debug/`, `lib/admin/`, `lib/server/upstream-fetch.ts` | Participant exports, allowlisted telemetry, private traces and operator inspection |
| Browser-local storage | [lib/assessments/client.ts](../lib/assessments/client.ts), `components/assessment/use-persistent-assessment.ts` | Current drafts and pending requests. `lib/persistence/` is legacy whole-assessment storage retained for compatibility tests. |

The singular `lib/assessment/` is the interview model; plural `lib/assessments/` is the persistent resource and API boundary. Keep code with the boundary that owns the rule. Test scripts under `scripts/` exercise repositories against native Postgres; unit tests sit beside code and browser checks live under `tests/`.

## Objects that must stay distinct

| Object | Meaning and boundary |
| --- | --- |
| Owner | Anonymous or signed-in identity allowed to manage an assessment. It is separate from a simulated person. |
| Assessment | Durable identity, visibility, lineage, version pins and snapshot pointers. Its library status is derived, not a completion workflow. |
| Snapshot | Immutable conversation, evidence, judgments, recovery state and result together. `revision` tracks state changes; `evidenceRevision` determines whether a result still matches its evidence. |
| Operation | Private submitted action and execution status. A failed submission is retained here without pretending it became evaluated evidence. |
| Prompt / answer / judgment | An issued authored question, the participant's exact response, and an interpretation of that response. A model judgment is not another observation. |
| Result | A derived view of supported evidence. Coverage, interpretation confidence, participant conviction and inferred P(doom) are different quantities. |
| Persona / simulation | Authored source brief and one generated assessment. A persona selects a public simulation; regenerating inserts history and advances a pointer. |

Private assessments can continue answering. Publication freezes the current result snapshot while public and exposes its submitted conversation as well as its results. An owner can make it private to continue, or fork the published snapshot into an independent private assessment. Public viewers do not gain ownership or a remix capability. Public serialization and caching are explicit boundaries; read [PERSISTENCE.md](PERSISTENCE.md#public-pages-and-social-images) before changing them.

## Decisions and lessons

| Decision | Why it matters / evidence |
| --- | --- |
| Authored questions, typed semantic judgments, deterministic orchestration | Keeps wording, eligibility and calculations reviewable. Jev question IDs are bookkeeping: include dimension meanings in evaluator inputs. [TYPESAFE.md](TYPESAFE.md) owns this boundary. |
| Route for a specific unresolved distinction | Topic relevance and flat readiness alone do not say whether another question is useful. Honest uncertainty can resolve a question; repeated elaboration can add nothing. [Elicitation audit](elicitation-audit-2026-09-20.md) and [prompt review](prompt-quality-review.md) explain the failures. |
| Separate outlook, transformation, reasoning and probability | The early map compressed different beliefs and confused unknowns with midpoints. Current projection semantics live in [ASSESSMENT.md](ASSESSMENT.md); the [worldview comparison](worldview-experiment-review-2026-09-20.md) records the exploratory evidence. |
| Whole-answer participant evidence; corpus grounding paused | Runtime assessment interprets the participant's offered basis without claiming external fact-checking. Corpus research and persona source briefs remain useful offline and have different inputs. See [TYPESAFE.md](TYPESAFE.md#runtime-corpus-grounding-is-paused). |
| Immutable snapshots and synchronous operations | Delivers durable recovery without a worker/queue system. Atomic state is guaranteed; exactly-once external billing is not. See the [persistence decision](persistence-implementation-plan.md#2026-09-23--simplify-execution-to-synchronous-posts). |
| Versioned history and separate persona selection | Defaults and source briefs can evolve without rewriting previous evidence or silently rescoring results. Imported historical persona payloads are displayable, not fabricated resumable engine states. See [personas and seeding](PERSISTENCE.md#personas-and-seeding). |
| Mocked mechanical tests plus bounded live review | Fixtures prove workflow behavior, not assessment validity. Simulated users reveal failures but can reflect their source briefs or generator. See [testing.md](testing.md), [MEASUREMENT.md](MEASUREMENT.md), and the [answer-fidelity audit](research/historical-persona-audit-2026-09-25.md). |
| Diagnose provider failures from captured evidence | HTTP 403 alone does not prove context overflow; a failed request may still cost money. The [September 26 investigation](research/jev-403-investigation-2026-09-26.md) separates the observed response, successful replay and controlled context probes. |

## Common changes and surprises

- **UI change:** read the relevant product rule, reuse existing components, and check the affected browser flow. Read the installed Next.js guide before changing framework APIs; repository conventions are in [AGENTS.md](../AGENTS.md).
- **Engine or rubric change:** use matched evidence and the fixture provider first; keep missing evidence distinct from a low score. Review version compatibility and saved-result behavior. Live evaluation follows the explicit budgets in [user-journeys.md](user-journeys.md).
- **Content or persona change:** source briefs, frozen corpus assets, ignored generated runs, and database selections are different stores. A source edit or Git deployment does not regenerate/import simulations. A fresh checkout may lack the local artifacts required by `db:seed`; see [setup](../CONTRIBUTING.md).
- **Persistence or public-page change:** exercise the relevant ownership/replay/recovery or cache boundary in [testing.md](testing.md). Reading an assessment is not an operation. A CLI persona import does not immediately invalidate public pages; selection and cache behavior are documented in [PERSISTENCE.md](PERSISTENCE.md).
- **Production-mode local check:** use `build:local` / `start:local`; the plain production commands can load production environment files. Use [admin.md](admin.md) for intentional read-only production inspection.

Preserve useful historical findings, but apply current contracts. The original MVP's localStorage authority, no-account scope, three-answer eligibility and old map are historical; their plans are not instructions to rebuild those behaviors.
