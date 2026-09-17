# Authoring and Content Specification

## Authored runtime assets

The live application uses versioned, reviewed assets rather than runtime prose generation:

- Worldview and epistemic rubrics.
- Prompt families and exact prompt variants.
- Conversation-graph transitions and eligibility rules.
- Findings and participant-facing explanations.
- Resource metadata and recommendation conditions.
- Reference corpus entries.
- Test conversations and expected judgments.

Local Codex workflows may propose and refine these assets. Human review owns publication.

## Conversation graph

Each prompt should define at least:

```yaml
id: mechanism.general.001
text: What makes that outcome seem most likely to you?
family: mechanism
reading_level: general
prerequisites: []
exclusions: []
targets:
  worldview: [risk_landscape, beneficial_potential]
  epistemic: [causal_clarity]
estimated_effort: low
novelty_group: causal_basis
clarification_variants: []
content_version: 1.0.0
```

The exact schema can change, but stable identifiers, targets, effort, prerequisites, exclusions, and version provenance are required.

### Prompt-writing rules

- One cognitive task per prompt.
- Prefer ordinary language and short sentences.
- Do not introduce jargon merely to test whether the participant knows it.
- Ask for concrete mechanisms or scenarios before abstract taxonomy.
- A clarification should state the inferred dependency neutrally and invite correction.
- Avoid loaded premises, ideological labels, praise, shame, or debate-club symmetry.
- Author novice and expert variants when the same diagnostic goal requires different language.

### Recovery assets

Author a short initial re-ask, a neutral ambiguity clarification, and an exhausted-attempt message for each prompt or compatible family. Rephrasing must preserve the elicitation goal; the fixed root retains its wording and adds guidance below it. Supply deterministic alternative-question fallbacks for participants without usable evidence. Define compatible recovery variants in the graph and validate their IDs alongside ordinary transitions.

Include the paperclip interlude's copy and recovery actions in the representative review packet. Pair examples of entirely unrelated/nonsense replies with relevant humorous replies, skepticism, brief uncertainty, and non-native-English answers so the rubric does not equate tone with lack of evidence. Examples must cover a successful retry, uncertain relevance, the attempt limit, and preserving an existing valid profile after later off-topic replies. Follow the limits and dispositions in [ASSESSMENT.md](ASSESSMENT.md#answer-relevance-and-bounded-recovery); do not duplicate their numeric configuration in individual prompt assets.

## Reference corpus

MVP target:

- Approximately 100 people or institutions.
- Approximately 100 incidents or capability demonstrations.
- Approximately 100 canonical publications or public arguments.

Each item is a canonical simplified Markdown file stored locally with machine-readable front matter or an equivalent structured header.

### Suggested entry shape

```yaml
id: event.openai-hugging-face-2026
kind: event
title: OpenAI–Hugging Face security incident
aliases:
  - Hugging Face hack
  - rogue agent swarm
date_start: 2026-05
date_end: 2026-07
entities:
  - org.openai
  - org.hugging-face
topics:
  - loss-of-control
  - cyber
  - reward-hacking
  - multi-agent-coordination
status: reviewed
content_version: 1.0.0
sources:
  - url: https://...
    type: primary
    accessed: YYYY-MM-DD
```

Body sections should include:

1. Neutral short description.
2. Directly observed or officially reported facts.
3. Material interpretations and why they differ.
4. Known unknowns and disputed details.
5. Claims the item supports strongly, weakly, or not at all.
6. Related entries.
7. Review notes and source metadata.

Avoid long copied passages. Prefer paraphrase and links to primary sources.

## Resource library

Every recommended resource needs:

- Stable identifier and source metadata.
- Topic and worldview-vector coverage.
- Intended familiarity level.
- What question it helps answer.
- Positions it supports, challenges, or contextualizes.
- Recommendation conditions and exclusions.
- Reading length or effort.

Selection should optimize relevance and diversity of learning purpose—not mechanically assign an “opposing view.”

## Findings library

Findings are authored templates grounded in evidence-ledger conditions. Useful classes include:

- Demonstrated reasoning strength.
- Material causal assumption.
- Unresolved tension.
- Factual or conceptual knowledge gap.
- Underexplored upside or risk.
- High-leverage crux.

Each finding specifies required evidence, disqualifiers, tone, and compatible recommendations. Participant excerpts may be inserted only through deterministic copying.

## Semi-automated authoring workflow

1. Define or revise the ontology and target coverage.
2. Use local agents to propose prompts, rubrics, reference entries, findings, and synthetic conversations.
3. Deduplicate and normalize identifiers and terminology.
4. Ground factual entries in sources, prioritizing primary material.
5. Human-review for accuracy, neutrality, reading level, and hidden assumptions.
6. Run the complete evaluation suite and inspect subgroup failures.
7. Freeze assets into a content release with a changelog.
8. Deploy new assessments on the new release; preserve versions for resumable assessments when feasible.

Synthetic data helps discover failures but is not sufficient validation. Add voluntarily supplied or explicitly consented real examples to the offline evaluation process separately from anonymous production analytics.

## Versioning

Track independently:

- `assessment_version`: workflow and profile semantics.
- `content_version`: prompts, references, findings, and resources.
- `rubric_version`: Jev criteria and composition rules.
- `model_version`: resolved Jev model identifier when available.

Never silently reinterpret historical aggregate results across incompatible versions. Maintain migrations only where semantic equivalence is defensible.
