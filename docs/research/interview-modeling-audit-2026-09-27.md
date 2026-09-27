# Interview and modeling audit (2026-09-27)

A deep audit of how the interview elicits, models and presents a participant's AI worldview, with local experiments on simulated participants and an analysis of the first 952 production assessments. It asks where the current design is a local optimum, which failures explain "this doesn't represent me" feedback, and what to change first.

**Scope and evidence.** Algorithm `0.6.1`, content `0.4.0-draft`, worldview `worldview-v7`, Jev `jev-1.13.0`, runtime (participant) mode unless stated. Experiments used the real engine (`runAssessment`) with live Jev and simulated participants (`gpt-5.6-sol`): about 4,200 simulated answers, 5,400 participant-model calls and 21,500 Jev calls, for an estimated $61 of the $100 budget (published token rates; cached input counted at full price). Production data was added afterwards with the user's permission: read-only queries, analyzed locally, with nothing sent to external services ([production evidence](#production-evidence-952-real-assessments-sep-2327)). Experiment numbers are from simulation; read the [limitations](#limitations-and-threats-to-validity) before acting on magnitudes.

## Summary

The interpretation engine reads worldviews better than its outputs suggest. Most visible errors come from three fixable estimator and definition problems, and from an interview whose stopping objective (coverage of fifteen internal dimensions) is not what the result page shows.

1. **P(doom) is badly miscalibrated for real participants.** Runtime assessments never extract a stated number, and the `shifted-sharpening-v3` transform then distorts the inferred band. A participant who writes "my p(doom) is 20%" is shown **≈3%**; "10%" → 1.5%, "50%" → 20%, "70%" → 81%. On all 153 personas the current estimator was within a factor of two of the reference for **22**. Fixing the estimator alone, with no interview change, raises that to **105**. Adding a direct gut-feel question raises it to **122**. In production, all nine participants who typed a mid-range number (5–70%) saw it shown at least four times lower or not at all, and 35% of displayed estimates were squashed from a raw 10%+ to under 5%.
2. **"Scale of transformation" (y) reads systematically low** (bias −0.21 on full source briefs). It is scored on the participant's near-term horizon, and its only direct prompt asks about "everyday life". A definition fix alone cuts y error from 0.189 to 0.166; asking "how much will AI _ultimately_ change the world?" halves it to **0.094** (153 personas, paired change −0.094, 95% CI [−0.111, −0.077]).
3. **Doom–Bloom (x) ordering is good but optimists are compressed.** Spearman 0.95 against references, bias −0.07. Conditional optimists are labeled "mixed, conditional or undecided". A clarified definition cuts x error by ~21% on full briefs. X is already the most accurate output. Scale and P(doom) anchors alone cost about +0.013 x error; keeping one overall-impact question removes that cost (0.077 → 0.070).
4. **More questions do not buy accuracy under the current design.** Headline accuracy is flat from answer 1 to answer 10, because follow-ups target reasoning coverage and the estimator biases do not shrink with evidence. Two targeted questions at answer 2–3 do more than seven generic ones.
5. **The readiness gate, not the worldview, decides when short answerers see results.** **96%** of not-yet-ready steps for short answerers were blocked by "central basis below 0.75". So the 2nd and 3rd questions are almost always _grounding_ ("What observation or experience has most shaped your view…") and _crux_. Detailed answerers auto-stop after one answer 45% of the time (10/22). The adaptive router behaves like a near-fixed three-question script. Production confirms it: 95% of the 206 people who answered but never got a result were blocked by the basis gate, 44% of short answerers left before any result, and 20 people answered all twelve questions only to receive "insufficient evidence".
6. **Valid short answers are rejected, and people leave where it happens.** At least 29% of the 432 rejected production replies are plausibly valid. The grounding question rejects half of the answers that name exactly the experience it asks for, and it is also the question most people abandon on.
7. **The simulated-user benchmark does not resemble real usage.** 145 of 153 catalog personas answer in "detailed" style (160–300-word openings); real participants' median answer is 18 words.
8. **Displayed certainty does not match real variability.** Jev is near-deterministic on identical input (SD ≈0.004). A retake moves x by a typical SD of 0.04 (up to 0.24 of the map width) and P(doom) by about ×1.5 in odds. Yet 43% of saved persona results display a zero-width Doom–Bloom range.

**What moves accuracy most, on all 153 personas (brief answers, paired against today):**

| Variant | Answers | x error | y error | P(doom) error (shown) | Within ~2× |
| --- | --- | --- | --- | --- | --- |
| A. Current interview and estimators | 3.7 | 0.077 | 0.189 | 1.72 (111) | 22 |
| B. Current interview, **fixed estimators only** | 3.7 | 0.077 | 0.166 | 0.57 (144) | **105** |
| C. Root + lean, scale, P(doom) anchors @4 | 4.0 | 0.091 | 0.101 | 0.45 (145) | 118 |
| D. Root + scale, P(doom) anchors @3 | **3.0** | 0.091 | 0.099 | 0.42 (136) | 111 |
| E. Root + scale, P(doom) anchors @4 | 4.0 | 0.089 | 0.100 | 0.41 (142) | 116 |
| **F. Root + overall-impact, scale, P(doom) @4** | 4.0 | **0.070** | **0.094** | **0.41** (141) | **122** |

Errors: map axes are mean absolute error on 0–1; P(doom) is mean absolute log-odds error (0.7 ≈ within a factor of two); "Within ~2×" counts personas whose shown P(doom) is within 0.7 log-odds of the reference. All anchor variants use the fixed estimators.

## Implementation status (2026-09-27)

Algorithm `0.7.0` and `worldview-v8` implement all P0 recommendations and the P1 items the user selected. Content `0.4.0-draft` and rubric `0.1.0-draft` were edited in place, additively.

