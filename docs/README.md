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

## Locked language

- **Working name:** Doom or Bloom
- **Domain:** doom-or-bloom.com (purchased by Travis)
- **Subtitle:** Map your AI worldview in three questions.
- **Root prompt:** What do you think AI means for our future—and why?

## Status

The product-level decision frontier is closed for MVP planning. Exact scoring weights, prompt variants, rubric wording, corpus entries, and visual design remain authored assets to create and validate; their governing rules are specified here.

These documents are a design handoff, not a deployed application or validated assessment. The 300-entry corpus and the evaluated Jev rubric suite are specified but have not been authored in full. API cost, latency, and classification quality have not been benchmarked. The 45-question early warning is a proposed operational default; the 50-question hard cap is agreed.

The working name deliberately emphasizes the provocative Doom/Bloom contrast. This framing trade-off belongs in methodology documentation and evaluation; it must not become a forced binary classification.
