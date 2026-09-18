# Live journey improvement loop — September 19

This continues the [initial reflection](journey-reflection-2026-09-18.md). These are development observations from real Jev judgments and OpenAI participant replies, not predefined persona scores or held-out validation.

## Evidence

Two fresh adaptive suites completed all ten personas, with five accepted answers and a result each. Both used the application's actual interpretation, recovery, routing and projection logic. Each made 50 OpenAI requests and 110 physical Jev requests, with no failures or unknown reserved cost.

| Saved run | Estimated API cost | Purpose |
| --- | --: | --- |
| `1789757412411-29c39e24-96f6-4ce3-aa90-c6037eb66668` | $0.1316 | Check the uncertainty, correction and evidence-preservation checkpoint |
| `1789757696323-4dd6399f-3c7f-4c96-a190-d40732163109` | $0.1335 | Check the revised evidence-presence rubric and subsequent uncertainty fixes |

Full local inputs, outputs and decisions are saved under `eval/runs/journeys/<run>/suite.json`. No persona's fixture scores were supplied to either model. Generated answers differ between runs, so coordinate differences alone are not an estimate of the effect of a code change.

## Findings and changes

**Poor reasoning was sometimes treated as missing evidence.** In the first suite, the dogmatic participant explicitly dismissed a counterargument. The projection judged counterargument engagement at 0.01 on the 0–3 scale, but its presence judgment assigned only 0.36 combined support. Interpretation also failed to establish the evidence. The engine correctly followed those judgments, but consequently omitted an observable weakness from the reasoning aggregate.

The presence instructions now distinguish evidence quality from evidence existence: explicit dismissal or refusal can demonstrate a low rubric level; silence still remains unassessed. A three-request Jev probe held the saved text fixed. Support for the dismissal became 1.00 in interpretation and 0.75 in projection, while the novice's opening remained below the support threshold for counterargument engagement. The local probe is `eval/runs/negative-evidence-1789757657011.json`. In the second full adaptive run, the dogmatic participant's actual dismissal produced a supported counterargument component of 0.023 on the normalized scale. This is evidence of the intended behavior, not a required persona score.

**Explicit catastrophic-risk uncertainty disappeared from the fingerprint.** Other unknown positions retained a claim and evidence, but the separate catastrophe component became entirely empty. It now preserves a supported uncertainty claim and evidence while leaving the coordinate null. An engine regression covers projection and subsequent scoped clarification. Unsupported catastrophe still receives no invented claim or coordinate.

**An obsolete timeline survived a later withdrawal.** The unknown-timing helper used the latest timing answer, while the fingerprint and conviction eligibility searched independently for any earlier date. They now share the latest applicable timing context. A regression covers date → unknown → revised date; existing scoped-correction tests also pass.

**Generic reasoning findings crowded out worldview findings.** Nine of ten results in the first suite displayed the same causal/crux/scope trio because those entries came first in the catalog. Selection now reserves a place for a supported worldview finding alongside reasoning feedback, retaining authored order and the existing evidence, uncertainty-range and unresolved-tension gates. It never manufactures a worldview finding for an unplaced participant. The synthetic baseline diff records the deterministic presentation change; this change followed the second live suite and requires no new inference.

## What the live results support

The novice and explicitly undecided participant had unplaced outlooks in both suites. Conditional requirements for control no longer automatically become claims that control is feasible. The dogmatic participant's concrete dismissal and unjustified certainty produce weak corresponding reasoning components; well-explained pessimism and optimism can both score well. Playful recovery remains bounded and subsequently reaches a normal result.

Question selection responds to the actual answers. In the first suite the undecided participant received a timeline question, answered that timing was unknown, and subsequently received a milestone question rather than another demand for a date. Different governance questions can still appear consecutively; whether each adds enough value needs further scrutiny.

## Remaining verification and improvements

- Broaden the live action paths beyond five answers followed by projection: early results, continuation and participant-initiated correction.
- Check bounded provider behavior with long histories and multiple unresolved dimensions, including useful failure diagnostics.
- Continue reviewing findings for specificity and fidelity to their triggering dimensions, and whether the fingerprint adequately represents ordinary harms and policy preferences.
- The existing participant development server remains a separate environment issue: it began timing out during inspection and logged `write EIO`. It was not restarted or reset.

