# Personal question — October 4, 2026

Algorithm `0.7.6` adds one authored question, `personal.life-work`: “How do you expect AI to change your own life or work?” The owner chose “zoom out, then in”: the opening question and the core map questions stay as they are, and the personal question takes the first ordinary follow-up slot. The rule is in [ASSESSMENT.md](../ASSESSMENT.md#participant-facing-projections).

## Why

- None of the 48 earlier prompts asks about the participant's own life or work.
- Only 13% of people with results since September 27 were ever asked an experience question.
- Jobs and the economy are the most common concern in our interviews (47%, [participant sentiment analysis](https://github.com/transitive-bullshit/doom-or-bloom/pull/53)), and in Anthropic's [81k interviews](https://www.anthropic.com/features/81k-interviews) worry about jobs was the strongest predictor of sentiment toward AI.
- Of 318 people with results since September 27, 47% took the path opening → scale → P(doom) → one ranked follow-up → results, and about a third were asked the overall-balance question.

## Decision

- **Content.** Added to the current draft release in place (`content/releases/0.4.0-draft/prompts.json`, now 49 prompts), as the 0.7.3 triggered questions were. Family `concretization`; targets expected benefits, expected harms and grounded understanding; effort 0.2; its own novelty group; `trigger: first_follow_up`, so it is never ranked. Earlier content versions do not have it, so assessments pinned to them never get it. Machine translations for all nine locales.
- **Routing** (`personalQuestion` in `lib/assessment/routing.ts`, used by `route` in `lib/server/engine.ts`). After `mapGapQuestion` returns nothing, routing ranks candidates and makes the automatic-results decision exactly as before. Only if it continues does it issue the personal question, when the assessment, including a fork's inherited history, has not been asked it. Otherwise the top-ranked candidate follows as before. Continuing after results uses the same rule, so it is then the first optional question.
- **Versions.** Algorithm `0.7.5` → `0.7.6` (routing changed); content stays `0.4.0-draft`; rubric and model unchanged. Saved assessments keep their provenance and are not reprocessed. In-progress assessments get the question at their next ordinary follow-up.

## Effect on interview length

| Path | Before | After |
| --- | --- | --- |
| Common, fourth question only fills the answer floor | opening → scale → P(doom) → ranked follow-up → results | opening → scale → P(doom) → personal → results |
| Balance | opening → overall balance → scale → P(doom) → results | unchanged; personal is the first optional question after results |
| A worthwhile follow-up is pending | … → that follow-up → … | … → personal → that follow-up → … |

Because the stop decision is unchanged, the personal question does not replace a follow-up that clears the novelty threshold; it moves it one question later. The interview keeps its length only when the displaced question merely filled the four-answer floor. Live runs showed both cases (below). How often a worthwhile follow-up is pending at that point in real interviews is not known; saved assessments keep only the latest routing judgments, so it would need per-revision snapshots or a benchmark run to estimate.

## Verification

- Unit tests: `lib/assessment/routing.test.ts` (offered once, only in the current catalog, never ranked) and `lib/server/personal-question.test.ts` (both paths against the same catalog without the question, a pending worthwhile follow-up on each path, forks, continuing after results and skipping).
- The mechanical baseline (`eval/development/mechanical-journey-baseline.json`) was regenerated. In all ten cases the personal question takes the first ranked slot: the fourth question, or the third where the scale question is skipped as explicitly unknown. These cases run a fixed five turns, so they do not test interview length.
- Live before/after runs (local servers on `origin/main` and this branch, live Jev, the same scripted answers per question; screenshots at 390 and 1440 px in the git-ignored `work/personal-question-screens/`, with `sequences.json`):
  - Common path: both reached results after four answers. The fourth question was `control.general` before and the personal question after.
  - Balance path: both asked `impact.overall` and reached results after four answers. The first optional question was `control.general` before and the personal question after.
  - A run with a different opening had `crux.general` pending at answer three: before, results came after five answers (`crux.general`, `impact.over-time`); after, after six (personal, `crux.general`, `impact.over-time`).
  - Two other attempts left the intended paths (one opening read as stating a balance; one baseline kept asking follow-ups after weak fallback answers) and were rerun with adjusted answers.
  - About $0.12 of Jev for 14 interviews, by the local spend counter, and about $0.08 of OpenAI for the translations.
- The paid `core` benchmark was not run (roughly $6–7 a pass, about $13 for before and after).

## To check after deployment

- How often the personal question adds a question before results, and whether more people leave at that point than at the follow-up it replaced.
- How often the personal answer is usable.
- Whether personal answers change outlook readings or concerns, especially jobs.
