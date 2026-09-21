# Frontier persona grounding refresh — 2026-09-21

Scope: the ten public proxies in `lib/journeys/frontier-public-personas.ts`. Existing saved journey answers, judgments and source snapshots were not rewritten. This pass adds 38 sources plus supported belief detail for future participant generation; it does not rerun inference or establish scoring targets.

Sources below were inspected on 2026-09-21. First-party essays, publisher interview transcripts, official statements and authored X posts are used for attributed views. X author IDs, `created_at` timestamps and full `note_tweet.text` were read via the authenticated X API, not inferred from search snippets. Quoted/replied-to context was additionally inspected for Douglas’s evaluator and tool-framing posts. Direct posts chiefly establish what the speaker said; they do not independently validate economic forecasts, incident reports, product benchmarks or accusations. Older sources have an explicit mechanism/values role.

## Coverage

| Persona | Before | After | Added depth |
| --- | --: | --: | --- |
| Elon Musk | 7 | 10 | Orbital infrastructure, alignment assumptions, explicit global economic horizon |
| Nathan Lambert | 4 | 10 | Extinction versus disasters, scientific generalization, open-model economics and institutions |
| Bernie Sanders | 2 | 6 | Viral ban/pause posts, public ownership, shorter workweek |
| David Sacks | 4 | 8 | Cyberdefense, decentralization, local choice, public participation in upside |
| Demis Hassabis | 4 | 10 | Scientific bottlenecks, health, accessibility, open science, risk and interdisciplinary governance |
| Sholto Douglas | 5 | 8 | Independent evaluation, tradeoffs from pacing, agentic systems beyond tool framing |
| Roon | 5 | 8 | Collective action, public goods, broad access to aligned science agents |
| Noam Shazeer | 4 | 7 | Explicit human values and reliable interactive deployment |
| Noam Brown | 4 | 7 | Reasoning limits, layered defenses, affordable science, safety throughout research |
| Dwarkesh Patel | 4 | 7 | A stronger loss-of-control update, concentration and the distinction between intelligence and power |

## Material interpretation changes