Verification for this checkpoint: formatting, lint, types, content validation, all 136 unit tests and all ten synthetic baseline comparisons pass. Four focused browser checks pass against an isolated credential-free fixture server, covering desktop/mobile journey inspection, saved comparisons, broad ranges and unplaced axes. The active participant session was untouched. These focused checks do not constitute the broader live action-path verification listed above.

The improvement goal remains open. Two successful suites establish observed reliability for these runs, not a guarantee that external API failures cannot occur.

## Extended results and correction pass

The repeatable command `pnpm journeys:live --exercise-results` now exercises early projection, continuation, a later projection, and a scoped correction answered by the actual OpenAI participant. The engine chooses the correction prompt from an existing result claim, with no target score. Intermediate results are retained and disclosed in the inspector. Comparisons include correction scope and intermediate claims; safe failure diagnostics distinguish participant, interpretation, routing and projection stages, and validation failures from transport failures.

Two complete adaptive runs each exercised all ten personas through all these actions without a failed operation:

| Run | Jev requests | OpenAI requests | Estimated cost |
| --- | --: | --: | --: |
| `1789758330255-7c3277f1-a599-4d10-b8ec-0cd917bafe9c` | 120 | 50 | $0.1437 |
| `1789758895224-ddf69b9c-17e8-4c70-8d1c-2fb1b28f6bb0` | 120 | 50 | $0.1465 |

The first exposed a specific scope error: a forecast of better paperwork tools over a decade became a forecast of transformative capability within decades. Merely clarifying the dimension meaning did not fully fix it. The independent assessability judgment now receives the actual authored score levels, requiring a position in their scope rather than a forecast about any related subject. Fixed-transcript live projection comparisons are saved at `eval/runs/projection-review/1789758667053-36bbc736-42be-4943-8a73-4fe477db2261/review.json` and `eval/runs/projection-review/1789758789163-6b8039af-3811-4e8a-aabf-729f99561905/review.json` (ten real Jev calls each, approximately $0.0194 combined). The latter preserves the playful participant's uncertainty while retaining the skeptic's low-ceiling position and an explicit transformative forecast. The earlier zero-call cached-projection artifact is not evidence of a retest.

A separate deterministic regression reproduced an avoidable operation failure through the actual Jev SDK with mocked transport: a valid multibyte history and 15 unresolved dimensions require five interpretation batches plus twelve routing batches. The former 16-request operation ceiling aborted the seventeenth successful request. The ceiling is now 24, with unchanged per-stage/operation deadlines, unchanged eight-question large-input batching, all 96 routing judgments and complete history preserved. Retry-exhaustion tests still enforce the bound; cost reservation uses the same constant. No paid maximum-context pressure test was used.

Verification: all 139 unit tests, formatting, lint, types, content validation and the unchanged synthetic observations pass. Desktop/mobile inspector checks pass, and a separate browser check of the real saved action run confirms all three intermediate results and the clarification step render with inference POSTs blocked.

### Remaining concrete findings from the final review

- The high-risk participant's control claim still says control is feasible under demanding conditions even though their answers primarily describe strategic worries and required safeguards. Exact claim-to-answer support needs a stronger check; this is not solved merely by the successful operation count.
- The dogmatic participant is assigned a decades-level capability claim without an explicit arrival horizon. Their assertion that benefits follow quickly _once_ AI is smart enough must not establish when that capability arrives.
- The undecided participant explicitly replies “I'm not sure which outcome you mean” to the mechanism prompt. The candidate's singular outcome premise is ambiguous in a two-scenario conversation. The playful participant also receives closely overlapping control-test/control-method questions and repeats the same safeguards. Routing applicability and marginal information gain still need work.
- Ordinary-harm and action summaries remain available only in detailed components, and the failed-operation envelope/resume proposal is not yet fully implemented.

These observations contradict completion of the overall goal. Keep the loop active; do not use the clean live runs as a substitute for semantic and experience quality.

## Forecast scope follow-up

Reprojected the exact final transcripts from action suite `1789758895224-ddf69b9c-17e8-4c70-8d1c-2fb1b28f6bb0` through live Jev, retaining history and invalidating only the diagnostic copy's cached result. No persona targets or new participant answers were supplied.

