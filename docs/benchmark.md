# Interview benchmark and feedback audit

Two human-in-the-loop tools close the measurement loop recommended by the [interview and modeling audit](research/interview-modeling-audit-2026-09-27.md#p2-build-the-measurement-loop):

- The **regression benchmark** runs the real engine against a fixed set of simulated participants and compares what they are shown with fixed references. Use it to compare designs before and after a change.
- The **feedback audit** pulls real participant feedback into a private local review packet, so a person can look for disagreement patterns across many participants.

Neither tool recalibrates anything, gates CI or runs on a schedule. A person runs them, reads the output and records decisions.

## Regression benchmark

Code lives in `lib/benchmark/`, the CLI in `scripts/benchmark.ts`, and versioned data in `eval/benchmark/`.

### What runs

Each interview drives the unmodified engine (`runAssessment`, runtime mode) exactly as the assessment route does, with live Jev. The simulated participant uses the shared journey participant instructions (`gpt-5.6-sol`) plus an answer style. `terse` (1–10 typed words, like a hurried phone user) exists only in the benchmark; `brief` and `detailed` come from the journey catalog. A rejected reply is re-asked with the clarification or re-ask copy the app would show, up to the recovery limit.

An interview stops at the engine's automatic result, or at `--max-answers` (default 12, the question cap). `--continue-after-result` keeps answering through the engine's own `continue` operation, as the audit did. After every accepted answer that permits a result, an inspection projection on a copy records what "View my results" would show; the interview itself continues unchanged. `--no-inspect` skips these.

The fixed persona sets are versioned data in `eval/benchmark/personas.json`. Change a set by adding a new one or bumping its id, never by editing it in place:

| Set | Interviews | Use |
| --- | --- | --- |
| `core` | Public and fictional catalog personas in terse, brief and detailed styles; the casual set in terse and brief | Every rubric, prompt or estimator change |
| `retest` | Twelve personas answering briefly, three independent interviews each | Retest variability |
| `wide` | Every catalog persona with a reference answering briefly; the casual set tersely | Occasionally, when `core` cannot resolve a difference |

Every set mixes short and detailed answers, so thresholds are never tuned on essay-length answers alone (real participants' median answer is 18 words). The ten casual personas in `lib/benchmark/casual-personas.ts` are fictional everyday participants from the audit. Archetypes grounded in real transcripts need a separate approval to send production text to a model.

### What it measures

The scored result is what the participant sees: the automatic result, else the last result available before the interview ended.

| Measure | Definition |
| --- | --- |
| x, y error | Mean absolute error (and signed bias) of the displayed outlook and scale against the reference, on 0–1 |
| P(doom) error | Mean absolute log-odds error; ≤0.7 counts as within about 2×. Also counts results showing a P(doom) and stated values |
| Answers to result | Accepted answers at the automatic result; interviews without one are counted separately |
| Readiness timing | First answer that made a result available |
| Retest variability | Within-person SD, ICC and maximum spread across repeated interviews |

`score` reports these overall, by style and by persona group, by answer count, and against each reference. `compare` pairs two runs by persona, style and repeat and reports each difference with a seeded percentile-bootstrap 95% interval, as in the audit. Read the interval rather than the point estimate (in the audit, map differences under about 0.02 between small arms were noise), and check each style row.

### References

`eval/benchmark/references.json` stores reference placements derived only from simulated personas and public statements. There is no validated ground truth; each reference is imperfect:

| Ref | Source | Limits |
| --- | --- | --- |
| R1 | The engine reading the persona's whole brief as one answer | Same interpreter as the product; measures information lost by the interview, not correctness |
| R2 | An independent model judge reading the source dossier on 0–100 scales | Same model family as the simulated participants |
| R3 | The simulated person placing itself before seeing results | Proxies what a participant expects to see; same model family |
| R4 | Verified public P(doom) statements | Eight personas; outcome definitions and horizons vary |

Scores use the **consensus**, the mean of R2 and R3. The two agree with each other more closely than the product agrees with either, but may share biases, and the y references are the least consistent. Treat errors as comparisons between designs, not absolute accuracy.

Each reference records its provenance (method, model, prompt and engine versions) and a hash of the brief it read. `score` and the dry run flag references built from an older brief. The initial store was converted from the audit's references without new calls. Its R1 was built with algorithm 0.6.1 and a direct probe of the projection questions, so it is stale for the current engine until rebuilt; a rebuilt R1 runs the full engine.

### Commands

```sh
pnpm benchmark:run --dry-run                          # plan and estimate; no network, nothing written
pnpm benchmark:run --allow-paid --max-cost=10         # core set; prints the run id
pnpm benchmark:run --resume=<run-id> --allow-paid     # finish failed or unstarted interviews
pnpm benchmark:score <run-id>
pnpm benchmark:compare <baseline-run-id> <candidate-run-id>
pnpm benchmark:run --set=retest --allow-paid          # or --repeats=N for any selection
pnpm benchmark:run --personas=casual-unsure,frontier-pacer --styles=terse --max-answers=6 --dry-run
pnpm benchmark:refs --only=r1 --set=core --allow-paid  # rebuild references; --only=r4 is free
```

Runs are saved under the ignored `eval/runs/benchmark/<run-id>/`: `plan.json` (interviews, versions, engine/content/participant hashes, commit), `ledger.jsonl` (every paid call), one `jobs/<persona>__<style>__<repeat>.json` per interview with each question, reply, disposition, readiness and shown result, and the `score` outputs. `compare` saves `compare-<baseline-run-id>` in the candidate run's directory. A resumed run refuses to continue if the engine, content, briefs or participant prompt changed; start a new run instead. `refs` rewrites the committed store; review and commit its diff.

To measure a change, run `core` on the base revision and again with the change, then compare. `compare` scores both runs against the current reference store, so a comparison never mixes reference versions.

### Cost and credentials

Paid commands require `--allow-paid`. `--max-cost` (default $5, at most $20) caps a run's cumulative estimated spend across resumed sessions; when it is reached, no new interviews start and the run can resume with a higher cap. Estimates use published token rates with cached input charged in full; they are not an invoice. The dry run prints a typical and a worst-case estimate: a full `core` pass costs roughly $6–7, so pass a higher cap. Rebuilding R1 uses Jev only, well under a dollar for the `core` personas; rebuilding R2 and R3 for all personas costs about $7.

`TYPESAFE_API_KEY` is read through `--env-file=.env.development.local`; `OPENAI_API_KEY` must be in the shell environment. The tools never print credentials, and saved errors carry only local failure categories. Paid runs remain occasional development work under the [simulated-user authorization](user-journeys.md#live-models-and-boundaries), not a routine test or release gate.

### When to run it

- **Every rubric, prompt, question or estimator change:** `core` before and after, then `compare`.
- **Readiness, routing or stopping changes:** also read answers to result and readiness timing by style.
- **Displayed-range or reliability changes:** `retest`.
- **After changing a persona brief:** rebuild its R2 and R3. After an engine change, rebuild R1 before using it.

## Feedback audit

`pnpm feedback:audit` reads [result feedback](PERSISTENCE.md#result-feedback) with the rated snapshot, the result and transcript that were shown, and writes a review packet. It reads the local development database by default. `pnpm feedback:audit --production` opts in to production. Connection selection and read-only settings match the [admin tools](admin.md): a direct URL from `ADMIN_DATABASE_URL`, `DATABASE_MIGRATION_URL` or `DATABASE_URL`, `default_transaction_read_only=on` and a 15-second statement timeout. It never writes to a database and makes no HTTP requests, so participant text is never sent to a model or service. The table needs migration `0007_assessment_feedback`.

Options: `--since=2026-10-01` limits by feedback date; `--sample=40` and `--seed=1` choose the reproducible disagreement sample.

The packet is written to the ignored `eval/runs/feedback-audit/<timestamp>-<target>/`, readable only by the current user:

- `summary.md` and `summary.json`, aggregates only: agreement rate overall and by answer length, displayed outlook and algorithm version; aspect counts; self-placement error for x and y (mean signed, mean and median absolute, share beyond 0.2); stated versus shown P(doom) for percentages written in sentences about catastrophe; how many ratings were followed by further answers.
- `disagreements.md`, private: a sample of rated results marked "Not quite" or placed more than 0.25 from the participant's guess, with the exact questions, replies (including rejected ones) and the displayed result.

Displayed values come from the rating itself when recorded, otherwise from the rated snapshot with today's presentation. The terminal shows only aggregate counts.

### Review loop

1. Run the audit occasionally, for example after a release has collected enough feedback.
2. Read the aggregates first. Look for patterns across many participants and segments, such as low agreement for short answerers or a consistent self-placement bias on one axis. Do not over-index on a single rating or comment: agreement is not correctness, and a participant's self-image can differ from what they wrote.
3. Read the sampled disagreements to form a concrete hypothesis about a prompt, rubric, estimator or presentation.
4. Reproduce it offline with simulated personas or reviewed examples, change authored assets or code, and measure the change with the benchmark.
5. Record the evidence, decision and follow-ups in a dated `docs/research/` note, as the [release learning loop](MEASUREMENT.md#release-learning-loop) describes.

Keep the packet local. Sending real transcripts to a model, for example to re-score them or build real-user-grounded personas, requires explicit approval first.