- **P(doom) (P0.1):** a log-odds band mean (`logodds-v1`) with honest log-odds ranges, runtime stated-percentage extraction, qualifier-aware bounds and decliner-aware inference. The card now names its source.
- **Readiness (P0.2, P1.10):** map-centric readiness replaces the central-basis gate. At the cap, the projection always runs, and the result is insufficient only if the map is unplaced.
- **Disposition (P0.3):** the revised instruction accepted 44 of 44 authored brief answers, against 37 of 44 before. It still rejected all 7 non-answers and all 4 navigation requests, and was consistent across two runs. It has **not** been validated on the 432 real rejected replies, which needs approval to send them to Jev.
- **Scale (P0.4, P1.9):** transformation is defined as eventual magnitude. `transformation.ultimate` replaces the retired `transformation.general`.
- **Direct questions (P1.9):** routing asks the core map questions at most once each: `impact.overall` when the balance is missing, then `transformation.ultimate` and `risk.chance` (the gut-feel P(doom) wording). A first implementation asked the scale and P(doom) questions only when routing found them missing. Validation showed that recovered only half of variant F's scale improvement, so both are now asked; see [validation](#validation-of-the-implementation).
- **Outlook (P0.5):** the level-2 definition now means "mixed or undecided"; conditional optimists lean hopeful.
- **Ranges (P0.6):** map ranges are at least ±0.05.
- **Stopping (P0.7):** results appear automatically only after four answers. Each result records why it appeared, and the interview says "usually 4–8 questions".
- **Scoring (P0.8):** Score rounding is tolerated.
- **Saved results:** display-only upgrades apply at render time (`presentResult`), so the P(doom) estimator, ranges and explanations reach older results without reprocessing.
- **Participant UX (P1.12–P1.14):** self-placement before the first reveal, a one-tap "Does this feel right?" (stored in `assessment_feedback`), a map checklist in place of the coverage meter, and gentler personal copy.
- **Measurement (P2.15–P2.17):** a static regression benchmark with fixed references, rebalanced personas across answer styles, and a read-only feedback-audit packet for periodic human review ([benchmark.md](../benchmark.md)).

A live smoke run with two terse casual personas used the real engine and live Jev ($0.10). Both behaved as designed:

- Results unlocked after one answer, and automatic results arrived at answers 4 and 5.
- The missing scale triggered `transformation.ultimate`.
- A later "maybe 5%" was shown as a stated 5%.
- Routing ran 93 questions in one request.

Not done: plotting nearby personas on both sides of a participant's point (P1.14), trimming facets (P2.18), the depth-phase redesign (P1.11), and every item under [still to run on production data](#still-to-run-on-production-data). Production needs the `assessment_feedback` migration before this UI is deployed.

## Validation of the implementation

The implemented engine (algorithm `0.7.0`) ran unmodified on the same 153 simulated participants as the stress test (brief style, up to six answers), and was scored against the same references at its automatic result. Two versions were run: one asked the scale and P(doom) questions only when routing found them missing, the final one asks them always.

| Engine | Answers to result | x error | y error | P(doom) log-odds error | P(doom) shown | Within 2× |
| --- | --- | --- | --- | --- | --- | --- |
| `0.6.1` (before) | 3.7 | 0.077 | 0.189 | 1.72 | 111 | 22 |
| Audit variant F (forced anchors, answer 4) | 4.0 | 0.070 | 0.094 | 0.41 | 141 | 122 |
| `0.7.0`, scale and P(doom) only when missing | 4.2 | 0.074 | 0.145 | 0.47 | 134 | 105 |
| `0.7.0` final | 4.3 | 0.071 | 0.101 | 0.44 | 121 | 102 |
| `0.7.0` final, band re-judged with the calibration sentence | 4.3 | 0.071 | 0.101 | 0.43 | 132 | 111 |

Paired against `0.6.1`, the final version changes:

- x error by −0.006 (95% CI [−0.017, +0.006]);
- y error by −0.087 ([−0.105, −0.070]);
- P(doom) log-odds error by −1.26 ([−1.45, −1.05]).

Asking the scale question only when missing recovered half of variant F's y gain. It was asked for 37 of 153 participants. Those who were not asked kept a low-biased scale: error 0.160 against 0.097 for those asked (bias −0.148). The final version asks it once unless the participant explicitly leaves the scale unknown.

Asking P(doom) directly made many simulated public figures answer "No idea—I don't have a defensible number". The band judge then chose `unknown`. Restoring the stress test's final calibration sentence ("Choose unknown only when the account offers no relevant evidence at all") shows 11 more estimates without losing accuracy. That result comes from a paired re-judgment of the same transcripts: −0.014 ([−0.027, −0.002]) on the estimates shown under both instructions. Real participants gave numbers far more often in the audit, and simulated public figures are told not to invent them.

Other measurements from the final run:

- Automatic results arrived at answer 4 for 113 of 153 participants, and by answer 6 for 150.
- Results were available on request after the first answer for 94.
- The direct questions were asked for the scale 150 times, P(doom) 153 times and overall impact 108 times.
- None of the 918 brief answers was rejected.

**P(doom) at the extremes.** Recomputing the 44 featured personas' stored band judgments with the log-odds estimator raised well-known dismissers from "<1%" to about 3–7%, for example Yann LeCun 5.7%. It also moved Eliezer Yudkowsky from ≈94% to about 87–91%.

The stored judgments put colloquial "very unlikely" into the 3–10% band of the same name, and the old sharpening transform had been masking that. Three responses were tested:

- **Attitude-anchored band labels.** These brought dismissers under 1%, but pushed mid-range participants down too: validation error rose from 0.45 to 0.89, and Dario Amodei moved from 28% to 18% against his stated 25%.
- **Anchoring only the two lowest bands.** Validation error rose by 0.17.
- **Adding only a rule that maps everyday wording by attitude.** Validation error rose by 0.03, with dismissers modestly lower: Marc Andreessen <1%, Ed Zitron 1.2%, Jensen Huang 1.5%, Yann LeCun 4.5%.

