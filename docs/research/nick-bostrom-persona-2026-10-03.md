# Nick Bostrom source review — October 3, 2026

Primary-source review for the simulated-user brief. Accessed October 3, 2026. This note records source scope and authoring guidance; it does not prescribe assessment outcomes or reinterpret saved simulations.

## Optimal timing

[Optimal Timing for Superintelligence: Mundane Considerations for Existing People](https://nickbostrom.com/optimal.pdf) is a 2026 working paper, version 1.0, 45 pages. The author’s [homepage](https://nickbostrom.com/) independently lists that version.

The paper compares AI transition risk with mortality and suffering during delay. Its explicit scope is existing people’s interests under ordinary secular considerations; future-generation/impersonal evaluation and matters such as simulations and digital minds are deferred. The initial illustration assumes 40 remaining years without superintelligence and 1,400 after successful deployment. Its approximately 97% cutoff is a model-derived indifference threshold, not Bostrom’s catastrophe forecast or universal policy recommendation. Subsequent models vary safety progress, discounting, life quality and risk aversion. Many settings favor reaching capability relatively soon and then delaying deployment for safety work; some favor never deploying. Poorly designed pauses can be harmful. See printed pages 1–6, 9–11 and 17.

Authoring interpretation: retain the conditional structure and distinguish capability development from deployment. Do not convert an illustrative parameter, threshold or optimum into a personal P(doom), unconditional acceleration pledge, or complete ethical recommendation.

## October 1 interview

Requested canonical source: [Interesting Times interview with Spencer Klavan and Nick Bostrom](https://www.nytimes.com/2026/10/01/opinion/interesting-times-podcast-spencer-klavan-nick-bostrom.html), dated October 1, 2026 in its URL.

The [New York Times publisher listing on Apple Podcasts](https://podcasts.apple.com/us/podcast/interesting-times/id1438024613) verifies the episode’s existence, guest and guest host under the title “We Are Clueless About What’s Coming,” with approximately 51 minutes of audio. Publisher chapters cover catastrophe probabilities, the vulnerable-world hypothesis, beneficial superintelligence, utopia, values, effective altruism and humanity’s trajectory. These are topic metadata, not verified speaker positions.

**Pending substantive verification:** the canonical NYT page returned an internal retrieval error; targeted NYT searches reported robots restrictions. The Apple episode link also failed to load separately. Searches found third-party transcript excerpts and generated summaries, but these were not accepted as primary speaker evidence. No audio or full first-party transcript was reviewed. Keep the requested link and access limitation, but do not ground simulated opinions in this interview yet. In particular, publisher copy about retreating from earlier warnings is editorial framing, not an attributable Bostrom statement.

## Foundational and beneficial futures sources

- [Author homepage](https://nickbostrom.com/): discovery and bibliographic provenance. It identifies _Superintelligence: Paths, Dangers, Strategies_ as Oxford University Press, 2014, and links papers on risk, ethics, enhancement and governance. Its existence is not evidence that every listed work has been reviewed. The full book was not read during this update.
- [The Superintelligent Will](https://nickbostrom.com/superintelligentwill.pdf), 2012, _Minds and Machines_: the abstract and opening sections articulate orthogonality between intelligence and final goals, subject to caveats, and convergence on instrumental goals across diverse final aims. These support explaining why greater capability need not produce human-compatible motivation. They are philosophical arguments about possible agents and incentives, not empirical proof of inevitable catastrophe or claims that every deployed model is already an autonomous maximizer.
- [Deep Utopia official book page](https://nickbostrom.com/deep-utopia/), Ideapress, 2024: the description explicitly assumes superintelligence is developed safely and ethically and used well. It explores life when practical human labor is unnecessary and human nature can change, raising questions about meaning and experience. Use this as conditional exploration of desirable futures and remaining philosophical problems, not a confident forecast that such a future will occur. Scope reviewed: the author’s description, not the full book or reviewers’ endorsements.

Authoring interpretation: preserve both serious alignment concerns and exploration of extraordinary benefits. Treat a change in the question being investigated as distinct from a verified reversal of beliefs. Use analytical, qualified explanations without inventing an AGI date, a personal numerical risk estimate or policy commitments beyond inspected sources.

## Verification

Read `docs/AUTHORING.md` and the source-brief requirements in `docs/user-journeys.md`. Directly inspected the author homepage, official _Deep Utopia_ description, opening sections of the 2012 paper, and relevant sections of the 2026 timing paper. Verified interview metadata through the publisher’s distributed show listing; substantive interview review remains pending. This is a scoped source review, not full-book review or comprehensive validation of the papers’ mathematics and empirical assumptions.

Implementation: added `superintelligence-philosopher` to the catalog with slug `nick-bostrom`, a neutral one-liner, official author portrait and five source bookmarks. The three user-supplied URLs retain their origins in source intake; the homepage is discovery provenance and the NYT transcript remains blocked. No saved answers were generated or production data changed.

Validation: `pnpm resources:previews --concurrency=1` completed with local artwork for all sources (NYT and OUP use explicit title-card fallbacks). `pnpm test` passed formatting, lint, types, all 563 unit tests, content validation including 170 one-liners, and unused-code checks.

## Additional interviews

- [EconTalk, May 20, 2024](https://www.econtalk.org/purpose-pleasure-and-meaning-in-a-world-without-work-with-nicholas-bostrom/), recorded May 1. Inspected publisher transcript, especially 1:24–12:28. Bostrom distinguishes displacement, post-work life and the more radical solved-world experiment. He expresses guarded hope for education and culture suited to leisure, and expects rapid invention after superintelligence; neither establishes an AGI calendar date. Only guest turns ground the brief, excluding Roberts’s framing and reader comments.
- [EconTalk, December 1, 2014](https://www.econtalk.org/nick-bostrom-on-superintelligence/), recorded November 14. Inspected transcript sections on forms of superintelligence, rapid takeoff, goals and control (0:33–46:26). Supplies substantive first-person context for the book: physically bounded intelligence, possible strategic advantage, goal indifference and difficulty specifying values. Historical source, not a current numerical forecast.
- [Le Monde, May 24, 2026](https://www.lemonde.fr/en/economy/article/2026/05/24/swedish-transhumanist-nick-bostrom-fears-a-pendulum-swinging-too-far-against-ai_6753767_19.html). Accessible opening only; remaining article subscriber-limited. Quoted remarks support concern about neglected upside and mortality costs of inaction. No full-interview review claimed.

The [expanded paper review](nick-bostrom-expanded-sources-2026-10-03.md) records the additional papers and their individual read scopes. These additions supersede the initial five-bookmark count above; the NYT access limitation remains open.

## Expanded brief and live run

At the user’s explicit request, expanded the brief from five to **18 source links**: ten additional primary papers, two substantively inspected EconTalk interviews and accessible 2026 Le Monde interview excerpts. The NYT link is retained but does not ground substantive claims. The full books were not read. All source descriptions preserve the inspected scope, attribution, dates and conditional status; the research agent reviewed the integrated paper summaries and beliefs without finding material fidelity errors.

Generated only `superintelligence-philosopher` with `pnpm journeys:generate --persona=superintelligence-philosopher --turns=8 --max-requests=48 --max-cost=3`. Effective database host was verified as localhost, database `doom_bloom_dev`, before generation. No production import or deployment occurred.

- Run: `1790967398240-0237747a-d077-43b4-b903-008050f4a390`, October 3, 2026 local time (recorded UTC start `2026-10-02T18:56:38.336Z`).
- Models: participant `gpt-5.6-sol`; assessment `jev-1.13.0`; engine `0.7.4`, content `0.4.0-draft`.
- Four accepted answers, with 251, 169, 197 and 125 words. Prompts: root, overall impact, ultimate transformation and catastrophe chance. The engine stopped automatically with no consequential unanswered follow-up; it did not consume all eight allowed answers.
- Final evidence readiness: 66.9%. This measures interpretation coverage, not fidelity or correctness. The final result remains provisional.
- Estimated spend: **$0.123550282**, four OpenAI calls and 21 Jev calls; $3 cap, no outstanding reservation. This is the harness estimate, not a provider invoice.
- Local artifact: `work/journeys/users/superintelligence-philosopher/3677f3acf0d4dc202a2c940cb513a2a56befc58b88b78e91061f64d310a358f2.json`. The merged run manifest retains other users’ previous provenance. Successful generation selected the result in local Postgres.

Read all four saved answers against the brief. They retain control/race risks, benefits and mortality costs of delay, and distinguish possible magnitude from a calendar forecast. No NYT claims, numerical model-threshold probability, or invented quotation appears. The simulation does not cover every governance/digital-welfare theme in the larger source packet; automatic stopping is not comprehensive elicitation. Its numerical-risk refusal is generated behavior, not a verified quotation or proof that Bostrom has never stated a probability.

Observed map: expressed outlook about **51/100**, transformation about **100/100**. The UI shows **approximately 22% P(doom), inferred**, with a 14–36% plausible range. This is an assessment of fictional answers, **not Bostrom’s public probability**, and no public-statement override was added. These coordinates were observed after generation, never supplied as targets.

Verified the saved journey, stopping state and readiness in the browser at `/user-journeys`, and visually checked the selected result, portrait, four answers, inferred-probability disclosure and all 18 source links at `https://doom-or-bloom.localhost/users/nick-bostrom`.

Validation: source previews completed (777 URLs, none missing). Formatting, lint and types passed during `pnpm test`. Its only failure was the existing all-icons validation exceeding the default five-second timeout; all **563 tests across 100 files passed** with `pnpm test:unit --testTimeout=15000` (the icon check took 7.2 seconds). Content validation and unused-code checks passed separately. No test implementation or timeout default was changed.
