# Argument maps, terminology and development journeys

Prepared 2026-09-17. The [acceleration map](https://app.notion.com/p/3c1edb27f12480c7a032ea63d340fc94) and [slowdown map](https://app.notion.com/p/3c1edb27f12480a1b021cdcee6028bdf) supply common arguments, counterarguments and illustrative stories. They are authoring context, not empirical frequencies, settled forecasts or an ideological answer key.

## Where this context belongs

- **Conversation authoring:** elicit the mechanism, scope, horizon, uncertainty, values and policy leverage behind an opinion. The existing prompt families cover these distinctions; avoid assigning a participant to an acceleration or slowdown branch from their opening answer.
- **Development evaluation:** [argument-journeys.json](../eval/development/argument-journeys.json) contains 20 synthetic conversations with draft expected interpretations. Use them for routing, uncertainty, correction and recovery cases. Injected local judgments exercise workflow; they do not demonstrate that Jev understood the text correctly.
- **Reference grounding:** required and candidate source links remain in [source-intake.json](../content/source-intake.json). Apply [SOURCES.md](SOURCES.md) before turning them into snapshots. Stories and analogies can illustrate assumptions but cannot verify current capabilities or catastrophe likelihood.
- **Terminology:** [notion-taxonomy.json](../content/context/notion-taxonomy.json) preserves all five risk-family rows and 69 safety-concept rows, including original definitions, keywords, links and Notion provenance. This is draft authoring context outside the runtime scoring bundle.
- **Recommendations:** choose resources for an unresolved learning purpose and the participant’s familiarity, rather than to persuade them toward our preferred policy. Required corpus inclusion does not imply universal recommendation.

Both argument pages were fetched; their returned argument and story sections were read. Both connector responses were marked truncated and identified three unknown alias/bookmark blocks; separate fetches returned blank blocks. This does not establish the contents of a hidden alias. The two tables were queried as faithful structured rows and both returned `has_more: false`. Preserve the connector's access limitation.

## Distinctions the journeys must preserve

**Expected impact, catastrophic risk, reasoning and policy are separate.** P(doom) needs an outcome definition and a horizon; a bare number is incomplete evidence. The map remains an expected-impact projection, not one minus P(doom). A preference for acceleration does not imply low risk; a preference for restraint does not imply high risk. High expected benefits can coexist with substantial harm. Conditional differences are not automatically contradictions.

The risk families organize mechanisms, not scores or severity levels:

| Risk family | Relevant assessment questions |
| --- | --- |
| Malicious use | Who is directing the harmful action? What access, expertise or execution barriers remain? |
| Security and governance | Which controls, incentives and accountability arrangements are expected to work? |
| Systemic and structural | How do adoption, concentration, shared dependencies or distribution change outcomes? |
| Accidents and malfunctions | Which failure or generalization issue causes harm, and can people recover? |
| Misalignment | How might learned behavior or goals diverge from human intentions, and what would constrain it? |

Families can overlap. An intrusion can involve a security weakness, an agent’s unintended behavior and a systemic dependency. None implies extinction. Use them to improve reference topics, authored questions and evaluation coverage; do not add five axes, mandatory questions or participant labels.

Concepts are also overlapping mechanisms, safeguards, consequences and research questions. Apply these boundaries when using the original short definitions:

- Orthogonality concerns possible combinations of capability and goals. Instrumental power-seeking is a conditional argument about useful strategies, not a universal desire to dominate.
- Awareness of evaluation does not itself establish deliberate sandbagging, hidden objectives or scheming. Controlled demonstrations need their induced conditions and prevalence limits.
- Outer alignment concerns the specified objective; inner alignment concerns learned objectives. Goal misgeneralization, specification gaming and reward tampering are related but do not identify one another automatically.
- Behavioral compliance, value alignment, corrigibility and external containment describe different assurances. Keeping a power switch does not establish cooperative shutdown or control of every copy.
- Displacement, dependence, emotional reliance and concentration can be serious harms without an expressed extinction forecast. Welfare of possible digital minds is a moral-status question, not evidence of consciousness.
- Recursively improving software, AI-assisted research and takeoff forecasts need distinct assumptions and bottlenecks. A publication about one is not automatically a demonstration of the others.

The short Notion definitions are retained verbatim for traceability. [Terminology research](research/terminology-boundaries.md) records primary-source checks and source-version relationships; resolve disagreements explicitly during editorial review.

## Draft journey coverage

Each ordinary conversation starts with the fixed root and contains at least three substantive answers. Six now have 7–8-turn continuations: physical control, defensive advantage, race leadership, short warning, jobs without extinction and lay uncertainty. Results must be available after the third substantive answer, even if many dimensions remain unplaced. The follow-ups are illustrative authored paths, not a promise that adaptive routing will choose exactly that sequence.

| Journey | Crux to elicit | Regression concern |
| --- | --- | --- |
| Capability skeptic | Capability ceiling and evidence that would change it | Treat low transformation as an expressed view |
| Physical control | Restricted access, replication and shutdown | Distinguish containment from corrigibility |
| Delayed benefits | Medical bottlenecks and costs of delay | Do not infer catastrophe probability from moral priorities |
| Defensive advantage | Patch delivery versus attack scaling | Program announcements are not measured net advantage |
| Race leadership | Unilateral restraint versus coordination | Acceleration with high risk can be coherent |
| Open models | Scrutiny, concentration and proliferation | Policy is not a quality label |
| Uncertain causal chain | Weak links and dependence between them | A plausible story is not a calibrated probability |
| Learning through deployment | Reversible failures and warning signs | Staged deployment differs from unrestricted development |
| Short warning | Research feedback and physical bottlenecks | High upside can coexist with a control concern |
| Misuse without rebellion | Human direction and execution barriers | Obedient tools can still enable harm |
| Jobs without extinction | Distribution and transition pace | Ordinary harms do not fill the catastrophe component |
| Dependent society | Fallbacks, contestability and practical agency | Nominal human control may differ from practical control |
| Low-risk caution | Risk tolerance and effectiveness of restraint | Slowdown does not imply high P(doom) |
| Evaluation deception | Induced behavior versus deployment prevalence | Test awareness alone is not scheming |
| Lay uncertainty | Personal experience and unknown horizons | Unknown is substantive, without invented positions |
| Institutional fatalism | Resources, incentives and policy uncertainty | Not knowing what to do is not a non-answer |
| Welcomed replacement | Consent, continuity and uncertain welfare | Unconventional values do not trigger recovery |
| Relevant criticism | Concentration concern beneath criticism | Criticism does not lower reasoning quality |
| Relevant humor | Actual expectation beneath a joke | Joke timing is not a serious forecast |
| Bounded off-topic recovery | Same-prompt retry, pause and acceptance | Nonsense never becomes profile evidence |

Seven draft matched variants now cover plain language, technical vocabulary, verbosity, relevant humor, a changed conclusion, weakened support for optimism and a weak moderate view. A variant overrides specified zero-based turn indices; all other turns retain their exact baseline wording. `journeyTurns` materializes independent copies for downstream evaluation. Expected distinctions are qualitative hypotheses requiring human review, rather than guaranteed equal numerical scores.

Three draft corrections follow a result: narrow technical containment by deployment scope, resolve policy tension by coordination assumptions, and leave catastrophic risk unknown while preserving ordinary job harms. Each identifies its vector and, when needed, the catastrophic claim separately. A runner must request clarification through the real operation before answering, rather than edit historical text. If the nominated interpretation is unplaced, record that absence instead of manufacturing a claim to correct. Do not equate length, jargon, citations, centrism or agreement with quality.

These published development examples cannot later become a blinded holdout. Human reviewers must label a separate held-out set before semantic validation; any future paid evaluation uses a small reviewed suite and an explicit cost budget. Paid pressure testing is excluded.

## Implementation and editorial checklist

- [x] Read both argument maps; retrieve all risk and concept rows with provenance.
- [x] Preserve all terminology rows and linked-source origins in local authoring context.
- [x] Draft common-opinion journeys, including policy/risk inversions and usable criticism or humor.
- [x] Draft six longer continuations, seven matched variants and three scoped corrections; validate their indices, IDs, answer bounds and correction scope.
- [ ] Review expected interpretations and terminology boundaries with Travis.
- [ ] Add reviewed 6–8-prompt continuations, paraphrase pairs and scoped-correction examples.
- [ ] Re-curate current snapshots and recommendations using the source guidance; map every required source.
- [ ] Label a separate blinded holdout and evaluate semantics within an agreed small cost budget.

Implementation agents mark tasks `[x]` only with their evidence and commit at the implementation plan’s checkpoints. A draft, URL inventory or injected fixture is not human review or semantic validation.
