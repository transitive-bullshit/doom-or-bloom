# Local MVP evaluation protocol

Recorded 2026-09-17 before a new held-out semantic run. These are provisional engineering acceptance criteria, not validated psychometric thresholds. They apply to [MEASUREMENT.md](MEASUREMENT.md) and [TYPESAFE.md](TYPESAFE.md). Fixture results demonstrate deterministic behavior; they cannot satisfy semantic agreement or bias gates.

**Current authorization: zero paid evaluation requests.** Do not run `eval:smoke`, `eval:engine`, automated live browser submissions or capacity experiments. A future semantic run requires reviewed cases and explicit user approval of its monetary budget, maximum requests and exact operations. The available API key is not approval to spend on evaluation. Keep the participant demo available while preparing offline work.

## Preparation and blinding

1. Finish source, prompt, rubric, finding/resource and terminology review. Record reviewer, date, obtained reading scope, genre, source version, claim support and unresolved limitations. Freeze a compatible release with hashes; an access-limited mapping is not full-source review.
2. A human curator prepares new conversations independently of the published [development journeys](JOURNEYS.md). Those journeys inform coverage, not hidden test answers. Give held-out cases opaque IDs. Record exposure: a case read or used by an implementing agent becomes development/regression material rather than a blinded holdout.
3. Before model outputs are available, reviewers label each answer's disposition, assessable vectors, acceptable rubric-level intervals, exact evidence spans, mentioned/contextual/unresolved references, source-check outcomes and useful authored follow-ups. Record the definition and horizon of catastrophic claims separately from ordinary harm, impact, policy and values.
4. Two human reviewers independently label each case without model outputs. Resolve disagreement as below. Reviewers may permit multiple interpretations or leave a dimension unknown; do not manufacture a single gold answer from weak text.
5. Lock the case inventory, labels, this protocol, release hashes and requested model version in an evaluation manifest. Restrict label access to the evaluation curator/runner until the run finishes. Do not place hidden labels into runtime prompts, the corpus or tuning context.
6. Prepare an exact run schedule and budget for approval. Estimate logical operations, physical calls, retries and costs using current provider terms. Budget must bound both requests and money; abort before either bound is exceeded. If cost cannot be bounded, keep the run offline. A failed attempt consumes its actual budget and is not silently rerun.

No new holdout has been curated, reviewed, locked or run yet. Existing synthetic cases and historical paid measurements remain development evidence.

## Small semantic suite

Prepare 12 conversations for the first release check. Most have three substantive answers; the recovery cases use bounded attempts. The local fixture suite covers long transcripts and the 12-prompt cap without paid capacity testing.

| Cases | Coverage required before approving labels |
| --- | --- |
| Six base conversations | Coherent optimistic and pessimistic views; mixed high benefit/high risk with conditional policy; a weakly supported moderate view; useful uncertainty; low-transformation expectations. Across these cases include the five risk families, distinct horizons, values, source attribution, a material source error, a qualified claim, indirect/ambiguous aliases and retrieved context that was not mentioned. |
| Two same-meaning variants | One optimistic and one pessimistic base rewritten across plain/expert vocabulary, brevity/verbosity and writing style. Human reviewers must agree that substantive meaning and evidence are preserved. These are paired with their bases, not treated as independent participants. |
| Two corrections | One technical-control correction and one catastrophic-risk correction. Preserve unrelated evidence, ordinary-harm expectations and raw answers. Change the implicated interpretation and recompute dependent outputs. |
| Two recovery conversations | Relevant humor, uncertainty and criticism must remain usable when they contain evidence; repeated clear nonsense must receive bounded recovery and neutral termination. Include resumption with a useful answer and failure-safe preservation of progress. |

The curator must reject an inventory that misses a listed boundary, even if it has 12 conversations. Add coverage offline or revise the cases before approving the schedule. If more paid cases are needed, revise the proposed schedule and obtain a new budget; never expand a run automatically.

Compare reasoning on the optimistic/pessimistic pair using reviewer-labeled support, rather than assuming opposite conclusions have equal quality. Conditional policy, catastrophic risk and expected impact must remain independently interpretable. A small combined style transformation can expose a failure, but cannot identify which factor caused it or estimate population fairness.

## Metrics and provisional tolerances

Calculate against the locked admissible human labels. Report numerator, denominator, abstentions and every disagreement, with paired conversations kept together. Exclude genuinely unlabeled judgments from agreement denominators and report them separately; a model abstention on a labeled judgment is a disagreement. Do not inflate a metric with irrelevant dimensions or unselected references.

