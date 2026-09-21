# Persona scoring refresh — September 22, 2026

Refreshed all 54 saved journeys and 170 per-answer snapshots with live Jev using worldview-v6. Existing interviews and core scores were preserved; experimental mappings, probability bands, milestones, and hinges were re-evaluated. This is a scoring replay, not a newly generated set of interviews.

Shifted sharpening uses the 65% crossover; interpretation bounds retain their original asymmetric offsets around the corrected mean, clipped to 0–100%. Verified all 142 inferred snapshots against the current formulas. All 22 public-statement snapshots retained their source statements.

Cost: 340 Jev requests; estimated $0.175347018. No OpenAI participant requests. Replay provenance and cost are in `eval/development/worldview-experiments.json`; raw local exchanges are in ignored `eval/runs/worldview-experiments/`. Original suite timestamps and hashes continue to describe interview generation.

The fixed four-answer personal replay changed from 43.32% to 21.79% (raw current estimate 41.84%), with range 0–64.95%. The separate five-answer assessment in browser storage was not modified.

Validation: full suite schema, complete snapshot coverage/version checks, unchanged questions/answers/input states/core results, exact inferred mean/range formulas, preserved public statements; 30 relevant unit tests; TypeScript check. Local Sam Altman page visibly shows ≈2% and range 0–30%.

| Saved profile | Previous P(doom) | Current P(doom) | Current range | Source |
| --- | --: | --: | --- | --- |
| control-alarmist | 88.80% | 94.21% | 59.60%–100.00% | inferred |
| cautious-builder | 16.41% | 2.10% | 0.00%–30.46% | inferred |
| abundance-advocate | 3.94% | 0.13% | 0.00%–5.39% | inferred |
| anti-doomer | 5.42% | 0.20% | 0.00%–19.44% | inferred |
| frontier-pacer | 25.00% | 25.00% | 25.00%–25.00% | public-statement |
| empirical-skeptic | 3.00% | 3.00% | 3.00%–3.00% | public-statement |
| practical-optimist | 6.75% | 0.29% | 0.00%–18.42% | inferred |
| world-model-optimist | 7.38% | 0.48% | 0.00%–22.81% | inferred |
| concerned-pioneer | 10–20% | 10–20% | 10.00%–20.00% | public-statement |
| bubble-critic | 4.52% | 0.31% | 0.00%–23.20% | inferred |
| abundance-risk-taker | 33.38% | 5.59% | 0.00%–45.69% | inferred |
| open-science-realist | 5.39% | 0.24% | 0.00%–3.93% | inferred |
| democratic-moratorium | 49.69% | 38.95% | 0.00%–86.83% | inferred |
| competitive-decentralist | 7.61% | 0.36% | 0.00%–37.75% | inferred |
| scientific-steward | 18.48% | 2.31% | 0.00%–29.98% | inferred |
| coordinated-scaler | 25.26% | 4.03% | 0.00%–47.20% | inferred |
| alignment-maximalist | 36.97% | 9.99% | 0.00%–43.77% | inferred |
| efficient-intelligence-builder | 14.93% | 1.22% | 0.00%–33.06% | inferred |
| reasoning-frontier-builder | 16.05% | 1.42% | 0.00%–32.36% | inferred |
| learning-bottleneck-investigator | 33.40% | 8.84% | 0.00%–44.05% | inferred |
| scientist-ai-advocate | 40.66% | 19.36% | 0.00%–64.32% | inferred |
| safe-superintelligence-researcher | 38.07% | 12.28% | 0.00%–43.51% | inferred |
| hands-on-agent-builder | 9.38% | 0.51% | 0.00%–36.65% | inferred |
| human-centered-spatial-builder | — | 0.59% | 0.00%–36.10% | inferred |
| digital-succession-optimist | 14.25% | 1.34% | 0.00%–32.65% | inferred |
| provable-control-advocate | 38.56% | 13.91% | 0.00%–43.52% | inferred |
| tool-ai-moratorium | >90% | >90% | 90.00%–100.00% | public-statement |
| open-frontier-idealist | — | 0.49% | 0.00%–43.76% | inferred |
| community-ai-critic | 7.98% | 0.82% | 0.00%–34.82% | inferred |
| normal-technology-realist | 13.03% | 0.96% | 0.00%–34.14% | inferred |
| pro-worker-economist | — | 0.69% | 0.00%–35.50% | inferred |
| personal-superintelligence-builder | 12.33% | 1.02% | 0.00%–33.89% | inferred |
| language-hype-critic | 5.21% | 0.43% | 0.00%–37.23% | inferred |
| democratic-ai-steward | 17.84% | 2.31% | 0.00%–29.99% | inferred |
| america-first-ai-booster | 1.05% | 0.00% | 0.00%–0.44% | inferred |
| equitable-ai-philanthropist | 28.45% | 4.60% | 0.00%–46.57% | inferred |
| biosecurity-abundance-optimist | 10.00% | 10.00% | 10.00%–10.00% | public-statement |
| worried-novice | — | — | — | unavailable |
| high-risk-accelerator | 48.40% | 24.65% | 0.00%–50.85% | inferred |
| capability-skeptic | 7.38% | 0.33% | 0.00%–38.01% | inferred |
| labor-organizer | — | 0.50% | 0.00%–57.67% | inferred |
| open-uncertainty | — | — | — | unavailable |
| dogmatic-utopian | 0.80% | 0.00% | 0.00%–15.22% | inferred |
| dogmatic-doomer | 93.75% | 99.98% | 96.98%–100.00% | inferred |
| brief-pragmatist | 10.80% | 0.56% | 0.00%–36.27% | inferred |
| brief-job-worrier | — | 0.33% | 0.00%–62.02% | inferred |
| playful-recovery | 14.04% | 1.30% | 0.00%–32.78% | inferred |
| real-user-regression | 43.32% | 21.79% | 0.00%–64.95% | inferred |
| superintelligence-stop-advocate | 62.30% | 59.87% | 47.40%–87.40% | inferred |
| empirical-control-researcher | 35–40% | 35–40% | 35.00%–40.00% | public-statement |
| alignment-philosopher | 21.40% | 3.67% | 0.00%–12.67% | inferred |
| rationalist-safety-advocate | 20.00% | 20.00% | 20.00%–20.00% | public-statement |
| takeoff-forecaster | 67.05% | 75.69% | 55.06%–100.00% | inferred |
| institutional-growth-optimist | 12.09% | 1.02% | 0.00%–33.87% | inferred |
