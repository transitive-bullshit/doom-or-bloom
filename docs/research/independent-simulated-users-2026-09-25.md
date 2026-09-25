# Independent 100 simulated users

Source list: [The Independent 100](https://independent.prose.md/), inspected September 25, 2026. The [exact account/portrait manifest](independent-100-accounts-2026-09-25.json) records the 99 numbered entries. The unnumbered nomination contact is excluded.

## Identity and research

There are **97 additions**. Scott Alexander (`slatestarcodex`) retains the original `rationalist-safety-advocate` fixture. The directory identifies `allTheYud` as Eliezer Yudkowsky's alternate account; it resolves to the original `control-alarmist` / `esyudkowsky` fixture. Neither original is regenerated or demoted.

Research packets and source-scoped claims:

- [Accounts 1–34](independent-first-2026-09-25.md): 32 additions after the two duplicates.
- [Accounts 35–67](independent-middle-2026-09-25.md): 33 additions.
- [Accounts 68–99](independent-last-2026-09-25.md): 32 additions.

The new briefs contain 235 source records (223 distinct URLs), including 42 original X posts and 74 records dated 2026. Each has at least two source records; a profile, index, or directory link establishes identity or context, not necessarily a substantive position. Records distinguish inspected text from unavailable articles, institutional work from individual statements, hosts from guests, and coauthored research from personal forecasts. Public X website failures were supplemented with authenticated read-only X API retrieval, including long-form post bodies where available.

Recent statements are paired with lasting essays and technical work when relevant. This remains a bounded source review, not an exhaustive reconstruction of anyone's beliefs. Technical builders often have no verified extinction probability or detailed governance position in the reviewed material. Simulations must preserve those gaps, never infer them from occupation, affiliations, or directory category. Voices are editorial approximations grounded in the reviewed writing, not authentic quotations. See individual packets for freshness and evidence limits.

## Product and generation contract

All additions default to `featured: false`; the original 44 public simulations retain their featured status. `/users` shows every selected public simulation on the existing map (when placed) and in an alphabetical name/handle-searchable grid. `/` retains its featured-only map. The public label is **simulated users**; internal persona identifiers remain compatible with saved data.

Only the 97 additions are selected by `--group=independent`. Live OpenAI answers pass through the real Jev interpretation, routing and result generation. No desired scores, placements or probabilities are supplied. Four interviews may run concurrently under shared request/cost ceilings. Scoped saves retain previous journeys and their original batch provenance; reported cost belongs only to the new batch. Successful runs are selected in native local Postgres; failures retain private diagnostics and do not replace selected runs.

## Generation and verification evidence

The saved fixture now contains 152 journeys: all 55 original journey objects are deeply equal to the baseline, plus 97 new completed results with 258 accepted answers. Native local PostgreSQL selects 141 public simulations, of which 44 are featured. Adam Elmore's simulation has a result but insufficient evidence for a map coordinate; it remains accessible in the directory grid. The other 140 public simulations appear on the map.

- Main batch `1790326998993-76c5151e-b2b4-4080-bdf2-5055d3e4bc6d`: 97 interviews, 95 initial results, 265 participant requests, 1,031 Jev requests, estimated $3.2614.
- Scoped correction `1790327755477-29aef067-a9dc-4a8e-97af-3ffa19272822`: six interviews, six results, 13 participant requests, 53 Jev requests, estimated $0.1786. This adds source evidence for Karan and Lyrical and removes research-packet narration from four other voices. Only those six outputs replace the main batch's corresponding journeys.
- Single-user verification `1790326924978-751c4c8d-d1ef-4b9e-8557-1f6200a8a4a5`: three participant requests, 15 Jev requests, estimated $0.0420; superseded by the main batch.

Validation on base `1c34467` plus this checkpoint's changes: `pnpm test` passed all 283 tests in 58 files, formatting, lint, types, content and unused-code checks; Vitest took 4.60 seconds. `pnpm db:test:personas` passed exact imports, idempotence, selected-run provenance and featured status. The landing/breadcrumb browser checks passed 12 cases in 43.9 seconds, including name/handle search, empty results and mobile overflow. The persona persistence browser check passed in 15.9 seconds. `pnpm build:local` passed compilation and production trace/portrait checks, with `/users` prerendered using one-day ISR. No deployment or production mutation was performed.

## Interview voice correction

An initial development batch was interrupted after sample review found answers narrating the research packet (for example, referring to a source brief). Its completed simulations remain historical local database runs. The participant instructions were tightened to keep evidence limits backstage and speak directly about supported views, without turning missing evidence into invented opinions. A single-user verification run completed with three accepted answers, 15 Jev requests and an estimated $0.0420. The final 97-user batch supersedes the initial new-user outputs. The interrupted batch has no complete aggregate usage report; final-batch costs must not be presented as the total spent across development.