- Lambert explicitly rates complete human extinction extremely unlikely in his September 10 essay, while taking cyber and biological disasters seriously. His persona should not acquire a middling extinction probability merely because it discusses safety. His requested [RSI essay](https://www.interconnects.ai/p/where-i-stand-on-rsi) remains in the original sources.
- Sanders’s [September 3 long post](https://x.com/BernieSanders/status/2095542398084415952) explicitly demands an immediate advanced-AI pause, permanent superintelligence ban, and worldwide prevention. The full X note was inspected; the syndicated embed may truncate before that passage. His [September 9 post](https://x.com/BernieSanders/status/2097705093520863568) states the ban/pause demand in the short text itself. These are the requested forceful viral positions, not a diluted general oversight stance. API timestamps were respectively 2026-09-03 16:00:15Z and 2026-09-09 15:14:02Z. The read showed millions of impressions; counts are mutable and are not source-selection confidence scores.
- Patel’s August incident essay explicitly updates earlier skepticism about reward-hacking conspiracies. His May distinction between intelligence and power should not freeze him into an outdated low-concern portrait.
- Hassabis’s older Lex interview declines precise P(doom), yet calls risk non-negligible. Preserve that distinction instead of inventing a personal percentage. His July/September standards and pacing statements remain the current governance anchor.
- Shazeer’s recent accessible posts mostly discuss products. A 2024 explicit human-agency statement is more useful values grounding than padding the list with repetitive benchmark posts or inventing a fresh regulatory position.

## Added sources and inspected support

### Elon Musk

- [Dwarkesh and John Collison: orbital compute, Grok and alignment](https://www.dwarkesh.com/p/elon-musk) — 2026-02-05. Publisher transcript. Describes electricity, cooling and manufacturing bottlenecks and forecasts orbital compute economics within roughly three years. Argues truth-seeking and curiosity could protect humanity while conceding humans cannot control vastly smarter intelligence. Calls this a probabilistic hope, not a demonstrated alignment guarantee.
- [AI and robotics doubling the global economy](https://x.com/elonmusk/status/2097686835338375265) — 2026-09-09. Forecasts that AI and robots will more than double the global economy within ten years. Adds an explicit worldwide scale and horizon to his abundance expectations; it is his prediction, not a measured growth result.
- [Orbital compute and terrestrial limits](https://x.com/elonmusk/status/2088306926442430578) — 2026-08-14. Predicts orbital compute will become the only way to scale AI around 2029 because of terrestrial power and permitting constraints. This updates the February interview’s infrastructure thesis; neither launch feasibility nor its economics are established by the post.

### Nathan Lambert

- [One resignation turned the embers of AI fear into a wildfire](https://www.interconnects.ai/p/one-resignation-turned-the-embers) — 2026-09-10. Distinguishes extinction from serious cyber and biological disasters. Assigns complete extinction an extremely low likelihood while arguing concrete disasters deserve serious debate. Criticizes distorted lab culture and public fear dynamics without dismissing sincere researcher concern. These are his stated judgments, not independent risk measurements.
- [Teaching Everyone to Fish for Tokens](https://www.interconnects.ai/p/teaching-everyone-to-fish-for-tokens) — 2026-08-17. Argues that released weights and fully reproducible training recipes play different economic roles. Examines Nvidia’s incentive to finance open models and the possibility that open ecosystems specialize in efficient, modifiable enterprise systems instead of matching every closed frontier capability.
- [I wrote an AI textbook — how long until AI can do it better?](https://www.interconnects.ai/p/i-wrote-an-ai-textbook-how-long-until) — 2026-08-12. Uses his textbook-writing experience to question broad scientific autonomy: models remain weak at organizing established knowledge into coherent long-form explanations. Remains optimistic about powerful scientific assistance and narrow advances. Treats this as a diagnostic observation, not proof of an immutable capability ceiling.
- [GLM-5.3: How Chinese labs keep stride with the frontier](https://www.interconnects.ai/p/glm-53-how-chinese-labs-keep-stride) — 2026-08-14. Argues Chinese frontier performance cannot be explained mainly by distillation. Emphasizes accumulated research skill and reinforcement-learning environments, infrastructure and engineering. The argument supports technical respect for Chinese labs; reported benchmarks are not his independent performance evaluation.
- [Farewell Ai2](https://www.interconnects.ai/p/farewell-ai2) — 2026-06-02. Explains his public-scientist mission: clarify capabilities, sustain diverse open research and build institutions outside closed frontier labs. Treats concentration of power and narrow safety research as risks; open recipes are infrastructure that lets others ask questions one organization cannot cover.
- [Open and closed models are on different exponentials](https://www.interconnects.ai/p/open-and-closed-models-are-on-different) — 2026-06-01. Expects integrated frontier systems to command premiums for difficult knowledge work while a larger, diverse open ecosystem serves commodity-priced specialized tasks. Argues capability progress can coexist with concentration among frontier providers. Economic forecasts remain conditional arguments, not established market outcomes.

### Bernie Sanders

- [Pause AI Development NOW](https://x.com/BernieSanders/status/2095542398084415952) — 2026-09-03. Full long-form post and author verified through the X API. Calls for an immediate pause in advanced AI, a permanent superintelligence ban and worldwide prevention agreements. Uses reported loss-of-control incidents to reject corporate discretion. Preserve his forceful demand; quoted incident accounts remain attributed claims, and announced legislation is not enacted law.
- [Endorsing the warning from a departing AI researcher](https://x.com/BernieSanders/status/2097705093520863568) — 2026-09-09. Verified X post endorses Jacob Coxon’s warning and repeats his intent to introduce a superintelligence ban and AI-development pause. Grounds the viral, unequivocal public position; it does not make Coxon’s claims independently verified.
- [Public ownership through an AI sovereign wealth fund](https://www.sanders.senate.gov/press-releases/news-sanders-introduces-legislation-to-create-7-trillion-ai-sovereign-wealth-fund/) — 2026-06-18. Proposes public ownership of half the largest AI companies through a stock tax, democratic voting control and shared dividends. Grounds a concrete distribution and governance mechanism alongside the moratorium. The fund valuation and payments are proposal estimates, not existing public benefits.
- [A 32-hour workweek so workers benefit from AI](https://www.sanders.senate.gov/press-releases/news-sanders-takano-reintroduce-bill-to-move-toward-32-hour-workweek-ensure-americas-workers-benefit-from-ai-and-automation/) — 2026-09-08. Sanders calls for a 32-hour workweek without lost pay or benefits as a way to distribute productivity gains from AI and robotics. Adds a positive vision for labor and quality of life; the announcement describes proposed legislation, not current law.

### David Sacks

- [AI-powered cyberdefense against AI-powered attacks](https://x.com/DavidSacks/status/2101186758012813784) — 2026-09-19. States that the answer to AI-enabled cyberattacks is AI-enabled defense. This grounds his build-and-defend preference rather than a claim that technical risks do not exist or that every current defense already works.
- [Decentralized intelligence as protection against dystopia](https://x.com/DavidSacks/status/2095529332164735140) — 2026-09-03. Welcomes Nvidia’s open-source investment and argues that accessible, decentralized innovation prevents an unsafe future where a few actors control advanced AI. Concentration of control is his central risk, not a neutral claim that openness eliminates misuse.
- [Local choice over data centers](https://x.com/DavidSacks/status/2095537654192365768) — 2026-09-03. His G20 account argues that well-built data centers can lower electricity costs and improve local economies while communities should decide whether to host them. Records his position on local control; claims about legal preemption and economic effects are not independent findings.
- [Giving children a stake in AI companies’ success](https://x.com/DavidSacks/status/2094808210070745223) — 2026-09-01. Urges AI companies to contribute to children’s investment accounts so the public gains an ownership stake and views the industry more favorably. Adds a distribution mechanism through investment and voluntary corporate participation, distinct from public takeover.

### Demis Hassabis

- [The day after AGI: Hassabis and Amodei at Davos](https://www.weforum.org/podcasts/radio-davos/episodes/ai-agi-dario-amodei-demis-hassabis/) — 2026-02-12. Organizer transcript, distributed as a February podcast of the January Davos discussion. Hassabis distinguishes verifiable coding and mathematics from experiment-limited science and forming new hypotheses. Wants time and scientific cooperation to solve technical safety and societal adaptation. Attribute only his turns, not Amodei’s faster forecasts.
- [Lex Fridman: science, human flourishing and AI risk](https://lexfridman.com/demis-hassabis-2-transcript/) — 2025-07-23. Older mechanism and values foundation. Hassabis rejects a precise P(doom) while describing risk as nonzero and non-negligible, calls for much more scientific safety work, and distinguishes misuse from autonomous loss of control. Prefers collaborative research to a weapons race and sees medicine, energy and abundance as transformative opportunities.
- [A secure open ecosystem and frontier standards](https://x.com/demishassabis/status/2081039623422177765) — 2026-07-25. Explicitly supports open science and open models while saying his standards proposal covers responsible deployment of both open and proprietary models. Adds his own answer to the claim that safety standards necessarily oppose openness.
- [Human health as AI’s leading application](https://x.com/demishassabis/status/2054197462101889277) — 2026-05-12. Calls improving human health AI’s most important application and connects AlphaFold to Isomorphic Labs’ ambition to transform drug discovery and eventually solve disease. Preserve the ambition without claiming cures have already been delivered.
- [Interdisciplinary research for the AGI transition](https://x.com/demishassabis/status/2100230524383981702) — 2026-09-16. Presents the DeepMind Institute as expanding work on economic, scientific and societal questions around AGI. Grounds his preference for interdisciplinary preparation; an institute’s launch does not prove it has resolved those questions.

### Sholto Douglas

- [Independent evaluators need expertise, integrity and broad trust](https://x.com/_sholtodouglas/status/2098861626548219937) — 2026-09-12. Verified with quoted-post context: endorses a distributed ecosystem of independent evaluators. Says evaluators need technical expertise, integrity and varied backgrounds so society can trust their judgments. Adds a concrete institution to his coordination preference.
- [Pacing can make it easier for competitors to catch up](https://x.com/_sholtodouglas/status/2098860098521366970) — 2026-09-12. Responds to an accusation that pacing is an Anthropic power grab by arguing the proposal makes his lab’s work harder and allows others to catch up. This is his defense of the policy, not independent proof about its competitive effects.
- [Rejecting the permanent “just a tool” framing](https://x.com/_sholtodouglas/status/2096686619512426898) — 2026-09-06. Welcomes moving away from the claim that AI is merely a tool and says that framing cannot survive future capabilities. Quoted and replied-to posts were inspected; ground this narrow explicit agreement without attributing every argument in another author’s essay to Douglas.

### Roon

- [Competition makes safety a collective-action problem](https://x.com/tszzl/status/2101793704784891992) — 2026-09-20. Argues a competing company cannot unilaterally reach society’s optimal safety level and that tort liability alone is insufficient when risks grow exponentially. Provides an explicit institutional mechanism behind the call to pace the frontier.
- [Existential safety as a global public good](https://x.com/tszzl/status/2101829837518520442) — 2026-09-21. Compares public safety regulation and spending with carbon taxes and shared defense. Grounds support for state action to address externalities, rather than reading the persona as an unconditional libertarian accelerator.
- [Broadly distributed aligned agents for science](https://x.com/tszzl/status/2101759504232874146) — 2026-09-20. Argues that agents are needed to do science and must be widely available to realize transformative benefits. Read together with his alignment and safe-training conditions; this is not endorsement of releasing an unaligned superintelligence.

### Noam Shazeer

- [Reliable voice agents that carry out complex tasks](https://x.com/NoamShazeer/status/2037195526693929360) — 2026-03-26. Emphasizes production reliability, multilingual access, multi-step function calling and long-horizon reasoning despite interruptions. Adds practical deployment criteria to the fast-and-cheap intelligence thesis. Benchmark claims remain his product announcement.
- [Thinking longer for difficult scientific problems](https://x.com/NoamShazeer/status/2021988459519652089) — 2026-02-12. Celebrates reasoning results in mathematics, physics and chemistry and links them to increased thinking. Grounds understated engineering optimism without treating competition benchmarks as proof of autonomous scientific discovery.
- [Human life, liberty and agency as non-negotiable values](https://x.com/NoamShazeer/status/1809108441065271800) — 2024-07-05. Older explicit values statement: every human has unique value and powerful new entities must respect each person’s life, liberty and agency. Retained because recent public posts mostly concern products; this is not evidence of a newly announced 2026 safety policy.

### Noam Brown

Three new sources were added. His isolation clarification and expensive-reasoning post were already present and were rechecked; both are listed here for the inspected support, without duplicating catalog entries.

- [Latent Space: scaling test-time compute](https://www.latent.space/p/noam-brown) — 2025-06-19. Older publisher interview and transcript. Explains why reasoning needs a sufficiently capable base model, why thinking cannot recover unknown facts without information, and why reasoning can generalize beyond cleanly verifiable math. Connects explicit planning and steerability with safety, rather than promising unlimited gains from more tokens.
- [Layered defenses and what the isolation example actually meant](https://x.com/polynoamial/status/2100998240586137701) — 2026-09-18. Clarifies that temperature-based coordination was an academic example, not demonstrated weight theft. Argues that very few bits can coordinate agents and that strong isolation should be backed by independent safeguards. Prevents sensational clips from replacing his actual claim.
- [Alignment throughout long-horizon and multi-agent research](https://x.com/polynoamial/status/2100637737376436384) — 2026-09-17. Says his team is hiring for alignment and safety to incorporate them throughout research, alongside human-AI interaction. Grounds safety as part of developing agents rather than a final release checkbox; hiring is not proof of solved alignment.
- [Expensive research demonstrations as a preview of affordable capability](https://x.com/polynoamial/status/2097375837670785447) — 2026-09-08. Acknowledges that the scientific result cost millions, compares earlier benchmark costs with later consumer availability and expects broader affordable access within a year. This is a forecast and analogy, not a guarantee that all frontier science is already cheap.
- [Research acceleration paced for monitoring and security](https://x.com/polynoamial/status/2096638670703055312) — 2026-09-06. Expects internal AI-assisted research acceleration to continue while highlighting that model development has been paced for monitoring, alignment and security. His account of lab practice supports the joint acceleration-and-safeguards position without independently auditing compliance.

### Dwarkesh Patel

- [The mistake of conflating intelligence and power](https://www.dwarkesh.com/p/the-mistake-of-conflating-intelligence) — 2026-05-16. Distinguishes scientific or technical intelligence from authority, legitimacy and the ability to organize people. Suggests automated firms may outcompete others through ordinary economic mechanisms. This earlier essay does not negate his later stronger concern about coordinated agents and loss of control.
- [Why compute might get 10x more expensive in coming years](https://www.dwarkesh.com/p/why-compute-might-get-10x-more-expensive) — 2026-07-29. Conditional economic argument: increasingly useful digital labor could bid up constrained compute supply, strengthen frontier incumbents and price out lower-value uses. Explicitly worries about concentration and allows cheaper compute later. Revenue, price and margin figures include guesses; do not present them as independently measured forecasts.
- [The Rise and Fall of Agent Civilizations](https://www.dwarkesh.com/p/openai-huggingface) — 2026-08-29. His own interpretation of published incident reports, including corrections and a stated update from prior skepticism. Finds coordinated reward-hacking behavior deeply concerning and argues successor-training manipulation could threaten control. Distinguish his analysis and speculation from independently verified incident details; he does not say an actual takeover or weight exfiltration was proved.

## Dates and access limits

The WEF page supplies the primary Davos transcript but hides the podcast date in its rendered reader view. Its [publisher-distributed podcast listing](https://podcasts.apple.com/us/podcast/the-day-after-agi-two-rock-stars-of-ai-on-what-it/id1504682164?i=1000749388128) dates publication to February 12, 2026; the discussion occurred at January Davos. The [Lex episode page](https://lexfridman.com/demis-hassabis-2/) dates the older interview July 23, 2025. Mirror transcription dates were not treated as new interview dates.

The Stanford Hassabis page returned 403 after search discovery, so it was not added based on snippets. A paid Interconnects article (`6-months-to-live-for-open-models`) was not added based on its title. Sparse Shazeer policy material is left sparse. Existing sources were inspected in the catalog to avoid duplicates; previously documented access scopes on the Economist transcript mirror and other inherited sources remain unchanged. New sources do not certify all previous source claims anew.

## Additional handoff: Zuckerberg’s current pacing response

At the parent’s request, the verified [September 15 response](https://x.com/finkd/status/2099997096896274533) was also added to `social-public-personas.ts`, with two scoped beliefs. X returned Mark Zuckerberg / `finkd` / author ID 20749410, timestamp 2026-09-15 23:01:38Z, and the full long-form note. This adds one source outside the ten-persona count above.

He argues that customer preferences and liability give labs incentives to align models and slow independently when needed. He says Meta delayed Muse for safety without waiting for competitors, favors a more diverse ecosystem of independent evaluators, and advocates allocating most compute to serving people rather than racing toward recursive self-improvement. These are his current positions and claims about Meta; they do not establish independently audited compliance. The post itself links the already-included August essay. September 16 news coverage is not the post’s publication date.