The controllability meaning now separates technical feasibility from requirements for institutional cooperation, support for development, and evidence that might change a belief. Both follow-up replays leave the high-risk participant's technical control forecast unplaced instead of asserting feasibility. The dogmatic participant's explicitly automatic control expectation remains placed.

Timing needed two iterations. Clarifying the dimension meaning alone changed the unsupported decades claim into an unsupported long/indefinite claim. The position judgment now explicitly distinguishes an omitted arrival horizon from an anticipated distant arrival; neither rapid consequences after arrival nor eventual transformation alone supports a timed position. The second replay leaves this participant's capability component unplaced while preserving their optimistic impact expectation. Explicit near-term forecasts and the skeptic's explicitly low ceiling remain placed; the undecided participant's overall outlook remains unplaced.

Artifacts: `eval/runs/projection-review/1789759522119-7a374803-6738-45ea-beab-40fd2eb4ac69/review.json` and `eval/runs/projection-review/1789759569306-d4069592-fe4a-4f1e-995b-84b828e46a56/review.json`. Each completed ten real projection calls without failure; combined estimated cost $0.02084. These are fixed-transcript semantic checks, not fresh adaptive journeys, and one successful timing replay does not establish robustness. Routing premise/redundancy issues and the other outstanding experience work remain open.

## Routing follow-up

Two saved decision points exposed distinct misuses of routing utility: general uncertainty/trade-offs received tension benefit, and an already-answered safeguard question received substantial new-information benefit. The shared question policy now requires an unambiguous referent and evaluates the requested information rather than treating a different question ID as novelty. The four utility instructions distinguish missing coverage, stated ambiguity, actual incompatibility, and marginal projection information.

Live replay at the exact saved states changed the undecided participant's ambiguous `mechanism.general` question to the self-contained `risk.catastrophe` question. Its original candidate fell to priority 0.88. The playful participant's repeated `control.general` question lost to `countercase.general`. These are observed ranking improvements, not hard eligibility guarantees: Jev still assigns some nonzero utility to the discouraged candidates.

The immutable replay is `eval/runs/routing-review/1789759706856-3f8e92f8-7ddf-433d-b447-1c29eb9459a0/review.json`. Two routing stages used 13 physical requests because one crossed the conservative large-input batching threshold; estimated cost $0.00360. All candidate judgments and the complete histories were retained. No additional runtime stage or question-budget reduction was introduced.

The first fresh suite (`1789759729206-816fd3ca-f62b-4eee-ad62-c24198cc7ca2`) completed nine personas, then failed in routing after the playful participant generated its fourth answer. The safe error was a timeout/cancellation, not a confirmed budget-exhaustion error. It recorded 237 successful Jev requests, 49 participant requests, $0.17279 estimated spend and $0.01324 unresolved reservation. The failure retained the generated answer. The 240 used-or-reserved request count includes the reservation held after failure.

Inspection identified an avoidable regression: repeating expanded guidance across 96 questions put many ordinary routing inputs just above 100 KB, triggering twelve physical batches. Moved the detailed guidance into shared question policy and kept short dimension-specific reminders. A replay after the shared-policy change used two physical requests for the two saved routing states (`1789759988470-3f8b6021-b491-417a-8ceb-1a010bbe182a`), preserving the improved selections at approximately $0.00135. Added an actual-SDK mocked-transport regression requiring one routing request throughout five ordinary-length answers; the existing long multibyte/full-context regression still exercises 17 successful requests. This reduces avoidable batching without changing history, candidate count, timeout, retry or budget limits.

Final compact-wording replay `1789760097078-3fec344c-eafc-45dc-a40d-2d8279ac4068` again selected `risk.catastrophe` and `countercase.general`, using two requests ($0.00149). The complete fresh suite `1789760014519-a393b974-3afd-4118-9194-b572c60d7a24` then completed all ten personas, early results, continuation and corrections without failure: 121 Jev requests, 50 OpenAI requests, $0.15141 estimated total, zero remaining reservations. All forty routing stages used one request each; their inputs were approximately 68–83 KB. The extra Jev request beyond 120 was not a failed operation.

Reviewed all ten final transcripts and claims. The undecided participant retained an unplaced overall outlook; the dogmatic participant's explicitly two-year prediction remained placed and their demonstrated reasoning stayed low. The playful participant did not receive the repeated control-method question. The high-risk participant's control correction now produced a difficult/unreliable control claim consistent with the actual correction. No new occurrence of the ambiguous singular-outcome mechanism question appeared in this run.

