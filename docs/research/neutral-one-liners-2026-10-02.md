# Neutral one-liners for simulated users — October 2, 2026

Travis read the simulated users' one-line summaries back to back and found them too terse to carry nuance and biased toward doom: lines that pinned one number, scenario or project on a person, or stated an outcome in our own voice. He asked for summaries that are conservative, neutral and limited to what we can say with confidence, since they describe third parties we simulate, with an exact quote only where it sums up a person's view, like Eliezer Yudkowsky's book title. This record covers the rule, how all 169 lines were rewritten and the production step still to do.

The two examples he gave come from P(doom) outcomes rather than the one-liners: "Human extinction caused by AI" is the outcome of Andrew McAfee's ≈0% statement, and "AI takeover by 2040" is Ryan Greenblatt's 35–40%. Both appear on the profile's P(doom) card and, until `claude/seo-blog` dropped them, as per-person notes on the P(doom) page's chart. The one-liners had the same fault, so the rule now governs them.

## Rule

[The one-liner rule](../user-journeys.md#simulated-user-one-liners) is the current contract. In short: describe what the person is publicly known to argue or work on, in neutral, conservative terms they would accept as fair; claim only what their sources support across their public writing; quote only verified words that sum up their view; never state a P(doom) or a catastrophe outcome in our words; one sentence of 60–150 characters, starting with a plain role.

All 169 lines now live in `components/landing/one-liners.ts`. Before, the curated profiles' lines sat inline in `people.ts` and the Independent 100 reused their brief's `description`, which is also the simulated participant's backstage context; briefs keep that field unchanged, so no generation input moved. `pnpm test:content` checks length, punctuation and the absence of percentages, P(doom) and outcome words outside a verified quote. Against the old lines that check fails 65 of 169: 43 were topic labels under 60 characters, and 19 named an outcome or a P(doom).

## Method

Twelve drafting passes split the catalog by brief file. Each read the person's whole brief, including its `concern` cautions and dated source summaries, their research records and their public P(doom) entry, then drafted a line with a basis note and a confidence, and fetched a first-party page to confirm any role or quote. One editorial pass then harmonized length, shape and tone across all 169, dropped book titles that name a person without summing up their view (Garrison Lovely, Kevin Roose, Balaji Srinivasan) and checked the result against the rule. No model calls were paid for and no interview was regenerated; saved simulations, placements and P(doom) values are unchanged.

All 169 lines changed. The median length went from 72 to 145 characters, and every line now starts with a role or "Pseudonymous account" rather than a slogan in the site's voice.

## Verified quotes

| Simulated user | Quoted words | Source checked |
| --- | --- | --- |
| Eliezer Yudkowsky | If Anyone Builds It, Everyone Dies | [One Year Closer](https://www.lesswrong.com/posts/BFrRJYgpBvziuuJLs/if-anyone-builds-it-everyone-dies-one-year-closer), in his brief; also the publisher's page |
| Nate Soares | If Anyone Builds It, Everyone Dies | The same post, which names both authors |
| Liron Shapira | Doom Debates | [His show's Substack](https://lironshapira.substack.com/), its YouTube channel and his X bio |
| Julia Galef | The Scout Mindset | [juliagalef.com](https://juliagalef.com/) |
| Casey Newton | real and dangerous | [The phony comforts of AI skepticism](https://www.platformer.news/ai-skeptics-gary-marcus-curve-conference/) (2024-12-05): "why I believe AI is real and dangerous" |

## Largest changes

| Simulated user | Before | After |
| --- | --- | --- |
| Aella | Puts P(doom) at 75%, backs an international pause, and works to bring AI extinction risk to mainstream audiences. | Writer and survey researcher who supports an international pause on frontier AI and works to bring AI risk to mainstream audiences. |
| Oliver Habryka | Assigns much more than even odds that deploying superintelligence would kill everyone; wants AI slowed now via direct regulation and treaties. | Lightcone Infrastructure and LessWrong lead who argues for slowing AI capabilities now through direct regulation and, in time, international treaties. |
| Liron Shapira | Puts AI doom near a coin flip by 2050, stays bullish on AI’s near-term upside, and pushes for an international pause. | Host of “Doom Debates” who calls for an international treaty to pause frontier AI development while staying enthusiastic about the AI we already have. |
| Rob Bensinger | Argues that racing to superhuman AI with current methods likely kills everyone, and that a chip-enforced global halt is feasible. | MIRI writer who argues superhuman AI built with current methods would be too dangerous and calls for an international halt to the race to build it. |
| AI Notkilleveryoneism Memes | Relays AI warning signs in meme form, treats takeover as a near-term extinction threat, and cheers bans and coordinated slowdowns. | Pseudonymous account that posts memes, news roundups and expert quotes about AI risk and calls for superintelligence bans and coordinated slowdowns. |
| Nathan Labenz | Expects transformative AI soon, is excited by its medical upside, puts p(doom) at 10–90%, and wants defense in depth over racing China. | Host of The Cognitive Revolution podcast who is excited by AI’s upside, takes its risks seriously and favors cooperation with China over a race. |
| Garrison Lovely | The industry is racing to build labor-replacing machines; the default path leads to dystopia or doom unless the public freezes it. | Freelance journalist who argues AI companies are racing to replace human labor and calls for freezing frontier AI development. |
| Eliezer Yudkowsky | Superhuman AI could end humanity. Building it is the danger. | MIRI co-founder and co-author of “If Anyone Builds It, Everyone Dies,” who calls for an international halt to building superintelligence. |
| Scott Alexander | Transformative AI could bring postscarcity or catastrophe; alignment and coordinated slowing both matter. | Psychiatrist and Astral Codex Ten blogger who sees large benefits and serious risks in AI and supports alignment research and negotiated slowdowns. |
| Richard Hanania | Judges AI doom unlikely by base rates, sees current alarm as cultural panic, and expects AI to make society richer and smarter. | Political writer who reasons from base rates that AI’s benefits are large and much current alarm is overblown, while granting AI may pose real danger. |

## Least certain

These need the closest read. The review page lists every person's before, after and basis.

- **Quote exceptions:** Yudkowsky, Soares and Shapira carry outcome words only inside a verified title. Casey Newton's quote is from his 2024 essay; his 2026 sources hold the same view but were not searched for the phrase. Julia Galef's AI sources are from 2017–2021.
- **Recent or contested positions:** Roko Mijic's brief was rewritten on October 2 from September posts that reverse his February view. David Dalrymple's line includes his recent, contested view that models can learn a natural sense of the good. Richard Sutton's welcome of successor minds is softened to "a positive view of minds beyond human intelligence".
- **Left out under the rule:** Donald Trump's September dismissal of AI-takeover warnings as a hoax, and the critics' skepticism of extinction-risk arguments (Subbarao Kambhampati, Melanie Mitchell, Thomas Dietterich, Brian Merchant, Grady Booch and Martin Casado), which now shows only indirectly.
- **Framing:** Jensen Huang's brief deliberately selects his confrontational remarks, and "forecasts he calls unscientific" paraphrases "not grounded in science". Noah Smith's line names AI-enabled bioterrorism, his brief's central concern but a single risk.
- **Roles:** Elon Musk's names Tesla and SpaceX rather than xAI, whose status changed. David Sacks's "Presidential tech adviser" follows a C-SPAN title, while his X bio says PCAST co-chair. Max Tegmark calls himself FLI's founder; the line says cofounder. Gwern is described as a pseudonymous writer, which his brief doesn't state.
- **Thin sources:** Joe Weisenthal, Liang Wenfeng, Tenobrus and nightwing.

## Production

The profile header, social card and metadata read each profile's metadata from Postgres, so production keeps the old lines until they are synced. `pnpm personas:sync-metadata` updates only profile metadata from `people.ts` ([Sync profile metadata](../user-journeys.md#sync-profile-metadata)), without touching briefs or runs. It was tested on a disposable copy of the local database. Production still needs, after owner approval:

```sh
pnpm personas:sync-metadata plan --env .env.production.local --all
pnpm personas:sync-metadata write --env .env.production.local --all
```

Then deploy, so static profiles and social cards rebuild. Run the same `write` with `--env .env.development.local` to refresh the local database.

## Not changed

- Briefs' own `description` fields, which are generation input.
- The P(doom) card's outcome lines, which say what each stated number is a chance of. They are accurate but read like a summary when shown beside a near-zero number; a shorter label, or one that leads with "Chance of", would follow the same spirit.
- The `stance` field in `people.ts`, which only the internal people-first prototype renders.
