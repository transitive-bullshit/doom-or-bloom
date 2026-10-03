# Map banding — October 3, 2026

The Doom–Bloom map showed people in five columns. This note records why, what was tried, and the change adopted as algorithm `0.7.5` (`worldview-v9`): the [map ladder](../ASSESSMENT.md#placement-between-levels). Everything here is aggregate. The accompanying analysis page is private.

## Decisions

- **Place both map axes with the map ladder.** Nine yes/no comparisons per axis (four boundaries between neighbouring levels, five level centres), each asked forward and mirrored, averaged so Jev's lean toward "no" cancels. The level choice still decides placement, readiness and the stated level; the ladder moves the point at most half a level from it. No constants are fitted.
- **Saved results keep their positions.** The ladder needs new judgments, so it cannot be a render-time upgrade. Re-reading saved participant results is a separate decision.
- **Inferred P(doom) is unchanged.** It is not banded: log-odds averaging over 11 bands already gives continuous values.

## Why the map banded

- The outlook is the expected value of one five-level Jev Choice. Jev's top level gets a median 0.92 of the probability for simulated users and 0.86 for participants, so points land on 0, 0.25, 0.5, 0.75 and 1.
- Before this change, 64% of the 178 simulated users and 52% of the 982 placed participant results sat within 0.03 of a level. A smooth spread puts 24% there.
- The people are not banded. The benchmark references for 143 of these simulated users (an independent judge and the simulated person's own placement, `eval/benchmark/references.json`) put 27% within 0.03 of a level. Participants' own placements are smoother than our readings too.
- The small offsets inside a level already carried real order: within a level, today's map ordered pairs like the references 76% of the time. The information was there but compressed.

## Data and method

- **Data.** All 178 simulated users' selected production results (read-only). A random sample of 60 completed `0.7.x` participant results with a self-placement, re-read by Jev only. All 991 completed participant results as histograms.
- **Experiments.** One Jev request per person carried every candidate question set over the production projection input, so variants read identical evidence. Variants were tuned on 30 simulated users stratified by level and judged on the other 148.
- **Measures.**
  - Banding: share within 0.03 of a level, and the excess share in narrow spikes above a smoothed copy of the same distribution (grid-free).
  - Validity: rank agreement and mean distance to the references; order within a level (pairs at the same level whose references differ by more than 0.05).
  - Resolution: the nudge test. gpt-5.6-sol rewrote each simulated user's opening answer slightly more hopeful and slightly more worried (and slightly larger or smaller in scale), keeping their voice and other beliefs: 356 rewrites per axis. For participants, a "bit more optimistic / worried" sentence was appended instead; their answers went to Jev only.
  - Noise: retests of the same 30 interviews.

## Results

Outlook, 148 held-out simulated users:

| Variant | Near a level | Rank agreement | Order within a level |
| --- | --- | --- | --- |
| Today: one five-level Choice | 63% | 0.844 | 76% |
| Nine levels with in-between steps | 51% | 0.843 | 76% |
| Score instead of Choice | 58% | 0.855 | 78% |
| Ask where within the chosen level | 53% | 0.861 | 79% |
| Hope and worry as two intensities | 30% | 0.795 | 72% |
| Five-item battery | 28% | 0.696 | 59% |
| Ladder, forward questions only | 25% | 0.861 | 79% |
| **Mirrored ladder (adopted)** | **26%** | **0.858** | **79%** |

- Finer scales and within-level questions leave the columns: Jev still picks a canonical level.
- Hope–worry and the battery looked best on the 30 tuning users and ordered the held-out users worse. The forward-only ladder read people low by up to a third of a level, because Jev answers about 0.2–0.4 rather than 0.5 to "more hopeful than the typical account of your level?"

All 178 simulated users, same Jev pass:

| Axis | Near a level | Rank agreement | Mean distance | Order within a level | Nudges moved right / not / wrong |
| --- | --- | --- | --- | --- | --- |
| Outlook, today | 64% | 0.884 | 0.077 | 76% | 63% / 35% / 2.2% |
| Outlook, ladder | 28% | 0.892 | 0.073 | 79% | 85% / 13% / 1.7% |
| Scale, today | 43% | 0.865 | 0.141 | 70% | 73% / 22% / 5.1% |
| Scale, ladder | 25% | 0.882 | 0.151 | 72% | 82% / 17% / 1.4% |

- Retest noise is 0.003–0.004 with the ladder, about a tenth of a slight nudge's effect.
- The top level moves inward (simulated users read as strongly hopeful: 0.96 → 0.92; references 0.905). On the scale axis this raises the mean distance slightly, since the references put its top level at 0.95.
- Participants (60): near a level 55% → 23% (outlook) and 48% → 17% (scale), with rank agreement with their own placements unchanged (0.709 → 0.705, 0.742 → 0.746). Appended nudges moved the outlook the right way 71% → 78% of the time.

## Real-pipeline replay

`pnpm personas:reevaluate plan` replayed every simulated user's recorded answers through `0.7.5` against production (read-only, $2.47 of Jev). 164 of 178 produced a result, including all 48 featured users; 7 on engine `0.6.1` no longer reach a result and 7 are no longer in the catalog. Compared with the level reading from the same replay, the ladder took the outlook from 64% to 29% near a level, rank agreement from 0.873 to 0.882, and mean distance from 0.080 to 0.073. Against today's production positions, the largest group of simulated users sharing one exact outlook fell from 15 to 4.

## Cost

About $10 of a $20 budget: $5.64 of gpt-5.6-sol for the simulated nudges, $2.11 of Jev for the experiments and $2.47 for the replay. The ladder adds about $0.001 per result in a request that runs beside the projection.

## Open

- The human-influence axis is the same five-level choice and would band the same way; it has no independent reference to validate a ladder against yet.
- Publishing the replayed simulated users (`personas:reevaluate write`) follows the deploy.
