# Experimental worldview comparison — 2026-09-20

The approved live replay covers 45 per-answer snapshots across 16 saved journeys, including the four fixed dictated answers. It reinterprets the existing evidence with Jev 1.13.0; it does not generate new participant replies or alter historical outlook, routing, readiness or reasoning scores. Open `/user-journeys` and use **Watch the worldview develop** to compare both maps and the three supporting views at each answer.

## What the comparison shows

- **Transformation** is placed in 14 of 16 final snapshots. The skeptic, terse pragmatist and recovered playful participant expect relatively modest change. The control-alarmist, high-risk accelerator, utopian, doomer and real-user transcript expect very large change despite different outlooks.
- **Human influence** is placed in ten final snapshots. It usefully separates the control-alarmist (0.64) from the dogmatic doomer (0.01), despite both expecting extinction on the expressed trajectory. It also distinguishes the cautious builder (0.77) from the high-risk accelerator (0.51).
- In the **real-user transcript**, transformation progresses approximately 0.59 → 0.76 → 0.75 → 0.94 as the answers elaborate the expected scale. Influence is initially unplaced and ends at 0.37. The final work/society timing excerpt preserves the Industrial Revolution analogy and “five to 10 years.” These normalized coordinates describe experimental interpretations, not measured event probabilities.
- **P(doom)** remains unspecified except for the dogmatic doomer’s literal “99.9 percent.” Qualitative risk statements and confidence in an interpretation do not become participant probabilities.
- **Assumptions and update conditions** become richer through the journey. Sources retain exact wording and answer provenance; reflection prompts are authored, not newly generated claims.

Transformation currently offers the broader visual comparison. Human influence adds a distinct and useful contrast, but the existing elicitation does not consistently establish that belief. Neither axis is selected as the final product direction.

## Extraction changes and limits

The first replay required one supporting quote to receive at least 0.75 of a Choice distribution. Multiple suitable quotes divided that probability, causing clear views to disappear as more evidence accumulated. `worldview-v2` separates choosing a representative quote from independently verifying that it expresses the participant’s belief. Verification checks attribution and scope, not forecast correctness or reasoning quality. The existing 0.75 directional-mass requirement still applies to axes; source verification uses a separate 0.75 Noul threshold. Both remain development heuristics, not calibrated accuracy claims.

Verification shares the normal dependent result-evidence batch with reasoning evidence; replay uses a separate dependent batch. Raw evaluations are retained locally under ignored `eval/runs/worldview-experiments/`; the current overlay is checked in at `eval/development/worldview-experiments.json` and applies only to matching source-run, answer-state hash and evidence revision.

Remaining limitations to assess visually:

- Some human-influence evidence is indirect or primarily a policy preference. The abundance advocate remains unplaced despite optimistic language and support for broad access. Do not force a coordinate merely to complete the map.
- Timeline cards group source wording by topic rather than placing inferred calendar dates. Topic overlap remains: for example, the alarmist’s unknown superintelligence timing also appears under Science & daily life, and workforce timing can span work and daily life. Exact source wording makes these ambiguities reviewable; the topic assignment is not a canonical milestone forecast.
- A single chosen excerpt can change between snapshots even when the underlying view has not changed. Small coordinate differences across repeated evaluations should not be read as participant belief changes.
- These are reviewed development journeys, not a held-out accuracy evaluation. The maps support comparison and product decisions; they do not establish a validated psychological scale or exhaust the project’s North Star goals.

The final full replay completed in 90 Jev requests with no OpenAI calls. The user explicitly authorized these tests and clarified that ordinary test cost is not a blocker.

## P(doom) inference follow-up

The control-alarmist transcript states “On the present course, AI means extinction” without a percentage. The original numeric-token extractor therefore returned nothing by design. That contract did not meet the product goal: interpreting beliefs expressed in natural language.

The first inference pass exposed a second failure: whole-interview likelihood judgments were erased when no single excerpt independently established the proposed band. In a live replay, the cautious-builder proxy had 0.63 interpretation mass on the 10–30% band, but quote verification was only 0.20. The anti-doomer proxy had 0.67 mass on 1–10% and 0.30 on 0–1%, but quote verification was 0.47 after its follow-up. These were quote-selection failures, not missing whole-interview estimates.

`worldview-v3` separates those responsibilities. Verified explicit percentages take precedence. Otherwise, Jev interprets event-probability bands from the whole answer history, including contextual evidence. Code combines band midpoints, widens the range for indirect or missing evidence, and records supporting answer IDs. Optional representative excerpts are independently checked; missing excerpts no longer erase inferred estimates. No persona identity, public reputation, or desired test coordinate supplies the percentage.

The mapping remains an authored development heuristic. We should review the band boundaries and contextual estimates against direct user corrections; the range is not a calibrated confidence interval. Optimism, policy preferences, model confidence and P(doom) remain distinct. A low indirect estimate does not establish that the participant explicitly considered and rejected extinction risk.
