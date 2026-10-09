# Nick Bostrom: MTS interview refresh

Research date: October 9, 2026. Updated `superintelligence-philosopher`, public slug `nick-bostrom`.

## Source and reading scope

The supplied [MTS post](https://x.com/MTSlive/status/2108295519550439517) publishes the full interview and chapter markers. The matching publisher upload is [Why Speeding Up AI Could Save Lives | Nick Bostrom](https://www.youtube.com/watch?v=nAbIqt_w0g8), dated October 8, 2026, duration 3,287 seconds, on MTS's `@mtsituation` channel. The video metadata links that channel, the MTS X account and its other publisher outlets.

Retrieved the complete original English automatic captions (`en-orig`, JSON3 and WebVTT) from YouTube and reviewed the interview's substantive turns from 01:24 through 53:20. These are machine captions, not a publisher-edited transcript: obvious transcription errors, uncertain numbers, names and technical terminology are not quoted. The opening montage repeats the later timing passage; quotes link to the full answer. Host questions, advertisements and editorial framing do not ground the persona. The saved JSON3 caption SHA-256 is `867f433519cb038156ff9331eaa01c2357e186800c30c8654640ef5b99946b0d`.

Relevant passages:

- 03:51–11:05: reinforcement learning, instrumental convergence, training-time safety and detecting scheming before concealment becomes sophisticated.
- 11:33–17:49: the timing paper's existing-person scope, mortality during delay, short safety delays and differential technological development.
- 19:29–22:25: preparing the option to slow the frontier, risks of poorly implemented pauses, and adapting policy to emerging information.
- 33:47–39:54: uncertain possible experience in current models and a multidimensional view of consciousness.
- 40:39–43:03: benefits and risks of open source, DNA synthesis as a potential control point, biosecurity and digital welfare.

No new personal P(doom) or calendar forecast was established. The 51/49 remark at 24:32–24:38 concerns the net effects of publicizing ideas, not AI catastrophe. The prior NYT interview access gap remains unresolved and separate.

## Public statements

Added Bostrom's first public-statements file with two short, contiguous excerpts from his own MTS turns: the frontier-pacing statement at 19:29 and mortality-during-delay statement at 14:18. Each links directly to its surrounding answer. The timing quote is conditional on insufficient safety improvement and should be read with the preceding allowance for useful safety delays.

The third quote preserves his historical control-problem perspective. Re-fetched [The Superintelligent Will](https://nickbostrom.com/superintelligentwill.pdf) and checked the complete sentence under “The Orthogonality Thesis.” Its May 2012 date is the paper's publication date. The surrounding qualifications distinguish a conceptual possibility from the goals learned by present models. No simulated answer is presented as a quotation.

## Generation and publication

Ran `pnpm journeys:generate --persona=superintelligence-philosopher --max-cost=2` against native local PostgreSQL. Run `1791514782215-7e9801fe-b38e-417f-9110-9f080fe87392` produced five accepted answers, 79% evidence readiness and a result under engine 0.7.5, ending at the five-answer budget. Estimated cost was $0.17759. The saved record hash is `fd5f685e31d7e29fd48c93c19af350e8a52e74fc873bf73d724d92d63cd4cb6d`. The source snapshot retains the prior 18 sources and adds the MTS interview as its nineteenth.

Reviewed the generated answers and result against the brief: benefits and control risks remain together, timing arguments retain their qualifications, and no verified personal numerical P(doom) was added. The result's displayed probability remains explicitly inferred. Bostrom is outside the benchmark sets, so no paid benchmark references were rebuilt.

Validation on the dirty task tree based on `f6bddea7`:

- `pnpm test`: 121 files and 746 tests passed, with formatting, lint, types, content and unused-code checks.
- `pnpm db:test:personas`: passed exact import, idempotency, provenance conflicts, publication validation, ordering fences, stable old URLs and metadata-only sync.
- `pnpm check:persistence tests/persistence/personas.spec.ts`: one test passed.
- `pnpm build:local`: passed; verified 214 pregenerated profiles and required assets.
- Local Chromium review: HTTP 200, three exact public statements with their source links, the new video bookmark, no client errors and no overflow at 390px. Desktop and mobile screenshots are saved locally.

Initial local checks needed native-cache access and a complete saved fixture collection. Restored the already-generated Neha fixture without inference, then used a fresh disposable test database because the shared test database retained newer selections than the copied fixture collection. The successful checks used that isolated database.

`personas:import plan --env .env.production.local --ids nick-bostrom` identifies one new selected run. The production baseline contains 214 profiles; publication verification compares the other 213 selections, metadata and briefs and retains Bostrom's prior immutable simulation. Production results are recorded below after the targeted import.