Remaining concrete result issues:

- Generic unknown/unestablished wording is too broad for the dimension's actual scope. The cautious builder and playful participant correctly insist they have a direction about ordinary improvements even though transformative timing remains unestablished. Clarification needs to distinguish these rather than repeatedly implying they have no view.
- The skeptic explicitly corrected transition dynamics to gradual, incremental automation, yet the final transition component remained unknown. Arrival uncertainty must not erase an expressed transition expectation.
- The worried participant says the net outcome is unsettled, while the sole placed horizontal contributor (manageable/localized harm) produces an outlook of 0.623. This follows the current observed-only normalization but risks presenting an affirmative overall outlook from an incomplete account; inspect the result contract and presentation before changing aggregation.
- Conditional-upside and institutional-feasibility claims still warrant closer support review, especially where the expected competitive trajectory is pessimistic but a preferable counterfactual exists.

Verification: 140 unit tests, types, lint, formatting, content validation and the unchanged synthetic journey baselines passed. No UI source changed. This remains an intermediate checkpoint with specific semantic failures outstanding, not goal completion.

## Scoped unknowns and gradual transitions

Unplaced result claims now name the dimension's scope, such as “whether or when transformative AI arrives” or “how quickly AI-driven change unfolds.” They no longer imply a person has no directional view at all. The same text is quoted during clarification. Saved generic claims remain accepted, while new scoped claims are validated against the corresponding dimension; altered prose and another dimension's scoped claim are rejected. The synthetic baseline change was inspected: only unplaced claim text and run/hash metadata changed, with no score or route changes.

The transition rubric now explicitly recognizes gradual diffusion of bounded tools independently of uncertainty about transformative capability or its arrival. Two live replays of the final ten-persona transcripts placed the skeptic's explicit gradual-transition correction correctly, with 0.92 probability on the gradual level in the first replay. They also recognized the playful participant's gradual-transition account. Artifacts: `1789760345255-df7fd7d7-dcba-4e5f-bb3c-7accd5c09bcf` and `1789760414786-4b07f388-b1e6-410b-8b9a-8bd6f6f46d0f` under `eval/runs/projection-review/`.

One first-pass projection crossed 100 KB and used six batches. Timeline-only placement guidance was moved from the generic position template into the capability definition, preserving the instruction while avoiding repetition for unrelated positions. The second ten-transcript replay used ten requests ($0.01044); its largest input was 98,459 bytes. An additional replay of the earlier no-date dogmatic transcript (`1789760424142-c0808331-2adf-43d0-9e7b-dc407b1ed555`, $0.00108) kept timing unplaced, while the newer explicit two-year prediction remained placed. The ordinary five-answer mocked-SDK regression now checks projection as well as routing request count.

A fresh live playful-persona action run (`1789760456592-ea8beafc-2952-4495-b3cf-f1dd8a1c578e`) completed five replies, results, continuation and a scoped correction without failure: 12 Jev requests, 5 OpenAI requests, $0.01431, no unresolved reservation. In response to the new scoped wording, the participant affirmed confidence in gradual usefulness and uncertainty about greater autonomy. However, the final transition claim still carries an unresolved-interpretation flag; inspect that new live trace rather than claiming the broader transition problem is fully solved.

Remaining priorities: investigate the unresolved flag in this fresh gradual-transition account, avoid presenting an overall outlook from only a placed harm component, and continue auditing conditional forecasts against expected trajectories. The overall goal remains active.

## Weak inference and incomplete overall outlook

The fresh playful run's transition flag originated in the opening presence judgment: `weakly_inferred` 0.44, `unclear` 0.01, supported presence 0.26. The engine created a lasting ambiguity from that weak inference, then required a separate resolution judgment even when the participant explicitly described gradual change. New ambiguity flags now require `P(unclear)` to meet the authored presence threshold. Weak inference without prior support remains unassessed. Existing genuine ambiguities/tensions still require resolution, and earlier strong evidence still survives later weak mentions. A regression uses the actual opening distribution and verifies later supported evidence can establish the dimension without a phantom unresolved flag.