The wording rule was adopted. Separately, the P(doom) headline now always shows the point estimate; a range headline such as "under 6%" read as higher than the participant's view. Public figures with well-known numbers are best represented by verified public statements, as for the eight existing ones. The references themselves come from language models and cluster between 2% and 30% (100 of 116), so they cannot settle the extremes.

The validation runs cost $21.40, bringing total spend to $82.40 of the $100 budget.

### Optimists on real answers (algorithm 0.7.1)

Re-reading the 712 saved production results with `0.7.0` (for the backfill) showed the simulated validation had missed real participants: they rarely discuss catastrophe. Optimists (outlook ≥ 0.6) went from a median shown P(doom) under 1% to 4.7%, with 137 of 208 at 3–10%. Jev read a hopeful account as “very unlikely” and chose the 3–10% band of that name. Of 21 whose answers named no harm at all, 15 landed at 3–10%, and one enthusiastic account spread across the low bands widely enough to be headlined “Unclear”.

Two changes were tested on the same transcripts (band question only, one Jev call per transcript, $0.37 in total):

| Variant | Benefit-only optimists (21) | Optimists naming harms (187) | Doom side (388) | Simulated error / within 2× |
| --- | --- | --- | --- | --- |
| `0.7.0` | 3.6%, 15 at 3–10% | 4.8% | 14.6% | 0.50 / 100 of 126 |
| Rule: optimism without catastrophic risk → lowest bands | 2.0%, 6 at 3–10% | 3.1% | 13.4% (19 moved > 2×) | 0.62 / 88 |
| Rule plus relabeling the 3–10% band | 1.2%, 6 at 3–10% | 2.6% | 11.0% (53 moved > 2×) | 0.75 / 72 |

Medians are shown. The rule was adopted. The six benefit-only optimists still at 3–10% did raise catastrophic risks, such as loss of control or an engineered pandemic, in words the keyword filter missed. The doom-side participants it moved are skeptics who see AI as an ordinary or overhyped technology, going from about 3–4% to 1–2%. Simulated error rose mainly where the model-written references place developer personas at 3–6%. Those references cluster between 2% and 30% and cannot settle the low end. The relabeling also lowered participants who treat catastrophe as a real risk, so it was not adopted.

The “Unclear” headline now also requires the plausible range to run from under 10% to over 30%; a wide range within the low end keeps its point estimate.

## Production evidence (952 real assessments, Sep 23–27)

Added after launch with the user's permission: read-only queries against production Postgres, analyzed locally. All figures below are counts over participant assessments on algorithm `0.6.1`. No production text was sent to any external service, and examples are short and non-identifying.

**Who answers how.** 952 assessments from 922 owners; 908 accepted at least one answer, and 702 reached a result. Real answers are short: median **18 words** (first answer 28, later answers 17, p90 68). 28% of answers are under 10 words and only 6% of participants write 100+ words. The simulation's "brief" style (~20 words) matches the real median; the catalog personas (160–300 words) do not.

**Interview length depends on answer length, and short answerers leave.**

| Median answer length | People | Got a result | Answers to first result (median) | Results after ≤2 answers | Hit the 12 cap | Left without a result |
| --- | --- | --- | --- | --- | --- | --- |
| Under 10 words | 195 | 56% | **7** | 2 | 17 | **85 (44%)** |
| 10–49 words | 550 | 80% | 4 | 28 | 13 | 111 (20%) |
| 50+ words | 163 | 94% | 3 | **60 (39%)** | 2 | 9 (6%) |

This confirms both user reports: short answerers face long interviews (and 9% of them hit the cap), while long answerers often get results after one or two questions. Median time to first result is about three minutes in every segment. Results arrive almost entirely by automatic stopping: "View my results" was used 12 times across 952 assessments, and 10% of people continued answering after seeing results.

**Why people were not offered results.** Recomputing `evidenceReadiness` on the latest snapshot of the 206 participants who answered but never reached a result, **195 (95%) were blocked by "central basis below 0.75"**, 157 by fewer than two reasoning dimensions at 0.7, and 97 had no reasoning evidence at all (median readiness 11%). 32 people reached the 12-question cap; **20 of them received an "insufficient evidence" result** after twelve answers, again mainly because of the basis and overall-outlook gates.

**Where people leave.** 101 of the 206 left after exactly one answer. The question waiting when they left was most often the grounding question, "What observation or experience has most shaped your view of AI's future impact?" (76 of 206), followed by `impact.overall` (41) and `crux.general` (31). 30 left immediately after a "needs clarification" response.

**Valid answers are rejected.** 432 replies were rejected: 317 "needs clarification", 100 non-answers and 15 navigation. The grounding question alone accounts for 151. A conservative local rule pass finds that at least 126 rejections (29%) are plausibly valid:

- 77 of the 151 grounding rejections (51%) name exactly what was asked for, such as "personal use as a software developer", "Breakthroughs in math." or "I am a researcher on AI.";
- 36 are direct one-word answers such as "Nothing" or "None" to "What … would most change your view?";
- 13 say they are unsure, which the rubric defines as usable.

A manual read of 40 random short rejections found 13 clear answers and 7 more plausible ones.

**The router is a script.** Across all follow-ups, `grounding.general` was asked 731 times and `crux.general` 709; `impact.overall` 330. `risk.catastrophe`, the only direct P(doom)-style prompt, was asked 80 times, and the transformation prompt fewer. Most participants are never asked directly about the two map outputs other than outlook, or about P(doom).

**Placement and P(doom) in the wild.** Real participants skew concerned: 51% of placed x values are below 0.4, and the most common exact values are 0.25–0.26 and 0.74–0.75, the level-1 and level-3 quantization seen in simulation. 82% of results show an inferred P(doom), with a median of **2.0%**; 62% see under 5%, even in the "leans concerned" group (x 0.2–0.4, n=245; median 3.2%). The stored band probabilities put the pre-sharpening median at 16%, and **204 of 577 estimates (35%) had a raw band estimate of 10% or more but were displayed under 5%**. Re-estimating the stored bands with the log-odds mean moves the overall median to 10.6% and the "leans concerned" median to 13%. It also lifts strong optimists from 0.4% to 4.7%, probably an overestimate from thin evidence, which is why a direct question and visible ranges matter.

