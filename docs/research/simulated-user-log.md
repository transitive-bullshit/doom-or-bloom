# Simulated-user log

Dated records of simulated-user additions, source refreshes, regenerations and imports, oldest first. Counts, coordinates and commands here describe their date; the current workflow and limits are in [user-journeys.md](../user-journeys.md). Each entry links its research record. Add new entries at the end.

## Initial public-source expansion — September 20–21, 2026

This historical source-selection record explains the initial briefs. Current public-person simulations follow the [fidelity rules](../user-journeys.md#purpose-and-authoring) and the current catalog, rather than treating these early editorial labels as target outcomes.

The public proxies are:

- **Control alarmist — Eliezer Yudkowsky:** conditional extinction forecast under current methods; uncertainty about timing and hope for political intervention do not dilute the central claim.
- **Cautious builder — Sam Altman:** ambitious abundance and individual empowerment, including his September 2026 endorsement of frontier pacing and independent evaluators.
- **Abundance advocate — Marc Andreessen:** strong pro-building rhetoric, moral costs of delay and opposition to incumbent-protecting regulation.
- **Doomer-hoax critic — Jensen Huang:** deliberately selected incendiary All-In anti-doomer arguments and endorsement of the hoax framing, rather than an average of his public positions. Preserve speaker attribution during Trump's call.
- **Frontier pacer — Dario Amodei:** unusually large potential benefits alongside serious risks and an explicit present call to slow frontier capability growth.
- **Empirical skeptic — Gary Marcus:** current architectural limits, concrete misuse risks, and complementary regulation and liability.
- **Practical optimist — Andrew Ng:** application-driven benefits, skills transitions and engineering fixes rather than a pause.
- **World-model optimist — Yann LeCun:** a different technical route to powerful AI, with physical-world planning and open research.
- **Concerned pioneer — Geoffrey Hinton:** control and employment concerns alongside substantial medical and educational potential.
- **Bubble critic — Ed Zitron:** unreliable products, concentrated financial risk and responsibility for present harms.

- **Democratic moratorium — Bernie Sanders:** public control, worker protection and a proposed superintelligence ban.
- **Competitive decentralist — David Sacks:** continued development, competition, open models and product liability.
- **Scientific steward — Demis Hassabis:** extraordinary scientific ambition and a coordinated standards framework.
- **Coordinated scaler — Sholto Douglas:** rapid safe progress, economic transformation and opposition to concentrated power.
- **Alignment maximalist — Roon:** radical transformation, urgent alignment work, frontier pacing and broad access to safely trained models.
- **Efficient intelligence builder — Noam Shazeer:** engineering efficiency, substantial benefits and increasing care with capability.
- **Reasoning frontier builder — Noam Brown:** scientific progress, real bottlenecks and layered defenses.
- **Learning bottleneck investigator — Dwarkesh Patel:** continual learning, evolving views on research acceleration and changing oversight requirements.
- **Abundance risk-taker — Elon Musk:** extraordinary abundance from AI and robots, serious control concerns and recent support for frontier pacing.
- **Open-science realist — Nathan Lambert:** economically consequential progress and open research, with skepticism of runaway self-improvement and concern about inadequate risk preparation.

The first five additions were researched on September 21, 2026. Their authored briefs retain dated primary-source links and summaries in `lib/journeys/additional-public-personas.ts`; each has 2026 grounding. LeCun’s 2024 interview is explicitly older conceptual context. These are narrative inputs, never desired coordinates, probabilities or reasoning scores.

The next eight briefs in `lib/journeys/frontier-public-personas.ts` prioritize recent first-person statements, including September 2026 posts retrieved directly through the X API. Shazeer’s broader worldview uses his own turns in a February 2025 interview, supplemented by 2026 engineering statements; no fresh policy position is inferred from his job change. Dario’s existing brief was refreshed, not duplicated. Musk’s subsequent addition uses April–September 2026 first-person posts, the January Davos transcript and a clearly identified mirror of his July Economist interview. His latest pacing endorsement takes precedence over a simple unconditional-acceleration stereotype. [Research notes](persona-expansion-2026-09-21.md) record source limitations and attribution rules.

Lambert’s four primary essays include his September 19 RSI post, September 9 adoption essay, August 9 safety analysis and September 21 open-model briefing. Distinguish his forecasts from the views he quotes; his skepticism about runaway self-improvement does not imply insignificant AI benefits.

The [existing-proxy source packet](persona-grounding-existing-2026-09-20.md) and [new-proxy source packet](persona-grounding-new-2026-09-20.md) record dates, sources and retrieval limitations. Some statements were retrieved through linked mirrors; distinguish verified words from editorial persona synthesis.

## Expanded canonical public figures — September 21, 2026

Sixteen additional source-grounded participants bring the public set to 36 people and the full collection to 47 journeys (46 generated personas plus the fixed personal replay). All new public briefs request detailed answers and supply narrative beliefs, dated source summaries and voice guidance, never desired coordinates or judgment targets.

- [Foundational researchers](foundational-personas-2026-09-21.md): Yoshua Bengio, Ilya Sutskever, Andrej Karpathy, Fei-Fei Li, Richard Sutton, Stuart Russell, Max Tegmark and Liang Wenfeng.
- [Social and economic perspectives](social-personas-2026-09-21.md): Timnit Gebru, Arvind Narayanan, Daron Acemoglu, Mark Zuckerberg and Emily M. Bender.
- [Public leaders](civic-personas-2026-09-21.md): Barack Obama, Donald Trump and Bill Gates.

The briefs prioritize inspected recent first-person material. Sutton’s substantial verified sources remain from 2025; Liang’s direct interviews are from 2023–2024. An unverified purported 2026 Liang meeting was excluded from participant inputs. These freshness limits remain visible in the source packets.

At this checkpoint, the featured prototype map included all 36 public personas, including the existing Jensen Huang journey. Coordinates come only from saved live assessments. Portrait provenance and official-source fallbacks are recorded in `public/personas/SOURCES.md`. The latest collection retains existing valid journeys while incorporating live runs for the new personas, with original generation provenance for each batch.

The [live generation record](canonical-persona-run-2026-09-21.md) records the new batch’s observed placements, costs and validation.

## Soares and Greenblatt — September 22, 2026

At this checkpoint the canonical map included 39 public figures and the collection contained 50 journeys: 49 generated personas plus the fixed personal replay. Added [Nate Soares](nate-soares-persona-2026-09-22.md) with 10 source records and [Ryan Greenblatt](ryan-greenblatt-persona-2026-09-22.md) with 12. The supplied videos remain linked; Ryan's matching publisher transcript is available, while Nate's linked interview was not transcript-accessible and substantive grounding comes from separately inspected sources.

Both new personas use detailed GPT-5.6 Sol answers and live Jev routing and projection. Each completed after two accepted answers. The new batch used four OpenAI requests and 20 Jev requests, estimated at $0.0912. Collection `1790016746550-bb749692-1ce5-4c35-837f-27fce8dccc82` retains the previous 48 current journeys and records both generation batches in `sourceRuns`; it is not a replay of all 50. That checkpoint used a latest-collection store; current storage retains immutable per-user records and manifests as described in [Budgets and storage](../user-journeys.md#budgets-and-storage).

Soares' observed outlook is 18/100 and transformation 99.7/100, with inferred P(doom) approximately 62%. His brief's collective conditional MIRI estimate is not used as a personal public-probability override. Greenblatt's observed outlook is 37.5/100 and transformation 87/100. His source-backed displayed 35–40% is AI takeover by 2040, dated August 11, 2026; the original inferred estimate is approximately 33%. These are outputs of the live runs, not target coordinates or labels supplied to Jev.

## Carlsmith, Alexander, Kokotajlo and Cowen — September 22, 2026

Added four detailed source-grounded participants and their canonical map entries:

- [Joe Carlsmith](joe-carlsmith-persona-2026-09-22.md): 12 sources, including the supplied essays and verified Dwarkesh transcript.
- [Scott Alexander](scott-alexander-persona-2026-09-22.md): 13 sources, including the supplied September 20 post and June personal forecast update.
- [Daniel Kokotajlo](daniel-kokotajlo-persona-2026-09-22.md): 11 sources, including AI 2027, AI 2040, August forecasts and the Palisade interview.
- [Tyler Cowen](tyler-cowen-persona-2026-09-22.md): 10 sources, including September economic analysis and interview, July DeepMind talk, regulation proposals and a verified X post.

Collection `1790017721834-b165144d-d663-462a-aadf-ea5fc949d961` contains 54 journeys: 53 generated personas and the fixed real-user replay. The featured map contains 43 public figures. The new batch uses GPT-5.6 Sol and live Jev; existing 50 journeys are retained unchanged, with original batch provenance in `sourceRuns`. The four new runs completed without errors, using 13 OpenAI requests and 65 Jev requests, at an estimated $0.2724.

| Persona | Accepted answers | Outlook | Transformation | Displayed P(doom) |
| --- | --: | --: | --: | --- |
| Joe Carlsmith | 5 | 41/100 | 98.5/100 | Inferred ≈21% |
| Scott Alexander | 4 | 67.2/100 | 91/100 | Stated 20%, June 11, 2026 |
| Daniel Kokotajlo | 3 | 20.8/100 | 88/100 | Inferred ≈67% |
| Tyler Cowen | 1 | 74/100 | 31/100 | Inferred ≈12% |

These are observed outputs, not target coordinates. Scott's public override preserves the current-safety-effort, possible-pause and no-fixed-deadline context. Joe's old 5% has been repudiated and his more recent double-digit wording does not establish a precise percentage. Daniel's reported 70% was not verified against the original episode, so no public override is supplied. AI 2040 remains explicitly a policy recommendation rather than a 2040 arrival forecast. Cowen's slower-adoption interpretation is the engine's output; the brief also includes his expectations of eventual institutional transformation.

All new regular source bookmarks have local preview images; six Cowen article screenshots provide fallbacks where automated preview retrieval failed. X portraits are recorded in `public/personas/SOURCES.md`.

## Andrew McAfee — September 23, 2026

Added [Andrew McAfee](andrew-mcafee-sources-2026-09-23.md) at `/users/amcafee` with seven dated 2026 sources: four original-publisher interviews/articles, two authored X posts, and the requested Diary of a CEO debate. Only his labeled turns from the third-party debate transcript ground the persona; neither other speakers nor the full transcript are included. His official MIT biography supplies the portrait.

Collection `1790155057347-68d138b5-54b4-45c9-94aa-9de424aeddbe` contains 55 journeys and 44 public figures. The new live run completed after one detailed accepted answer, with one GPT-5.6 Sol request and five Jev requests, estimated at $0.0181. All previous 54 journey records are preserved unchanged, with original batch provenance. The top-level cost reports only this new batch.

The source-backed displayed P(doom) is approximately 0%, explicitly rounded rather than impossible, with no fixed forecast horizon. Its numerical display anchor is zero; it is not a measured exact probability or an invented uncertainty interval. The original inferred estimate remains recorded. The transformation result is 47.4/100 and human influence is tentative; these are live model outputs, not editorial targets.

## Independent 100 — September 25, 2026

The 99 numbered accounts at <https://independent.prose.md/> yield 97 new simulated users: `@allTheYud` retains the existing Eliezer Yudkowsky fixture and `@slatestarcodex` retains Scott Alexander. The wildcard nomination contact is not an entry. Exact account and portrait provenance is in [the directory snapshot](independent-100-accounts-2026-09-25.json).

## Source-driven refresh — September 25, 2026

Regenerated all 103 selected users whose recorded source/voice/belief inputs differed from the current catalog: all 97 additions and six original users. All succeeded and are selected locally; 38 unaffected public users and 11 development-only journeys are preserved. Earlier immutable database runs remain unchanged. [The regeneration report](source-regeneration-2026-09-25.md) records source matching, batch recovery, usage limitations and result deltas.

This refresh used compact monolithic diagnostic artifacts. Current generated artifacts use the per-user store described in [Budgets and storage](../user-journeys.md#budgets-and-storage); the checked-in sample remains a small test fixture.

## Ramez Naam — September 27, 2026

Added [Ramez Naam](ramez-naam-persona-2026-09-27.md) at `/users/ramez` with nine dated primary-source records, including his guest essay on Noahpinion. The brief distinguishes useful AI progress from runaway takeoff, preserves his preference for plural access alongside practical safeguards, and excludes Noah Smith’s introductory forecasts. No numerical public P(doom) override is supplied.

The scoped live run completed after one substantial answer under the ordinary automatic stopping policy, using one GPT-5.6 Sol request and five Jev requests for an estimated $0.0212. Its selected result is persisted locally; the generated collection retains all 143 prior records unchanged. The research record contains exact run provenance, source limits and verification. Like the other recent additions, he is in the simulated-user directory with `featured: false`.

## Engine 0.7.1 re-evaluation — September 29, 2026

The September 29 run re-evaluated 135 of the 144 selected simulated users from engine 0.6 to 0.7.1, for $1.36 in Jev calls. The other nine keep their runs because the current engine would not offer a result from their one to three recorded answers. The share of simulated users at the “mixed” outlook fell from 19% to 12%, both ends grew, and the median inferred P(doom) moved from 7.9% to 4.7%. All eight verified public statements carried over.

## Simulated users batch 1 — October 1, 2026

Added 25 source-grounded simulated users to balance a catalog that sat mostly near the pragmatic-optimist group. They are critics of AI claims, pause and x-risk advocates, safety and policy writers, builders and commentators, and journalists and podcast hosts; two of them are pseudonymous accounts simulated from their own posts. Each brief has 8–12 inspected primary sources, and all are listed in the directory with `featured: false`. Eight verified first-person P(doom) statements are recorded with their outcomes, horizons and conditions. Three candidate numbers were excluded because their scope or attribution did not support a displayed estimate. The [batch record](simulated-users-batch-1-2026-10-01.md) links the five research records and gives run provenance, the fidelity review, coverage limits and verification.

Scoped live runs (`--persona=<id> --turns=5 --max-requests=24 --max-cost=0.3`) used 106 GPT-5.6 Sol and 550 Jev requests, for an estimated $2.72. Six final operations hit Jev timeouts or the request budget and were completed by one bounded resume each. A 24-request cap is too low for a five-answer interview; see [Budgets and storage](../user-journeys.md#budgets-and-storage). The selected runs are persisted locally only; the local collection retains all 144 prior records unchanged.

## P(doom) sources — October 2, 2026

An audit of all 169 simulated users added 14 verified public P(doom) statements (30 in all) and up to two missing sources to each of 28 briefs: the statements' backers, refusals and close statements, and a rewrite of Roko Mijic's outdated brief. Those 28 users were regenerated with scoped live runs for an estimated $2.15. The six whose briefs did not change got their statement through `personas:reevaluate plan --restate`, on copies of production's September 29 runs, with no inference. The selected runs are local only. The [research record](pdoom-sources-2026-10-02.md) lists the statements and exclusions, the sources per user, before and after placements, the fidelity review and the import command.

## Neutral one-liners — October 2, 2026

All 169 one-liners were rewritten under [the one-liner rule](../user-journeys.md#simulated-user-one-liners) after Travis found them too terse and tilted toward doom. Each now names a role and what the person argues or works on; P(doom) numbers and outcome claims are gone except inside five verified quotes, such as Yudkowsky's book title. No interview was regenerated. The [research record](neutral-one-liners-2026-10-02.md) lists the largest changes, the least certain lines and the production metadata sync.

## Acemoglu sources and Zitron fidelity — October 2, 2026

The [source refresh and placement investigation](acemoglu-zitron-refresh-2026-10-02.md) adds seven recent Acemoglu posts and records his regenerated local journey. It traces Zitron’s upward move to a newly generated answer to the direct scale question, preserves source metadata missing from this checkout, and documents remaining simulation sensitivity. These are local selected runs; production was inspected read-only. No shared scoring rule changed.

## Sholto Douglas and Nick Marwell — October 3, 2026

Added the requested American Optimist interview to Sholto’s brief and created Nick Marwell’s `frontier-diffusion-researcher` brief with `/users/the_marwell` presentation metadata. The [source review](sholto-marwell-interview-2026-10-03.md) records separate, bounded passages for each guest. The publisher supplies lightweight transcript JSON, but its generic speaker labels misattribute some host questions. Only text-reviewed passages are included; attribution remains contextual rather than audio-verified. Do not feed an entire speaker-ID bucket into a persona. Publication on October 2 does not make this recording newer than Sholto’s September pacing statements. Sholto was subsequently regenerated at the user’s request; both selected five-answer simulations were imported to production with the new source. The research record includes the confirmed local request-budget exhaustion and successful saved-operation retries.

## Nick Bostrom — October 3, 2026

Added the `superintelligence-philosopher` brief and `/users/nick-bostrom` presentation metadata. The [source review](nick-bostrom-persona-2026-10-03.md) distinguishes historical control arguments, conditional beneficial futures and the 2026 timing paper’s existing-person scope. The requested October 1 NYT interview is retained with an explicit transcript-access gap, not used for unverified beliefs. The expanded brief now has 18 source links; the [additional paper review](nick-bostrom-expanded-sources-2026-10-03.md) records reading scopes. A bounded local run generated four accepted answers and a selected result, verified at `/user-journeys` and `/users/nick-bostrom`. See the [run record](nick-bostrom-persona-2026-10-03.md#expanded-brief-and-live-run) for provenance and limits. The subsequent user-requested production import preserved the complete selected payload; the [production verification](nick-bostrom-persona-2026-10-03.md#production-publication) records its identity and live checks.

## Andrej Karpathy's deleted post and Anthropic role — October 3, 2026

Karpathy's September 12 X post backing Amodei's frontier-pacing essay was deleted, so the Reuters source quoting it was removed from `hands-on-agent-builder` and his October 2 post on understanding model outputs was added. The brief asserts neither continued support nor a retraction. At Travis's request, the brief and one-liner now also state that he joined Anthropic in May, with a voice line that he doesn't speak for the company. A bounded live run regenerated his journey: five answers, with the outlook unchanged at 75/100. It was imported to production with Travis's approval. The [research record](karpathy-deleted-post-2026-10-03.md) lists every citation, his newer posts, the before and after result, and the production verification.

## Cultural, civic and economic coverage — October 3, 2026

Added source-grounded simulations and real quotation sections for Cory Doctorow, Ha-Joon Chang, Ted Chiang, Paul Krugman, Naomi Klein, Jon Stewart and Elizabeth Warren. Each has at least five substantive inspected sources; Chang’s limited recent AI record and older/contextual material are explicitly documented. Their bounded selected local journeys and fidelity review are recorded in the [expansion audit](cultural-civic-persona-expansion-2026-10-03.md), with links to individual source audits. They remain in the general directory. Simon Willison, Joe Weisenthal, Mario Zechner and Jesse Genet are now featured using their existing selected runs. The [Ed Zitron answer audit](ed-zitron-answer-audit-2026-10-03.md) records the risk-endpoint repair and second-pass correction of an overly low transformation narrative, with a selected 35/100 result and 0–50 interpretation range. None of these changes manually prescribes map coordinates or interpretation ranges.

## Jesse Genet unfeatured — October 4, 2026

At Travis's request, Jesse Genet was removed from the featured set; her simulation and `/users/jessegenet` profile stay in the general directory. The production featured flag was synced with `personas:sync-metadata`, and the site social image was regenerated from the snapshot without her point. No interview was regenerated.

## Top tech posters — October 5, 2026

Added 34 source-grounded simulated users from the top 100 of the [Top 50 Tech Posters on X](https://tech50x.snytch.ai/) vote; 15 listed accounts were already simulated and 51 were researched and excluded, each with a recorded reason. Briefs average about 11.5 inspected sources from the accounts' own words. X browsing in the logged-in web app stopped partway when X rate-limited the account; the rest came from web search, X's public embed endpoint and, sparingly, the X API. One verified P(doom) statement was recorded (Emad Mostaque, ≈20%). Each batch generated as `--group=tech-posters-<letter>` for an estimated $3.47 in all; a fidelity review fixed two briefs and regenerated those users. The selected runs are local only; all are in the directory with `featured: false`. The [batch record](tech-posters-2026-10-05.md) links the nine research records and gives placements, coverage limits, verification and the import command.

## Drew Spartz (@AISpecies) — October 5, 2026

At Travis's request, added [Drew Spartz](ai-species-persona-2026-10-05.md) at `/users/aispecies`, who makes the Species YouTube channel about AI risk. The brief has 12 sources, nine of them his own video narration (transcripts only, with quoted clips, scenarios and other people's estimates excluded) and three X posts; he states no P(doom) of his own. One local run placed him concern-leaning (outlook 11.2) for an estimated $0.12. The run is local only, with `featured: false`.

## Sam Altman — October 6, 2026

Added the requested Vanity Fair Part 1 interview to Altman’s authored brief, then regenerated five answers and their results for an estimated $0.12. Added two verified direct quotes while retaining all five existing public statements. At the owner’s subsequent request, imported the selected run into Preview and production; both verified the local snapshot digest. The [source audit](altman-vanity-fair-2026-10-06.md) records attribution limits, fidelity review, run provenance and verification; [PR #66](https://github.com/transitive-bullshit/doom-or-bloom/pull/66) delivers the authored assets.

## Short-interview refresh — October 6, 2026

At Travis's request, freshly regenerated and imported all 96 production simulations with fewer than four answered questions, including all eight remaining `0.6.1` results. Each new run has four to six accepted answers and uses engine `0.7.5`; prior public runs remain intact. Rebuilt production and checked all 96 live profile answer counts and map coordinates. The [refresh audit](short-interview-refresh-2026-10-06.md) records the cohort, run provenance, $7.37 estimated cost, and before/after placements.

## Tech posters' public statements — October 6, 2026

At Travis's request, “What <Name> has said about AI” is now a default part of adding a person, when at least three quotes are especially relevant; [user-journeys.md](../user-journeys.md#public-statements) records the bar. Added the section for 29 of the 34 tech posters and Drew Spartz, with 3–5 verified quotes each, and skipped six whose statements were mostly company messaging, product talk or jokes. The [statements record](tech-posters-public-statements-2026-10-06.md) lists everyone, the sources, the skip reasons and the judgment calls. No simulations were regenerated and no production data changed.

## Staging catch-up and djcows regeneration — October 6, 2026

The Vercel Preview (staging) database had missed the October 5 import. It received the 34 tech posters and Drew Spartz, plus Nick Marwell, with verified digests, and a metadata sync corrected 26 display orders. Production and staging each hold 213 simulated users with no metadata differences. At Travis's request, djcows was regenerated for an estimated $0.08 because his published run asked the extinction question three times. The new run has five accepted answers and was imported to both databases. The [batch record](tech-posters-2026-10-05.md#publication) has the details.

## Scott Alexander — October 7, 2026

Added the requested Pinker letter while retaining all 13 previous sources, updated his latest self-reported extinction range to 25–30%, and regenerated four answers and their results locally for an estimated $0.10. Refreshed his required benchmark references for about $0.06 and synchronized the P(doom) hub and two charts. The [source and generation record](scott-alexander-pinker-letter-2026-10-07.md) records attribution limits, review, immutable run provenance and checks. Only Scott’s local selection changed; hosted publication remains separate.