Overall outlook now requires placed expected-benefit and expected-harm components. A one-sided account retains its detailed claims, evidence and interpretation range but has no horizontal coordinate. Missing agency remains optional and widens the range. Reasoning is independently placeable. This deliberately changes the old observed-only horizontal normalization for incomplete primary impact evidence; it does not change dimension scores or reasoning normalization. The synthetic baseline diff was reviewed: the worried novice's partial outlook becomes unplaced, and the novice/undecided result explanations change; other observations remain stable.

Fresh live action suite `1789760670557-3a4db783-1c99-4d31-9d91-714ef155e7c3` completed all ten personas without failures, with 120 Jev requests, 50 OpenAI requests, $0.15289 estimated cost and zero unresolved reservations. Reviewed all ten transcripts and final claims. The playful participant's gradual transition is now placed without an unresolved-interpretation warning. The worried novice's expected ordinary harms remain visible while their overall outlook stays unplaced; the fully undecided participant also remains unplaced. Explicitly dogmatic, automatic-benefit answers still produce a high positive outlook and low demonstrated reasoning, without persona target scores.

Remaining concrete failures: the labor participant explicitly expects bargaining-power loss and workplace harms, yet the final ordinary-harm component becomes unplaced after they separately express uncertainty about catastrophe. Keep ordinary-harm scope distinct from catastrophe in position assessability, not only in correction provenance. The alarmist's unlikely favorable branch still yields an expected-substantial-benefits claim; conditional positive scenarios must not substitute for adopted baseline expectations. These are unresolved semantic issues, so the overall goal remains active.

Verification: all 143 unit tests and full static/content checks passed. Three isolated browser scenarios cover ordinary ranges, both unplaced axes, and an unplaced outlook with placed reasoning on desktop/mobile; inference calls were blocked. Inspected the partial-outlook mobile screenshot. The participant's active session was not changed.

## Ordinary harms and unlikely upside

The harm definition now explicitly preserves expected non-catastrophic harms when the participant is uncertain about catastrophe. The benefit definition distinguishes adopted expected gains from the size of an attractive but explicitly unlikely branch. These are judgments about actual answers, not persona target scores.

Fixed-transcript live projection replay of suite `1789760670557-3a4db783-1c99-4d31-9d91-714ef155e7c3` placed the labor participant's expected workplace harm while keeping catastrophe unknown. It left the alarmist's positive-impact component unplaced instead of claiming substantial expected benefits from the branch they said was unlikely. Authored positive expectations in the builder, abundance and dogmatic transcripts remained placed; undecided and worried participants stayed unplaced overall.

The first expanded definitions caused excessive projection batching (`1789760988036-ea15ed94-a135-4f89-aae6-95a2d6a4d50d`, 30 requests). An attempted compact capability definition reduced requests (`1789761042034-9fa0f143-49f9-442b-b2d6-b217e07b9586`, ten) but failed the earlier omitted-date regression (`1789761099753-e68c817b-4f8f-4abe-9aa9-bb15d99f3ac3`): a decades claim reappeared. That compression was reverted. Final projection presence questions reference their full meaning already present in shared `dimensionDefinitions`, while score/position instructions retain their full definitions. The test now verifies every shared definition, and the ordinary SDK request-count regression passes.

Final-code replays under `eval/runs/projection-review/`:

- `1789761155987-28a2c26c-53dc-448a-9f22-fe8df1c2d6c2`: omitted-date case correctly unplaced, one request.
- `1789761168202-0013cfb3-81c7-4785-8e36-1b665f9ba1e9`: ten original transcripts, ten requests, $0.01019; both benefit/harm fixes retained.
- `1789761288996-67803d5b-242a-46c0-aea2-9089813fe5c4`: ten newly generated transcripts, ten requests, $0.01016; ordinary labor harm and unknown catastrophe remain separate, and the explicitly unlikely upside remains unplaced.

The new adaptive suite `1789761092345-a7549dbf-213e-4807-9c89-c0adfe5e8e9b` used the intermediate compact definition, so it is not a final-code adaptive verification. It completed all ten personas and result actions without failures (120 Jev, 50 OpenAI requests, $0.15226, zero outstanding reservation). Its complete transcripts were subsequently reviewed and reprojected with final code as listed above. Do not conflate that projection verification with regenerating its routes/answers under final code.

