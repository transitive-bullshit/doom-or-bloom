# Eli Lifland source refresh — October 11, 2026

Added the two owner-supplied posts to `independent-eli-lifland`, retaining all earlier sources as dated context:

- [Current forecast](https://x.com/eli_lifland/status/2109082373644308554): roughly 10–15% for broadly superhuman AI by end of 2027 and 50% by end of 2030; roughly 67% takeover if companies do not slow down; roughly 40% extinction conditional on takeover, with many deaths possible in non-extinction worlds.
- [Definitions and reasoning](https://x.com/eli_lifland/status/2109082375208755506): broadly superhuman means TED-AI, at least as good as top human experts at virtually all cognitive tasks. Clear signs of takeover could follow TED-AI substantially later or around the same time. Links supporting forecasts and Ryan Greenblatt’s fatalities discussion; those linked texts were not separately read or added as independently verified sources.

## Access and editorial changes

Both posts were absent from the local Birdclaw archive. Authenticated `bird` lacked credentials. Public FxTwitter v2 returned HTTP 200 and JSON code 200 for both posts, attributed to `eli_lifland`, published 2026-10-11 at 00:43:17 UTC. Read the complete returned text, including the reply’s expanded URLs. No paid X fallback was needed.

Updated the source summaries, quoted anchors, current-view background and beliefs. The earlier 2032/2035/2036 medians and April 2025 risk estimates remain historical context, explicitly superseded by the current forecast. Added four short exact public quotes about capability timing, the capability definition, takeover timing and non-extinction harms. Numerical takeover/extinction risk belongs on the public probability card, not in the quote section.

Replaced the dated ≈50% takeover override with ≈67%, retaining the explicit no-slowdown condition. The separate 40% is conditional on takeover, not an unconditional extinction probability. No derived 26.8% override was invented. Capability dates do not establish a takeover or extinction deadline. Updated the P(doom) hub note to match.

FxTwitter also supplied the verified account id and 10,435 followers; refreshed only this account’s count and capture date. Generated preview metadata and four WebP assets for the two URLs; the profile renders both as embedded posts.

## Generation and validation

Generated only `independent-eli-lifland` with `pnpm journeys:generate --persona=independent-eli-lifland --max-cost=2`, after verifying that the existing development configuration targets loopback PostgreSQL. Run `1791711984154-101295a7-8964-4beb-8033-faee56046f31` contains four accepted answers, about 95% final readiness, automatic completion and a final result. GPT-5.6 Sol made four participant requests; Jev made 25 physical requests. Estimated cost: $0.086877732, not a provider invoice. Engine `0.7.5`, content `0.4.0-draft`, rubric `0.1.0-draft`, Jev `jev-1.13.0`.

Reviewed every generated answer. They preserve the updated timelines, TED-AI definition, no-slowdown takeover condition, conditional extinction probability, and distinction between capability arrival and takeover timing. Answer 3 derives about 27% extinction along the no-slowdown path; this is generated arithmetic, not an additional public quotation or a separately verified self-report. The public card retains the directly stated 67% takeover estimate. Earlier runs were not rewritten; generation selected a new immutable local run.

Final map coordinates are 11.2 outlook and 94.9 transformation on the 0–100 display scale. The result’s sourced P(doom) override is ≈67%, with the engine’s underlying inferred estimate preserved separately.

Validation on the task worktree based on `origin/main` (`git rev-list --left-right --count HEAD...origin/main` was `0 0` before edits):

- `pnpm test` passed: formatting, lint, types, all 746 tests in 121 files, content validation and unused-code checks. Initial sandbox execution could not access the native compiler cache; the authorized rerun succeeded. The first full run caught an outcome word in the quote summary; corrected it and reran all checks successfully.
- Both `pnpm resources:previews --url=<post>` commands completed, adding only the selected URLs and their assets.
- Headless Chromium loaded the local profile, verified the exact two source links and four-answer disclosure, and rendered the new quote section and conditioned ≈67% card. Visually inspected the full-page screenshot. With follower sorting selected, the local directory shows Eli’s refreshed count as 10.4K followers.
- Refreshed only Eli’s R2/R3 benchmark references with `pnpm benchmark:refs --only=r2,r3 --personas=independent-eli-lifland --max-cost=1 --allow-paid`: two independent-judge samples and three self-placement samples, about $0.06 estimated. Reviewed the reference diff; other personas are unchanged.

## Production publication

With the owner’s explicit authorization, ran the scoped production import plan and write for `eli_lifland`. Production now selects the exact local snapshot digest `83bd95e84c423ef4cd7aa528f935ffd1b3a69db787143c4b5fb21b8461510e87`: 11 sources including both new posts, four accepted answers and the conditioned ≈67% statement. Verified the previous assessment’s digest and public visibility are preserved. All other 213 selected profiles are unchanged. Private before/after verification artifacts are retained in ignored `work/eli-production/`.

The subsequent authorized push to `main` supplies the static quotes, source previews, follower metadata and refreshed benchmark references; deployment is verified separately after the push.
