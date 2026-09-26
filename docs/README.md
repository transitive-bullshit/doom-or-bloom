# Project guide

Doom or Bloom helps people understand their AI worldview and the reasoning behind it. The current product is a bounded adaptive self-assessment with a faithful, correctable snapshot as its goal. Neutral, evidence-grounded Socratic follow-up is a future direction; clearer discussion of AI futures is the broader ambition. See [the North Star](PRODUCT.md#north-star).

## Get oriented

1. Read [architecture.md](architecture.md) for the request flow, module boundaries, domain objects, and reasons behind the design.
2. Use [CONTRIBUTING.md](../CONTRIBUTING.md) to run the app. It covers environment selection, native Postgres, and the generated persona data a fresh checkout may lack.
3. Read the contract for the area you are changing below, then use [testing.md](testing.md) to choose validation. There is no need to read every plan or research report before making a change.

## Current baseline

- The app has server-authoritative persistent assessments, anonymous ownership, optional X login/recovery, opt-in publication, owner forks, and curated simulated-user profiles. Production exists; the default development scope is local. [Production readiness](production-readiness.md) records dated hosted verification and remaining checks.
- A new assessment has a 12-prompt budget. Forks add up to 12 within a 30-prompt inherited-conversation ceiling. Results depend on evidence readiness, potentially after one substantial answer; readiness is an experimental heuristic, not validation of the participant's reasoning.
- The featured map shows expressed outlook against expected transformation. Reasoning and human influence are separate views. Missing evidence, participant uncertainty, interpretation confidence, and event probability have different meanings; see [ASSESSMENT.md](ASSESSMENT.md).
- Participant assessments use complete answers. Offline persona generation additionally uses excerpts and richer experimental views. Jev judges authored choices; code selects questions, computes results, and controls state. Runtime corpus grounding is paused; the app does not externally fact-check answers.
- The app is implemented, but its draft rubrics, source corpus, and semantic evaluation are not a validated assessment. Human editorial review and reviewed held-out evaluation remain open. Simulated people are development evidence and public illustrations, not endorsements or substitutes for participant validation.

Look up current versions and limits in [lib/assessment/schema.ts](../lib/assessment/schema.ts), active authored assets in [content/manifest.json](../content/manifest.json), and commands in [package.json](../package.json). Saved results retain their provenance; changing defaults does not authorize recomputing old assessments. The content manifest's compatible assessment version is distinct from the current engine version.

## Choose the relevant contract

| When changing… | Read… |
| --- | --- |
| Product scope, participant experience, map or result UI | [PRODUCT.md](PRODUCT.md) |
| Domain names or distinctions between identity, evidence, judgments and results | [CONTEXT.md](CONTEXT.md) |
| Dimensions, routing, recovery, readiness, projections or corrections | [ASSESSMENT.md](ASSESSMENT.md) |
| Jev inputs, semantic/code boundaries, batching or inference failure handling | [TYPESAFE.md](TYPESAFE.md) |
| Database state, ownership, lazy drafts, operation recovery, public access, caching, forks or X auth | [PERSISTENCE.md](PERSISTENCE.md) |
| Prompts, rubrics, findings, recommendations or versioned releases | [AUTHORING.md](AUTHORING.md) |
| Source intake, access limits, freshness or balanced coverage | [SOURCES.md](SOURCES.md) |
| Opinion coverage, argument maps or safety terminology | [JOURNEYS.md](JOURNEYS.md) |
| Simulated-user research, generation, storage or review | [user-journeys.md](user-journeys.md) |
| Analytics, privacy or assessment validity | [MEASUREMENT.md](MEASUREMENT.md), [evaluation-protocol.md](evaluation-protocol.md) |
| Local diagnostics, provider failures or internal review tools | [local-debugging.md](local-debugging.md) |
| Read-only local/production inspection | [admin.md](admin.md) |
| Phone or remote-browser development | [remote-testing.md](remote-testing.md) |
| Deployment or hosted acceptance, when requested | [production-readiness.md](production-readiness.md) |

## Decisions and previous work

[Architecture decisions and lessons](architecture.md#decisions-and-lessons) links the investigations most useful when modifying the engine or persistence. For deeper context:

- [Original MVP plan](mvp-implementation-plan.md): implementation history and unfinished editorial/evaluation gates. Its browser-only architecture and original scope are superseded.
- [Persistence plan](persistence-implementation-plan.md): completed implementation checkpoints and later dated change/verification records. Use the current contracts above for behavior.
- [Current-context editorial packet](current-context-review-packet.md): approved authoring direction; [prompt-quality review](prompt-quality-review.md): question wording and routing findings.
- [Source coverage index](research/source-coverage-2026-09-17.md): required-source intake and access gaps. Research reports under `docs/research/` retain dated evidence, source scopes, and run provenance.
- [Simulated-user workflow](user-journeys.md): links to persona cohorts, source refreshes, fidelity audits, and regeneration records. Use these reports when changing the affected briefs, not as current catalog counts.

## Maintaining these docs

The canonical contracts describe agreed behavior; code and tests show what is implemented. When they disagree, verify the intended decision and fix the stale description or implementation explicitly. A dated report or completed plan does not override a current contract. Label proposals and unimplemented work where they appear.

Keep this index as a task router. Put new verification evidence in the relevant plan/research record and link enduring lessons from the architecture guide. Update a rule at its owning contract rather than appending competing overrides to several docs. Keep exact dependency versions, catalog counts, and script inventories in their executable sources unless a dated measurement needs them.

## Locked product language

- **Name:** Doom or Bloom
- **Domain:** doom-or-bloom.com
- **Subtitle:** Map your AI worldview, one question at a time.
- **Root prompt:** What do you think AI means for our future—and why?

The provocative Doom/Bloom framing must not become a forced binary classification.
