# Acemoglu source addition — October 8, 2026

Added [Will AI replace workers? Not if we build it right](https://humanistreview.ai/issue-1/acemoglu-ai-replace-workers/) to `pro-worker-economist` in `lib/journeys/social-public-personas.ts`. The URL was absent from the repository after fetching `origin/main`; the checkout matched main at `a645b8e9`.

The publisher dates the essay July 15, 2026 and attributes it to Daron Acemoglu. Inspected the full authored article, from its opening through the concluding human-agency argument, on October 8. Linked studies were not independently audited. The brief preserves the estimates as uncertain historical forecasts, distinguishes prototypes from validated outcomes, and retains the later September capability update.

Existing sources and beliefs remain intact. The owner subsequently authorized regeneration, a PR with automatic merge after CI, and production publication.

Validation on the dirty tree based on `a645b8e9`: `pnpm resources:previews --url=https://humanistreview.ai/issue-1/acemoglu-ai-replace-workers/` added the publisher image and icon, both visually inspected. `pnpm test` passed format, lint and types; unit tests passed 745 of 746, with the unrelated all-portraits social-card test hitting its five-second timeout. Running `pnpm exec vitest run lib/sharing/social-card.test.ts` separately passed all three tests, including all portraits in 4.37 seconds. `pnpm test:content`, `pnpm test:unused` and `git diff --check` passed. The initial sandboxed type-generation attempt was blocked by SWC native-cache permissions; the approved rerun passed type generation. No test limits or application behavior changed.

## Regeneration and review

Verified `.env.development.local` targets native loopback PostgreSQL database `doom_bloom_dev`. Ran `pnpm journeys:generate --persona=pro-worker-economist --max-cost=2` on October 8.

- Run: `1791455489199-ee24ef52-21be-4ade-8669-46fcd4c529e1`.
- Local selected assessment: `5d15de7c-79e7-49b2-93a3-5e0e44f9fc73`, engine `0.7.5`, payload `simulation_v1`.
- Selected digest: `c66a677dbdda0334712550c45e4de80033ad9784135688fab5f4d6611949d3c0`.
- Four accepted answers and four per-answer results, 89.73% readiness, automatic stopping and no error.
- Four OpenAI replies and 26 Jev requests, estimated generation cost `$0.09648927` against the $2 cap.
- Simulated outlook `0.36375`, expected transformation `0.63375`; inferred P(doom) about 4% with a 3–8% displayed range. The inference is from simulated answers, not Acemoglu's stated probability.

Reviewed every question and answer against the brief. The simulation preserves useful complementary applications, adoption bottlenecks, distributional and democratic concerns, the distinction between goal-directed autonomy and general intelligence, and caution about exact technical forecasts. It declines to state a numerical catastrophe probability. There are no repeated questions. The answers are fictional synthesis, not authenticated quotations.

Only `dacemoglumit` changed selection in the local database. The old selected assessment `4edb1cc2-c6d6-4e62-b58f-37b81d8a07a0` remains immutable. The other 215 profiles retain identical metadata, briefs, selected assessment IDs and selected digests (aggregate SHA-256 `c9c3e0d8259d3d4d0992720d635e7273ee41c9a0da27c58eca4a6b53ad036eb4`). The new snapshot contains all 13 authored sources, including the essay and older sources.

Refreshed only Acemoglu's benchmark R2/R3 references and copied R4 using `pnpm benchmark:refs --only=r2,r3,r4 --personas=pro-worker-economist --max-cost=1 --allow-paid`, estimated cost about $0.06. Other personas' references retain their provenance. R1 remains the historical engine reference, as documented in the benchmark contract.

## Release checks

After the reference refresh, `pnpm test` passed all checks, including 121 test files / 746 tests, content validation and unused-code checks. Browser inspection of the isolated Portless profile verified outlook 36 / transformation 63, the inferred probability label, the new source card and all four expanded answers. `pnpm build:local` is pending.

The read-only production import plan is scoped to `dacemoglumit` and reports one new selected run. Before publication, production holds 214 profiles; Acemoglu's old selection is `909cba7a-e0ba-4191-a7bc-a489a6e6f84d`, digest `fcc03d42958d7032c9ecf00b22d7be6de71023dcf334932f9a01963dacdc96d0`. The other 213 profiles' aggregate hash is `627a7508883327b413a6691f724e39c7ba09d59fd60545bfc4703d906adb6849`. Publication and deployed-profile verification are pending.