Remaining: the labor participant still received `control.test` followed by `control.general`, repeating recourse requirements; their distinct novelty groups mean the existing repetition penalty does not apply. More broadly, explicit overall pessimism with unestablished positive-impact magnitude now produces an unplaced overall coordinate; retain the risk interpretation prominently so uncertainty in the aggregate does not conceal the expressed concern. Ordinary-harm and action summaries remain missing from the main fingerprint, and findings still need specificity review. Final-code adaptive verification and these experience checks remain open. All 143 tests, static/content checks and synthetic baselines pass.

## Overlapping control prompts and visible partial results

`control.test` and `control.general` now share the control novelty group across the local draft catalogs. Their wording and eligibility are unchanged; the existing repetition cost now applies between them. This addresses the demonstrated overlap without prohibiting a second control question when it offers enough additional value. The live replay at the exact labor decision selected `risk.catastrophe` instead of the repeated `control.general` (`eval/runs/routing-review/1789761435037-5fe8405b-36c0-4365-abb6-a540f4c25422/review.json`, one request, $0.00077).

The main result fingerprint now also includes expected harm and action posture, using the same assessed components and provenance already available in details. This makes established risks and preferences visible when the aggregate outlook is unplaced. The result schema accepts up to seven cards and retains compatibility with saved five-card results. Reviewed the synthetic baseline: answered questions and final coordinates are unchanged; the repetition rankings, some selected-but-unanswered prompts at projection, and the two extra cards account for the behavior changes.

Regression coverage checks the shared repetition cost in both directions without exclusion, exact harm/action component reuse, result schema acceptance, and visible harm/action summaries alongside an unplaced outlook. All 144 unit tests, static/content checks and three isolated desktop/mobile map scenarios pass. The full mobile seven-card summary was visually inspected; inference POSTs were blocked and the participant session was not changed.

Final-code adaptive suite `1789761491189-ab5b1564-d592-469a-ac2d-63bc84f21b18` completed all ten personas and result actions without failures: 120 Jev requests, 50 OpenAI requests, $0.15353 estimated cost and no unresolved reservations. Reviewed all ten generated transcripts, paths, final claims and selected findings. No journey asked both control questions. The labor participant retained ordinary harm independently from unknown catastrophe, the undecided participant remained unplaced, and the playful participant retained a gradual transition. The alarmist's correction explicitly said expected long-run gains were small relative to downside, supporting the final low-upside claim; the dogmatic participant explicitly gave a two-year horizon and refused revision, supporting their placed timeline and low reasoning. These interpretations follow the actual generated answers rather than desired persona coordinates.

A remaining authored finding overstates its trigger: `finding.benefit-conditions` combines positive benefit evidence with general scope discipline and claims the expected upside itself depends on meaningful conditions. In the worried novice's fresh transcript, the expressed conditions concern defenses, updating and timing; the finding does not establish that connection to expected upside. Revise the wording or require evidence for that specific connection. The low-reasoning dogmatic result also has only neutral/worldview findings, without actionable feedback on the explicitly demonstrated refusal to revise. Findings fidelity and usefulness remain the next bounded review before completion auditing. Keep the overall goal active.

## Evidence-bounded findings and completion audit

The benefit-conditions finding now reports the two facts its conditions actually establish—expected benefits and expressed limits/conditions—then asks which conditions matter for those gains. It no longer asserts a causal link that its trigger cannot prove. The continuity finding now states expected preservation/expansion of the participant's valued agency, matching the rubric instead of inferring an additional value judgment.

Added a draft actionable finding for explicitly ruling out belief revision: name an observation that would prompt reconsideration and specify the change. It requires active supporting evidence, no unresolved issue, and the entire conservative interpretation range at the explicit-refusal level. Missing discussion, a broad uncertain range, and absence of evidence do not trigger it. Authored order gives this concrete improvement priority when available, while preserving the worldview/reasoning diversity rule.

Reapplied deterministic presentation to all ten latest live results without new inference, preserving their actual components and unresolved flags: `eval/runs/findings-review/1789761896027-b9f9ed00-d7fd-4fce-8a36-cf000754e4e9/review.json`. The explicit-refusal feedback appears only for the dogmatic transcript, whose answer actually said nothing would change its belief; it does not appear for the novice or undecided transcripts. Scores and routes do not change. The synthetic baseline changes only findings text/selection and hash/run metadata. All 145 unit tests and static/content checks passed.