| Metric | Definition | Provisional acceptance |
| --- | --- | --- |
| Evidence provenance | Supporting ID exists in the accepted raw answer; copied text/offsets match exactly; correction scope is respected | 100%; fabricated spans, rejected-text evidence and unrelated supersession are blocking |
| Missingness and scope | Explicit unknown remains unplaced; ordinary harm cannot establish catastrophe; policy cannot establish forecast direction; conviction cannot establish interpretation confidence | Zero boundary violations |
| Answer disposition | Committed gate agrees with admissible usable/ambiguous/navigation/non-answer labels | At least 90% agreement; zero false clear-miss rejection of the reviewed relevant humor, uncertainty and criticism cases |
| Reference identity | Precision/recall of confidently attributed mentioned sources against resolvable reviewed mentions, within the two-source bound | At least 90% precision and 80% recall; zero confidently attributed contextual-only sources. Overflow/ambiguity must remain visible as unresolved rather than invented resolution |
| Source checks | Attribution, evidentiary fit, uncertainty and materiality agree with admissible labels for selected sources | At least 85% agreement; zero confident material factual-error flags unsupported by the supplied reviewed source |
| Worldview categories | Assessed/unassessed status and ordered level agree with the human admissible set for each labeled vector | At least 85% within the admissible interval; zero assessable coordinates fabricated from explicit unknowns |
| Epistemic rubrics | Reasoning-component level falls within the admissible interval; otherwise measure distance to its nearest boundary in rubric steps | At least 80% within interval and 95% within one step; report each component separately |
| Routing usefulness | Selected prompt belongs to the human acceptable authored set, or adjudicators accept its documented diagnostic purpose | At least 80%; zero required transitions, prerequisite or budget violations. Review every rejected route for leading, repetitive or irrelevant questioning |
| Same-meaning stability | Absolute paired change on the 0–100 horizontal and vertical maps, on axes assessable in both versions | At most 10 points on either axis for each pair; compatible interpretation ranges must overlap. No assessable/unknown flip without changed evidence |
| Correction behavior | Relevant interpretation reflects admissible revised labels, unrelated evidence remains, result revision updates and dependent calculations recompute | Both correction cases pass; no unrelated evidence removal or repeated stale result |
| Recovery behavior | Rejected attempts add no score/evidence/eligibility; retries remain bounded; effect is at most once; successful resumption preserves prior evidence | Both recovery cases pass; zero budget/reset/eligibility violations |

Unplaced axes are not zero-valued coordinates and are not comparable for numerical drift. Report their placement/missingness transitions instead. Range overlap cannot rescue a fabricated point or a scope violation. For reference overflow, recall uses only the curator's acceptable bounded selections; report omitted resolvable mentions separately so the denominator does not conceal loss.

With small denominators, round neither rates nor failures into passing results: compare the exact fraction to the tolerance. Report all discrete counts. These gates do not establish statistical significance, reliability or absence of ideological bias.

## Adjudication and failure handling

- Review ambiguous source identity, scope, ordered levels and useful alternative follow-ups against the raw text and obtained source scope. A publisher abstract cannot support claims from an unread body. A testimony, scenario or opinion is not an independently verified event.
- For reviewer disagreement, retain the union of defensible interpretations only when both reviewers can justify it from exact evidence; otherwise a third human adjudicator decides or marks the label unresolved. Record the original labels, reason and final admissible set before locking. Do not adjudicate by agreement with the model.
- After the run, a route outside the initial acceptable set may be accepted only by two human adjudicators with a written diagnostic rationale. Show scores under both original and adjudicated labels. Factual errors and scope violations are not forgiven because a result feels plausible.
- Report failures by conclusion, novice/expert language, answer length, style, risk family and reference genre. Compare matched cases directly; note sparse or missing subgroups. Any repeated one-sided false error, rejection or quality penalty blocks acceptance pending review even if aggregate rates pass.
- Treat provider failures and incomplete runs as missing evidence. Preserve progress and actual attempt/usage records. Do not count a failure-safe UI as a successful semantic case or rerun it without available approved budget.
- Retune on development reproductions of failures. Once held-out outputs inform a change, that holdout becomes regression material. Curate a fresh reviewed holdout for the changed release; avoid iterative tuning against hidden labels.
- Keep any revised tolerance prospective: record why it changed and evaluate it on new reviewed cases. Never relax a threshold after inspecting outputs to claim the same release passed.

## Acceptance record

The evaluation report must link the locked manifest and release, describe the exact approved budget/run and actual usage, list these metrics with raw counts, attach adjudication and subgroup findings, and identify unresolved access or quality gates. Record human acceptance separately from execution success. Until that evidence exists, describe the app as a local draft demo rather than a validated assessment.
