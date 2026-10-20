# Cloudflare Clef and Clairic spike — October 20, 2026

Cloudflare released two preview System One models: Clef (`@cf/cloudflare/clef`), a decision model with Jev's question types (Noul, Choice, Score), and Clairic (`@cf/cloudflare/clairic`), an extraction model that returns typed values, exact spans and estimates with intervals. We tested whether either should replace or complement Jev in the interview and result engine. The [comparison report](https://claude.ai/artifact/RXD73aSJ6hJm6kSwTUrk2Y) shows the maps, P(doom) readings, routing, speed and cost; it is private unless shared.

## Decisions

Neither model is adopted. The adapters and the comparison harness are kept on a reference branch ([draft PR #95](https://github.com/transitive-bullshit/doom-or-bloom/pull/95), not merged), so the comparison can be repeated when the models leave preview.

- **Keep Jev** for interpretation, routing, scoring, map placement and inferred P(doom). Clef reads people differently and further from the references, takes a different interview path a third of the time, and is about 7× slower at 5× the cost.
- **No Clairic in participant interviews.** The only participant-visible change would be a stated P(doom) given in words, which about 6 of 1,297 production participants used without a digit.
- **No Clairic in simulated-user generation for now.** As a Jev-verified add-on it kept every featured result unchanged and added two stated P(doom) values and years on six timelines. That is too small a gain for another vendor in the pipeline, and one of the six years was wrong.
- **If Clairic is revisited, use it to find values, never to estimate them.** Its estimates of an unstated P(doom) and of map positions regressed toward the middle of each scale.
- **Re-run the comparison when Clef leaves preview**, or if Jev's price, latency or availability changes.

## Method

All 47 featured simulated users' selected production transcripts (201 answers, read-only) were replayed answer by answer through the engine in persona mode (`scripts/compare-system-one.ts`). Nothing was written to a database. Scores use the benchmark references (R2+R3 consensus for map and P(doom); the 15 featured public statements scored by range, as R4 is).

| Run | Decision model | Clairic |
| --- | --- | --- |
| A | Jev 1.13.0 (algorithm 0.7.5) | none |
| A2 | Jev, second run (noise floor) | none |
| B2 | Jev, choosing every quote as today | proposes a stated P(doom) only when Jev selected none; dates Jev's timelines |
| B | Jev | picks every quote and the stated P(doom); Jev verifies |
| C | Clef | as in B; Clef verifies |

## Results

|  | A | A2 | B2 | C |
| --- | --- | --- | --- | --- |
| Map move vs A (mean) | — | 0.004 | 0.004 | 0.079 (28 of 47 > 0.1) |
| Map error vs references (outlook / scale) | 0.072 / 0.099 | 0.072 / 0.101 | 0.072 / 0.100 | 0.123 / 0.163 |
| P(doom) within 2× of references | 72% | 72% | 74% | 19% |
| Public statements within 2× or in range | 11 of 15 | 11 of 15 | 12 of 15 | 10 of 15 |
| Same next question as A | — | 91% | 92% | 68% |
| Identical findings | — | 45 of 46 | 47 of 47 | 18 of 47 |
| Timelines shown (with a year) | 22 (0) | 18 (0) | 18 (6) | 15 (7) |
| Median engine time per answer | 2.1 s | 2.1 s | 2.4 s | 15.0 s |
| Model cost per interview | $0.022 | $0.022 | $0.026 | $0.109 |

- **Clef reads lower.** 41 of 47 C readings of P(doom) fall below the reference, by a median factor of 3.5 in odds; A is evenly split (26 of 47). Our questions were tuned on Jev, so part of the gap is tuning.
- **Clef is slower and pricier.** Interpretation (22 questions) took about 2.0 s against Jev's 0.34 s, and routing (93 questions in two 64-question requests) 4.9 s against 0.43 s. List prices are $0.24 against $0.042 per million input tokens.
- **Clairic's estimates regress to the middle.** For inferred P(doom), five field designs reached 15–49% within 2× of the references, against Jev's 72% and a constant 12.5%'s 40% (`compare-system-one estimators`). Direct 0–1 map estimates were 0.111 / 0.152 from the references, against the ladder's 0.072 / 0.100.
- **Clairic finds; Jev judges.** Clairic caught "Roughly 70% for AI takeover…" (Kokotajlo), which Jev had passed over, and "Approximately zero—though not literally zero" (McAfee), which has no digit. It also proposed past and conditional numbers (Hinton, Tegmark) that Jev's verification rejected.
- **Letting Clairic pick quotes (run B) lost output**: 14 timelines instead of 22, 90 hinge quotes instead of 100. It returns minimal spans ("by 2030"), which verification rejects as too vague until code widens them to sentences.

## Integration notes

- `lib/server/clef-provider.ts` implements `Provider` with Clef. Clef question IDs allow only `[A-Za-z0-9_.-]`, so the adapter aliases ours. It caps requests at 64 questions and silently truncates long state instead of rejecting it.
- `lib/server/clairic-extractor.ts` builds the fields and maps text spans back to the answer they quote. The engine runs it beside `D: projection` when a provider carries an `extractor`, whose `mode` is `complement` (B2) or `replace` (B, C). Participant operations never set one.
- Code rules that Clairic needed:
  - `null_threshold: 0.2` and "null, not zero", because a plain number field returned 0% for people who gave no number;
  - the stated token kept as the exact span;
  - `reference_date`, without which "within ten years" became 2010;
  - no past years, and a year must match any year the quote writes, because Clairic copied one year into every milestone.
- Both Cloudflare models returned identical outputs for identical requests. These runs went through the `cf` CLI, about 0.7 s per request; `lib/server/workers-ai.ts` uses the REST API instead when `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are set.

## Re-running

```sh
node --conditions=react-server --import tsx scripts/compare-system-one.ts dump
node --env-file=.env.development.local --conditions=react-server --import tsx scripts/compare-system-one.ts run --variant=A --allow-paid
python3 scripts/compare-system-one.py
```

`dump` reads featured simulated users from production, read-only. Run each variant (`A`, `A2`, `B2`, `B`, `C`); about 10 minutes and $5 for all of them. The report's example cards in `scripts/compare-system-one/cards.json` describe these runs and need rewriting for a new one.

Spend: about $15 (Jev $5.61, Clef $7.68, Clairic $1.23), including discarded runs while the design was corrected.