Completion is still unproven. Re-reading the original approved first batch identifies an unfinished requirement: a safe failed-operation envelope with completed-stage diagnostics, plus explicit pending-answer resume from the last committed state under a fresh bounded budget. Existing safe error category/stage and retained pending text are partial implementation, not that complete feature. Recent successful suites do not eliminate the need to verify failure at each stage, prior-result preservation, and no duplicated accepted answer or regenerated participant reply on resume. Address this before marking the goal complete; no external blocker exists.

## Failure checkpoint and resume verification

Committed the initial failure envelope and explicit live resume command in `678fda4`. Failure injection now covers interpretation, routing after successful interpretation, projection, repeated failure on resume, and refreshing an existing result. These checks verify last-committed-state recovery, exact operation reuse, no duplicate accepted answers, unchanged prior steps/source artifacts, and rejection of a successful artifact as a resume source. A generated participant reply is reused without another participant call. A later failed physical batch preserves the earlier validated batch response and HTTP status/attempt diagnostics without serializing raw error bodies, headers or credentials.

The tests exposed a provenance defect: resuming after a catalog edit replaced the original persona profile. Resume now preserves the saved profile. The command and its limits are documented in `user-journeys.md`: it retries exactly one operation, may repeat completed inference stages, uses a fresh bounded budget, and saves a new artifact linked to its immutable source. Older artifacts without checkpoints cannot resume through this command.

The complete static/content suite and all 150 tests pass, including the 23-test runner file. All ten free synthetic observations match the baseline (`1789762571826-9f8c22ed-dbca-4797-9b4a-1f92dec6bc69`). No paid calls were needed for these failure injections. Overall completion remains unproven: finish the failed-operation inspector exposure and audit remaining approved result/resource improvements against the live evidence before declaring the loop complete.

## Inspectable failure recovery

The journey inspector now exposes the pending operation, failed-stage timing/attempt/status diagnostics, completed stages and last committed assessment in a dedicated disclosure. Live failures show the bounded resume command and explain that it retries one operation, reuses the saved answer and may repeat completed stages. Resumed run indexes now retain source-run lineage in provenance. All three inspector browser scenarios pass against the isolated fixture server, including the new narrow-mobile failure disclosure; no inference was requested.

The remaining resource audit confirms a concrete limitation in `selectPresentation`: conditions require a placed component, and ordering uses condition count plus static priority. The current draft resources therefore cannot address an explicitly unknown position simply because that position is unplaced. A supported-topic/unknown-position case needs separate eligibility from a score-bound condition, with a specific exploration question and conservative claims about why it is recommended. Verify this against actual saved transcripts and source scopes before changing selection. Familiarity and tension still use categorical confidence gates; their decision-specific audit remains open, rather than assuming the presence-probability fix covered them.

## Reading for an expressed unknown

The latest live open-ended uncertainty result had no resources despite supported discussion across seven worldview topics. The novice had only economic and incident readings; its evidenced uncertainty about control and institutional response excluded the relevant evaluation resources. This came from using numerical position assessability as the sole resource condition.

Added explicit authored topic-based conditions for current resource metadata, separate from position/score-bound conditions. Evidence is still required; mere absence does not qualify. Topic conditions cannot carry score bounds. Supported unplaced topics and unresolved non-reference issues rank before editorial priority, and the shortlist now diversifies both topic and learning purpose. Each updated resource carries an exploration question shown with its existing purpose and effort; economic wording avoids presupposing expected gains. No model input, judgment or score changes.

Reapplied presentation to all ten saved live results with their original familiarity and unresolved judgments, without inference: `eval/runs/resources-review/1789763003687-4c9a4fc9-bf04-4fb1-ac8e-c550fce67adb/review.json`. The novice now receives independent investigation, evaluator operating conditions and economic scenarios. Open-ended uncertainty receives those same three distinct topics instead of no resources. The first replay revealed duplicate control-topic readings; the diversity fix removes that crowding. These remain draft educational suggestions, not claims that the sources settle unknown forecasts.

Reviewed the regenerated synthetic baseline structurally: only resource selection/question fields and content/engine hash timestamps differ; question paths, judgments, readiness and coordinates are unchanged. Remaining completion audit: familiarity/tension/disposition gates, a final current-code live check, and explicit requirement-by-requirement verification. Keep the goal active until that evidence is inspected.