**Stated numbers.** Fifteen assessments contain a genuine P(doom)-style percentage (a local regex, checked by hand). The five extreme statements (0%, "less than 1%", 99–100%) were displayed about right. **All nine mid-range statements were displayed at least four times lower or not at all**: "About 5% chance" → 0.3%; "5-10% chance" → 0.3%; "Probably 20% likelihood on the current path" → 4.5%; "30%" → 5.4%; "20% catastrophic" → 3.0%; "definitely 20%" → 3.3%; "like 25%", "25-30%" and "Likely 70%" → no estimate.

**Reliability.** Answer operations took a median of 1.0 s (p90 1.6 s). Only 6 of 4,842 operations failed.

**Not yet done on production data.** Re-running Jev or a judge on real transcripts, validating a revised disposition instruction on the rejected replies, and generating real-user-grounded personas all require sending production answers to TypeSafe or OpenAI. The session's permission policy blocked that as possible data exfiltration, so it needs an explicit go-ahead.

## Method

### Harness

A local harness, kept outside Git (see [artifacts](#artifacts-and-reproduction)), drives the unmodified engine exactly as the HTTP route does, in runtime mode.

- **Participants:** the existing `participantRequest` instructions with a `responseStyle` override (`brief`, `detailed`), plus an added `terse` style (1–10 typed words, like a hurried phone user). Public-figure personas answering briefly stand in for "a real person with this worldview who types little".
- **Casual participants:** 10 new fictional everyday personas (job worrier, tech fan, casual doomer, hype skeptic, unsure, artist, accelerationist, mixed parent, anxious student, pragmatic worker), modeled on common public opinions because production transcripts were unavailable.
- **Interviews** continue past automatic results using the engine's own `continue` operation, for up to 4–12 answers. Each run therefore records where the engine _would_ stop and what later answers change. Anchor policies insert authored prompts after the root, replacing the router's choice.
- **Probes:** after every answer, the production map and P(doom) questions (`facet:outlook_orientation`, `facet:overall_outlook`, `experiment:transformation`, `experiment:influence`, `experiment:pdoom:band`, `experiment:pdoom:basis`) are re-asked on the transcript so far, alongside candidate variants. The probe reproduces the engine's own projection within about 0.02.

### References ("ground truth")

There is no validated ground truth. Each persona received four imperfect, partly independent references:

| Ref | Source | Notes |
| --- | --- | --- |
| R1 | Jev with the production questions, reading the persona's full first-person brief as one answer | Same interpreter; measures interpretation with complete information |
| R2 | Independent judge (`gpt-5.6-sol`, medium reasoning) reading the source dossier on continuous 0–100 scales with the same anchors | Two samples; judge SD 0.011 |
| R3 | The simulated person places themself before seeing results (0–100 scales, own P(doom)) | Three samples; proxies what a participant expects to see |
| R4 | Verified public P(doom) statements | Eight personas; outcome definitions vary |

The **consensus reference** is the mean of R2 and R3. The two agree with each other (x error 0.051, P(doom) log-odds error 0.43) more closely than production agrees with either. Both come from the same model family, so they may share biases; the y references are the least consistent (judge vs self error 0.13).

### Experiments

| ID | Question | Sample |
| --- | --- | --- |
| E1 | How well does interpretation work with complete information? | 163 personas' briefs (R1 ×3 against R2/R3/R4) |
| E0 | How do the current interview and stopping behave by answer style? | 22 personas × terse/brief/detailed, up to 10 answers |
| E0c | How do everyday short answerers fare? | 10 casual personas × terse/brief, up to 12 answers |
| P1 | What P(doom) does a participant see after stating a number? | 10 synthetic answers |
| E3 | Which P(doom) estimator fits best? | Band distributions from E1 (offline) |
| E4 | Do clarified axis definitions help? | Re-scored E1 briefs and all interview transcripts |
| E5 | Do direct anchor questions help? | 12 public (brief) + 10 casual (terse) × 3 anchor wordings |
| E6 | How stable is a retake? | 12 personas × 3 independent retakes |
| S1–S3 | Do the best candidates hold on everyone? | All 153 catalog and independent personas × 5 variants, brief |

## How the current system actually behaves

```text
answer ─▶ A interpret (20 Jev judgments: disposition, familiarity, 15 presence, horizon, conviction)
        ─▶ readiness = mean support over 15 dimensions ≥ 55%, or the focused core
           (overall outlook expressed, central basis ≥ 0.75, two reasoning dimensions ≥ 0.7)
        ─▶ C route (94 judgments over ~24 candidates) ─▶ worthwhile = novelty ≥ 0.6 (0.5 for grounding/crux)
        ─▶ eligible and nothing worthwhile: D projection (52 judgments) → results
   map x   = facet:outlook_orientation (5 levels, conditional mean; unplaced if mass < 0.7)
   map y   = experiment:transformation (5 levels; shrunk toward 0.5 when tentative)
   P(doom) = band midpoints averaged, then shifted sharpening
```

Jev is fast and cheap here: interpret ≈0.33 s, route ≈0.44 s, projection ≈0.82 s (medians), about $0.003 per answer. Cost and latency are not the problem; alignment and predictability are.

**What participants experience in simulation:**

| Style (median words per answer) | First eligible | Automatic results | Most common 2nd / 3rd prompts |
| --- | --- | --- | --- |
| Detailed (163) | answer 1 | answer 2 (10/22 after **one** answer) | crux, grounding, impact.overall / crux, grounding |
| Brief (20) | answer 2 | answer 3.5 | impact.overall, grounding / crux, grounding |
| Terse (15) | answer 3 | answer 3 | crux, impact.overall / grounding, crux |
| Casual terse (≈8) | answers 2–7 | answers 3–7 ("unsure": 7) | grounding / crux |

Readiness explains why short answerers take longer. Among 108 not-yet-ready steps of short answerers, **104 (96%)** were blocked by the central-basis requirement, 40 by an unexpressed overall outlook, 32 by fewer than two reasoning dimensions at 0.7, and 14 by no reasoning evidence at all. After one answer, casual participants covered a median of 0–0.5 of 7 reasoning dimensions and 2 of 8 worldview dimensions.

Special thresholds that unlock _grounding_ and _crux_ then dominate routing: across short-answer runs they were the 2nd question 55% of the time and the 3rd 73% of the time. Those questions satisfy the gate but do little for the displayed outputs. The questions that sharpen the map, scale and P(doom) (`impact.overall`, `transformation.general`, `risk.catastrophe`) rarely reach short answerers.

None of the simulated styles ran to the 12-question cap; even casual terse users got automatic results by answer 3–7. Real short answerers fare worse than the simulation. Their median first result comes after 7 answers, 9% hit the cap, and 44% leave before any result ([production evidence](#production-evidence-952-real-assessments-sep-2327)). The simulation therefore understates both the gate problem and the value of fixing it.

## Findings

### F1. P(doom): participants see distorted numbers

Runtime mode asks only for a likelihood _band_ (`experiment:pdoom:band`). The stated-percentage extraction exists only in persona mode (`experimentQuestions(candidates, mode === 'persona')`). Every inferred estimate then passes through `f(p) = 0.35p² / (0.35p² + 0.65(1−p)²)`, which maps 20% → 3.3%, 30% → 9%, 40% → 19%, 50% → 35% and 70% → 75%. A participant who states a number therefore sees:

| Participant wrote               | Band chosen by Jev       | Shown      |
| ------------------------------- | ------------------------ | ---------- |
| "My p(doom) is about 1%…"       | negligible / remote      | 0.0% (<1%) |
| "…at around 5%…"                | very unlikely (3–10%)    | 0.3%       |
| "…about 10%…"                   | unlikely / very unlikely | 1.5%       |
| "My p(doom) is 20%…"            | unlikely (10–30%)        | 3.3%       |
| "…a 35% chance AI wipes us out" | plausible (30–50%)       | 19%        |
| "p(doom) 50%. Coin flip…"       | plausible (30–50%)       | 20%        |
| "…around 70%…"                  | very likely / likely     | 81%        |
| "I am at 95% p(doom)…"          | near certain             | 99%        |

The public Dario Amodei (25%) and Scott Alexander (20%) proxies get **3–8%** from their own briefs. Casual participants who said "about 25%" and "50/50" were shown about 3% and 21%. This is the most likely single cause of "the result doesn't match what I told it" for anyone who thinks in P(doom) terms.

Estimator comparison on 93 full briefs with an inferred band (E3):

| Estimator | Log-odds MAE vs consensus | Bias | vs public statements (n=8) |
| --- | --- | --- | --- |
| Current (band mean + sharpening) | 1.58 | −1.44 | 1.13 |
| Band mean, no sharpening | 0.55 | +0.42 | 1.19 |
| **Log-odds mean of bands** | **0.43** | **+0.13** | 1.05 |
| Interpolated median | 0.49 | +0.26 | 1.01 |
| Modal band | 0.55 | +0.23 | 0.99 |

The sharpening was introduced to counter over-estimates from diffuse distributions (e.g. the Hinton proxy at 43% in the September 21 records). It over-corrects the 5–40% range, where most concerned-but-not-doomer participants sit. Log-odds averaging handles diffuse distributions without that distortion.

A second defect appeared under a direct question. When a participant says "no idea" or declines to give a number, the band judgment flips to `unknown` and the whole-worldview inference is discarded: 51 of 97 independent personas lost their estimate this way. A band instruction that keeps inferring from the rest of the account in that case restored estimates without increasing error: on the anchor transcripts, 136–145 of 153 personas received an estimate instead of 55–67, at the same log-odds error (0.41–0.45). Whether a decliner should see an inferred number is a product choice. If they do, label it: "You didn't put a number on it; your answers suggest it's low, probably under 5%."

With a direct question ("What's your rough gut-feel chance that AI causes human extinction or a similarly permanent catastrophe? A number or 'no idea' is fine."), **8 of 10 casual participants gave a number**. Stated-first estimation (persona-mode extraction, parsing "around 25%" too, falling back to log-odds) reached log-odds error 0.18, with an estimate for 9 of 10, against 0.50 for 6 of 10 today. Public-figure simulations mostly declined to invent numbers, as their instructions require, so real participants may state numbers more often than the stress test shows.

Retakes move P(doom) by a within-person log-odds SD of 0.27–0.49 (the Hinton proxy: 15% / 24% / 32%). Treat inferred P(doom) as a band with a visible range, not a precise number.

### F2. Scale of transformation (y) is biased low

With complete briefs, production y has error 0.216 and bias **−0.21** against the references (n=148). Examples: Bengio proxy 0.50 (references 0.85/0.95), LeCun 0.49 (0.80/0.96), Karpathy 0.28 (0.68/0.89), Tegmark 0.62 (0.93/0.95). These are mostly confident low-level choices ("incremental … within familiar institutions", "several sectors"), not the tentative-shrinkage rule. The definition asks for change "on the horizon they describe" and excludes "merely imagined possibilities", so gradualists and risk-focused people who expect eventual civilizational stakes read as moderate. Participants read "Incremental change ↔ Civilizational change" as eventual magnitude.

The existing direct prompt makes it worse. `transformation.general` asks "How much do you expect **everyday life** to change…", which anchors people to the near term; asking it early did not improve y (public brief error 0.179 vs 0.184).

| y variant | Full briefs (n≈150) | 153 personas, brief answers |
| --- | --- | --- |
| Production | 0.216 (bias −0.212) | 0.189 |
| "Eventual magnitude" definition | 0.179 (bias −0.167) | 0.166 |
| + "ultimately change the world" question | — | **0.099–0.101** |

### F3. Doom–Bloom (x): good ordering, compressed optimists, conditional ≠ undecided

With complete briefs, x has Spearman 0.95 and error 0.081 against references (n=146), with a bias of −0.07 concentrated on the bloom side. Strong optimists who mention any risk land on level 3 (0.75): Altman 0.83 (references 0.92/0.92), Musk 0.81 (0.92/0.91), LeCun 0.74 (0.86/0.93), Andrew Ng 0.76 (0.88/0.92). Andreessen reaches only 0.85. The doom side is not compressed (Yudkowsky 0.00, Soares 0.03). The saved persona runs show the same quantization: x clusters at 0.50 and 0.75, with only 3 of 143 above 0.9.

The deeper issue is that level 2 bundles **"mixed, conditional or undecided"**. A conditional optimist such as the Dario Amodei proxy ("this beneficial future is not automatic…") is placed at 0.33–0.49 in every style (references 0.64/0.72). The result card then tells them _"Your outlook is mixed, conditional or undecided"_, which is exactly the misreading such participants complain about.

Framing matters for mixed profiles. The Gary Marcus proxy reads ≈0.35 from critical free-form answers but 0.74 when asked "mostly good or mostly bad for humanity?" ("mostly good—if we build more reliable systems"); his self-placement is 0.42. Likewise a "hopeful, worried or torn?" question pulled some nuanced people toward doom: the Narayanan proxy is worried about ordinary harms, not catastrophe, and went from 0.68 to 0.26 against a reference of 0.61. For such people there is no single correct point, and the result should show the tension rather than hide it.

Interventions tested:

- **Clarified definition** (level 2 only when neither orientation dominates; "a conditional optimist who expects good outcomes as the likely path is leaning hopeful"; "criticism of hype is not doom"): full briefs error 0.081 → **0.064**, bias −0.071 → −0.034. Neutral to slightly positive in interviews.
- **7-level score with intensity cues:** worse (0.090). It helps dismissive optimists and hurts risk-aware ones.
- **Direct lean questions:** helpful for casual participants (0.058 → 0.046) but slightly harmful across all 153 (+0.013; 95% CI [+0.001, +0.026]). Not recommended in the tested wordings.
- **Scale and P(doom) anchors without an outlook question:** x error +0.012 to +0.014. The anchors do not hurt x; they fail to add the outlook information that today's `impact.overall` follow-up often supplies (x error falls from 0.089 after the root answer to 0.077 at today's automatic results).
- **Overall-impact question plus the two anchors (variant F):** x error 0.070 against 0.077 today (paired change −0.007, 95% CI [−0.016, +0.003]). Keeping `impact.overall` ("Taking benefits and harms together, what overall impact do you expect AI to have?") recovers the outlook information without a lean question.

A structural observation: across 143 saved persona results, x correlates **r = 0.97** with `facet:overall_outlook` (expected net impact). The two facets are nearly redundant, so keeping both costs clarity without adding information.

### F4. More questions do not improve the headline outputs

In E0 the accuracy of x, y and P(doom) was flat from the first answer to the tenth (brief answers: x error 0.087 after one answer, 0.073 at automatic results, 0.073 after ten). Later questions are mostly reasoning probes (grounding, crux, control, governance) that do not target the displayed outputs, and the systematic biases in F1–F3 do not shrink with more evidence. The earliest stop (detailed answerers, often after one answer) is not less accurate than continuing; its cost is trust (F8), not accuracy.

Targeted questions do move accuracy. Two anchors reach y error 0.099 and P(doom) within a factor of two for 111 of 153 personas after **three** answers, fewer than today's 3.7 (variant D above).

**The readiness paradox:** after the anchors the map is _more_ accurate, yet in the casual set 0 of 10 terse participants were "ready" at answer 4 (vs 9 of 10 on the baseline route), because anchors supply no central basis or reasoning evidence. A map-centric gate would fire at answer 2–2.5; with a four-answer floor it stops at 4 with the accuracy above.

### F5. The dimensional model is over-specified for what the interview can elicit

- **Most worldview dimensions stay unplaced**, even for detailed personas (saved results, n=143): capability/timeline 35 of 143, transition dynamics 59, technical controllability 62, institutional competence 84.
- **The eight dimensions are strongly correlated.** One doom–bloom factor explains 44% of variance, a capability/transformation factor 20%, and institutions-vs-action 10%.
- **The displayed outputs are not the modeled dimensions.** Map x and y are separate facets (`outlook_orientation`, `transformation`), and P(doom) is a separate band question. Yet readiness and routing optimize coverage of the fifteen dimensions, seven of them reasoning dimensions whose card is now hidden (commit `ee71c907`).
- **Neutrality flag:** in the same data the hidden reasoning composite correlates with catastrophic-risk expectations (r = +0.45) and negatively with x (r = −0.25). If reasoning quality is shown again, test it for outlook bias first.

The fifteen-dimension profile is useful as a rich secondary description. It is a poor _interview objective_ for a product whose result is three headline numbers plus a handful of cards.

### F6. The simulated-user benchmark over-represents essayists

145 of 153 catalog personas use `detailed` style; two use `brief`. Every recorded persona journey auto-stopped within five answers, 116 of 143 after being ready at answer 1. Tuning thresholds against this set optimizes for participants who write 200-word essays. Public-figure placements are also produced from far more evidence than a typical participant supplies, yet the two share one coordinate system and the closest-persona comparison. The same worldview answered tersely versus in detail moved x by up to ±0.15 (e.g. the Bengio proxy: 0.32 terse, 0.48 brief, 0.37 detailed).

### F7. Reliability and displayed certainty

- Jev on identical input is near-deterministic (x SD 0.004, y SD 0.005 over three repeats). Instability comes from participant wording and routing, not the evaluator.
- End-to-end retakes (E6: brief answers, 12 personas × 3): x ICC 0.96–0.98, within-person SD 0.035–0.05, maximum spread 0.13–0.24; y ICC 0.92–0.97, SD 0.04–0.05. On a 1.0-wide map a retake can visibly move the dot, which matters when people retake to "check".
- Displayed ranges do not reflect that variability. The Doom–Bloom interpretation range is the 10th–90th percentile of Jev's category distribution. Those distributions are usually concentrated, so **62 of 143** saved results show a range narrower than 0.02, and most of the rest show exactly 0.25.
- About **0.2% of Jev calls** failed `validateEvaluation` because a Score's expected value differed from its distribution by more than 0.03. In production, one such mismatch fails the participant's entire operation; the D projection carries about 15 Score questions. Recomputing the score from the distribution would remove a class of spurious failures.

### F8. Participant experience issues that amplify mismatches

These follow from the code and the simulated trajectories, not from observed users:

- **No expectation of length.** The interview shows "N substantive answers · question K" and reveals "of 12" only in the last three prompts. With automatic results after one or two detailed answers, the stop looks like a malfunction.
- **No reason for stopping.** `result.reason` is computed but not rendered on the result page, and there is no "why you are here" explanation tied to the participant's own words.
- **Abstract progress.** "Evidence readiness 60%" measures taxonomy coverage, not progress toward the result the participant cares about.
- **Labels that misread people:** the conditional-optimist wording (F3), and P(doom) values that contradict a stated number (F1).
- **False precision.** A dot with no visible range (F7) invites people to treat a 0.1 difference as meaningful.
- **No way to disagree.** The claim-specific correction flow was removed. Participants who feel misplaced can only continue answering, and the product captures no signal that they disagreed.

## Recommendations

Ordered by expected impact on "this represents me" relative to effort. P0 items fix measurable defects without changing the interview. P1 items change the interview contract and need a product decision. P2 items build the measurement loop that makes further tuning safe. Saved results keep their versions and are not rescored. Display-only improvements reach them at render time; see [implementation status](#implementation-status-2026-09-27).

### P0: fix what is shown and what blocks people

1. **P(doom) estimation.** Variant B shows these changes alone move P(doom) within a factor of two for 105 of 153 personas, up from 22. In production they would lift the median displayed value from 2% to about 11%, and fix every mid-range stated number.
   - Enable stated-percentage extraction in runtime mode. The persona-mode selection and verification already exist; also parse qualified tokens such as "around 25%".
   - Replace `shifted-sharpening-v3` with the log-odds mean of band probabilities.
   - Keep inferring from the whole account when a participant declines to give a number, and label the result as inferred.
   - Label the source: "You said 20%" or "Inferred from your answers: roughly 5–15%". When the inference is contextual or diffuse, show a band ("low, probably under 5%") rather than a point.
2. **Remove the central-basis gate from result eligibility.** In production it blocked 95% of the people who left without results, and it is why 20 people finished twelve questions with "insufficient evidence". Stop requiring reasoning dimensions too; the reasoning card is hidden. At the cap, never return "insufficient evidence" when outlook, scale and P(doom) are placed.
3. **Stop rejecting valid short answers.** Revise the disposition instruction to accept brief direct answers:
   - naming an experience or source ("coding", "personal use as a developer");
   - "nothing" / "none" to questions about harms or what would change a view;
   - honest "idk";
   - slang that carries an outlook ("it's joever").

   Reserve `needs_clarification` for replies that could mean substantively different things. At least 29% of the 432 production rejections were plausibly valid, and 30 people left right after one. Validate the revised instruction on those 432 real rejections plus a sample of accepted answers before shipping.

4. **Define transformation (y) as eventual magnitude.** Score the change expected whenever it arrives, and carry pace on a separate timeline indicator. Reword `transformation.general` from "everyday life" to "how much will AI ultimately change the world".
5. **Separate "conditional" from "undecided" in the outlook facet.** Adopt the clarified definition (F3), and rewrite the level-2 claim to distinguish "torn or undecided" from "hopeful if X".
6. **Show honest ranges.** Derive the displayed interpretation range from observed retest variability (at least ±0.05 on x in the E6 data) combined with the distribution, rather than from category quantiles alone. Never show a zero-width range.
7. **Explain the stop and set expectations.**
   - Show "usually 4–8 questions" at the start.
   - Render why results appeared: "We have enough to place your outlook, scale and risk; answering more sharpens your reasoning profile".
   - Never auto-stop before a floor (suggest 4 answers). The accuracy cost is nil in simulation. In production, 39% of long answerers got results after at most two questions.
8. **Tolerate Score/distribution rounding** in `validateEvaluation` by recomputing the expected value, rather than failing the operation.

### P1: align the interview with the outputs ("core + depth")

9. **Core phase: short direct anchors after the root, asked only when the root did not already establish them.**
   - _Scale:_ "Setting aside good or bad: how much do you think AI will ultimately change the world—a little, a lot, or completely?"
   - _Risk:_ "What's your rough gut-feel chance that AI causes human extinction or a similarly permanent catastrophe? A number or 'no idea' is fine."
   - _Outlook:_ keep the existing `impact.overall` question when the root left the balance unclear.

   This combination (variant F) had the best x, y and P(doom) of every variant tested. The "hopeful, worried or torn" and "mostly good or bad" wordings did no better than reading the whole account.

   Deciding whether to skip an anchor is cheap: the six-question map probe (≈0.5 s) already reports `not_expressed` and basis mass. Optional one-tap chips with a free-text "why" would give terse participants a fast path. Chips relax the "all later prompts are adaptive" principle and need an explicit product decision; the free-text anchors do not.

10. **Map-centric readiness.** Results become available when x, y and P(doom) are each placed or explicitly unknown, subject to the answer floor. This extends item 2: results unlock on the displayed outputs, not on reasoning coverage.
11. **Depth phase after results, opt-in.** Recast the existing adaptive router (grounding, crux, countercase, mechanism) as "Sharpen your reasoning / find your cruxes". The epistemic model, the North Star's Socratic direction and the full fifteen-dimension profile belong here. Routing then optimizes reasoning coverage only where the participant asked for it. The grounding question in particular belongs here: it is the most-asked follow-up, the most-rejected, and the most common point of abandonment.
12. **Self-placement before results, then "you said / your answers suggest".**
    - Before showing the map, ask the participant to drop a dot, or to pick a lean and scale and guess their P(doom).
    - Show both points, with the one or two quotes that drove each coordinate.
    - Where they differ, frame it as an insight: "You describe yourself as hopeful; most of what you wrote was about risks. Both can be true."

    This turns the visceral "it's broken" reaction into something to inspect, and gives every real assessment a calibration label (P2).

13. **A one-tap agreement signal** ("Does this feel right? Yes / Not quite—what's off?") on the map and P(doom) card. It records disagreement without reintroducing the full correction machinery.
14. **Emotional framing.**
    - Prefer "worried" and "hopeful" in personal result copy; keep the provocative brand on the landing map.
    - Show nearby people on both sides of a participant's point, so a position reads as company rather than a verdict.
    - Always draw the range (item 6).

### P2: build the measurement loop

15. **Make this harness the regression benchmark.** Promote it from `.audit/` into repository tooling. Include:
    - fixed persona sets across terse, brief and detailed styles, plus the casual set;
    - the reference store;
    - the metrics used here: x/y error, P(doom) log-odds error, within-2× count, answers to result, readiness timing and retake SD.

    Run it on every rubric, prompt or estimator change. A full interview pass over all personas costs about $5–10; re-scoring every brief costs cents.

16. **Rebalance simulated users.** Give each public persona brief and terse variants, keep the casual set, and add archetypes drawn from production transcripts once they can be reviewed. Do not tune thresholds on detailed-only runs.
17. **Collect real labels.** Self-placement (item 12) and agreement (item 13) give per-participant ground truth. Track:
    - error between self-placement and the model;
    - disagreement rate by answer length and outlook region;
    - the rate at which people continue answering after seeing results.

    Then fit a monotone calibration per segment.

18. **Trim facets.** Merge `overall_outlook` into `outlook_orientation` (r = 0.97). Consider reducing comparisons and fingerprint cards to the ~3 factors the data supports, keeping the full set internally.

### Still to run on production data

These need production answers to be sent to TypeSafe (Jev) or OpenAI. That flow was blocked in this session pending explicit approval:

- Validate the revised disposition instruction (item 3) on the 432 real rejected replies and a sample of accepted ones.
- Re-score real transcripts with the fixed estimators, using a judge on each transcript as a reference, to measure the fixes on real rather than simulated answers.
- Build anonymized, real-user-grounded simulated personas (archetypes by answer length and outlook) for the benchmark (item 16).
- After shipping fixes, track: abandonment by answer length, cap-with-insufficient results, stated-vs-shown P(doom), rejection rate per question, and time to first result.

## What to test next

- **Chips vs free-text anchors** with real participants (A/B): completion, time to result, self-placement agreement and share rate.
- **Calibration against self-placement.** Once real labels exist, fit a monotone mapping for x and y per answer-length segment, and test whether calibrated coordinates reduce disagreement.
- **Anchor order and skip logic.** Whether asking P(doom) before or after the scale question changes answers (anchoring), and whether skipping anchors already answered in the root preserves accuracy for detailed participants.
- **Outlook elicitation for mixed profiles.** A question that separates "worried about ordinary harms" from "worried about catastrophe", evaluated on the personas that moved most in F3.
- **Depth-phase value.** Whether the post-results reasoning questions change participants' own views or cruxes (the North Star's second goal), measured by before/after self-placement and crux statements.

## Limitations and threats to validity

- **Production data covers behavior, not accuracy.** The 952 production assessments show how people answer, where they stop and what they are shown. They have no ground truth for placement, except the handful of stated P(doom) numbers. The accuracy results still come from simulated participants, whose answers are more consistent than real ones. Production is five days old and likely skews toward an AI-engaged audience.
- **Model-based references.** The judge (R2) and self-placement (R3) come from the same model family as the simulated participants. They agree with each other more than with production, but may share biases, for example toward high transformation for AI-engaged people. The eight public P(doom) statements are the only external anchor. Treat error values as comparisons between designs, not as absolute accuracy.
- **Simulated participants are consistent.** They do not discover or revise views mid-interview, which may understate the value of later questions for real people.
- **Public-figure simulations decline to invent numbers,** following their instructions, which understates how often a direct P(doom) question yields a stated number (casual set: 8 of 10; independents: 3 of 97).
- **Policy arms before the stress test were small** (10–12 personas). Differences under about 0.02 there are noise; the stress test gives paired 95% intervals.
- Runtime mode only. Persona mode (excerpts, stated extraction, public overrides) differs, and it is what the public persona pages show.

## Artifacts and reproduction

- **Harness** (git-ignored): `.audit/` in the audit worktree, with a copy under `work/research/interview-modeling-audit-2026-09-27/harness/`.
  - `env.sh` runs scripts inside the login shell for the OpenAI key and loads TypeSafe credentials from the root `.env.development.local`.
  - Scripts: `e0.ts` (interviews with anchor policies), `e1.ts` (references), `reprobe.ts` (definition and estimator variants), `pdoom-stated.ts`; shared modules live in `lib/`.
- **Analysis scripts:** `work/research/interview-modeling-audit-2026-09-27/analysis/` (Python). Raw runs, references and the cost ledger stay in the session scratchpad.
- All experiments used unmodified engine code at commit `2f5da0aa`. Candidate prompts and definitions exist only in the harness.
- **Regression benchmark:** the harness is now repository tooling ([benchmark.md](../benchmark.md)). Its reference store (`eval/benchmark/references.json`) preserves the references used here. The [validation](#validation-of-the-implementation) of the implementation used the harness above, so it is directly comparable with the stress test.
