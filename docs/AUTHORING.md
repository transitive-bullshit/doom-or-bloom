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

## Participant question quality

Follow the [full prompt audit and recorded demo feedback](prompt-quality-review.md). Every prompt must elicit an actionable belief, expectation, mechanism, value or update condition. Source location alone is not useful belief evidence. Write an example answer and specify what it could change in the assessment; context-dependent wording requires an actual antecedent, not merely broad vector coverage. During local development, delete rejected questions from every local draft catalog; do not retain soft deletes or a retirement registry. Saved issued instances remain participant history and a missing pending question offers a different question. Frozen reviewed releases retain their separate versioning contract. Watch items require further revision/evaluation.

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

Follow [SOURCES.md](SOURCES.md) for required-source coverage, genre, recency, date/version pinning and reassessment of the historical seed. The original approximate counts below are a coverage guide; the later user decision prioritizes every required source and balanced reviewed topical coverage over symmetric counts.

Use [JOURNEYS.md](JOURNEYS.md) for common-opinion paths and terminology boundaries. The full Notion risk/concept rows live outside the runtime bundle in `content/context/`; their links are preserved in source intake. Keep arguments, illustrations, definitions and empirical evidence distinct. Draft published journeys guide development; separately reviewed held-out conversations establish semantic validation.

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

Each finding specifies required evidence, disqualifiers, tone, and compatible recommendations. For the MVP, show complete supporting answers through bounded disclosure. Do not require passage selection or runtime quotation extraction.

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

Local draft assembly preserves original authoring files and records their paths, versions and hashes in the target release's `provenance.json`. New reference copies receive the target content version while retaining source dates, access scope and review status. A pinned release manifest lets existing assessments continue with their original corpus; restart adopts the current release. The current draft assembly changes release metadata and local inclusion wording while preserving the graph, rubrics and interpretation rules. It does not complete source review or publish a reviewed assessment.

Content hashes include the release provenance and payload assets; the manifest that contains those hashes is excluded to avoid a self-reference. Freezing writes the reviewed descriptor to the current and pinned release manifests, and requires every required intake original to have compatible, human-reviewed snapshots in that release. A scoped partial mapping or a complete alias index cannot satisfy that gate by itself.

Demo recommendations can carry an authored priority from 0 to 1 for curation among equally relevant eligible resources. This affects resource ordering only; runtime mention/grounding boosts are paused; familiarity gates still apply, and selected resources diversify their learning purpose. Priority never changes assessment scores.

## Local content inspection

Use development-only `/questions` and `/corpus` to inspect the active built-in graph and snapshots. These are read-only tools; editorial feedback forms and the save API have been removed. See the [local debugging guide](local-debugging.md) and [participant prompt audit](prompt-quality-review.md) for inspection and revision context. Historical project notes remain on disk but are not loaded by the app.

## Current demo authoring boundary

Algorithm 0.4.0 pauses runtime corpus identification/grounding; retain source assets and review gates for offline authoring. Grounded understanding now concerns the fit between the participant’s claim and the basis they offer, without external fact-checking or a citation requirement. The shared rubric remains an unfrozen draft; labels/meanings now explicitly distinguish expectations, policy, reasoning, participant conviction and evaluator confidence. Interpret/project questions carry full dimension definitions; routing receives a named definitions map. Keep these meanings and debug help aligned rather than assuming internal IDs convey semantics.

Evidence readiness is a separate draft coverage policy, described in [ASSESSMENT.md](ASSESSMENT.md#question-budget-and-readiness). It never changes rubric scores. User journey/evaluation work should include one comprehensive first reply, several sparse/repetitive replies and correction/ambiguity paths, with identical quality rules across outlooks.

Resource conditions may explicitly use `basis: topic` when relevance requires supported discussion rather than a placed position. Topic conditions require component evidence and cannot specify score bounds or `assessed: false`; ordinary position conditions retain their numerical gates. This lets an expressed unknown qualify for useful reading without inventing a forecast. Among eligible resources, supported unplaced topics and unresolved non-reference issues rank before editorial priority. Shortlists diversify both topic and learning purpose. An optional authored `question` states what to investigate; it must not presuppose a position merely because that topic was discussed. Saved older results without a question remain readable.
