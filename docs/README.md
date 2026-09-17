# Doom or Bloom — Design Handoff

_Map your AI worldview in three questions._

This package defines the product and assessment contract for a bounded, adaptive AI-worldview self-assessment. It is intentionally upstream of a repository-specific implementation plan.

## Canonical documents

1. [PRODUCT.md](./PRODUCT.md) — product promise, participant journey, scope, and UX contract.
2. [ASSESSMENT.md](./ASSESSMENT.md) — worldview model, epistemic evaluation, routing, readiness, and result semantics.
3. [TYPESAFE.md](./TYPESAFE.md) — Jev composition and the boundary between semantic judgments and deterministic code.
4. [AUTHORING.md](./AUTHORING.md) — conversation graph, reference corpus, offline authoring workflow, and versioning.
5. [MEASUREMENT.md](./MEASUREMENT.md) — analytics, privacy, evaluation, and experimental success signals.
6. [CONTEXT.md](./CONTEXT.md) — canonical domain glossary.
7. [SOURCES.md](./SOURCES.md) — required source library, recency, genre and corpus review.
8. [JOURNEYS.md](./JOURNEYS.md) — argument maps, risk/concept terminology and development conversations.

## Locked language

- **Working name:** Doom or Bloom
- **Domain:** doom-or-bloom.com (purchased by Travis)
- **Subtitle:** Map your AI worldview in three questions.
- **Root prompt:** What do you think AI means for our future—and why?

## Status

The product-level decision frontier is closed for MVP planning. Exact scoring weights, prompt variants, rubric wording, corpus entries, and visual design remain authored assets to create and validate; their governing rules are specified here.

The local app is implemented with labeled draft assets; it is not yet a validated assessment. Required-source coverage, balanced reviewed content and reviewed semantic evaluation remain incomplete. The earlier 300-entry count is now a coverage guide; source quality and the required library take precedence. The local bound is 12 lifetime prompts with a warning at 10, superseding the original 50-prompt proposal. Paid pressure testing is out of scope; existing measurements are historical development evidence.

The [revised editorial packet](current-context-review-packet.md) records approved authoring direction and demo priority. New assessments use the `0.4.0-draft` bundle with 138 references and 14 recommendations; saved `0.2.0-draft` and `0.3.0-draft` assessments retain their earlier 42- and 135-reference corpora. The [coverage index](research/source-coverage-2026-09-17.md) links all required originals, current copies, authoring scopes and remaining gaps. Individual factual/semantic review remains open. Source intake records scoped research for all required URLs; access and corpus review gates remain open.

The [participant prompt audit](prompt-quality-review.md) records demo feedback, four deleted questions and remaining context/wording risks from the original 34-entry audit. All local draft catalogs now contain 30 questions, with no soft-delete registry. Saved issued questions and answers remain readable as participant history.

The working name deliberately emphasizes the provocative Doom/Bloom contrast. This framing trade-off belongs in methodology documentation and evaluation; it must not become a forced binary classification.

[Local debugging guide](local-debugging.md) covers persisted Jev exchanges, the development-only `/questions` and `/corpus` review tools, and versioned feedback stored in the project.
