# Public-persona expansion — September 21, 2026

The catalog now has 20 public proxies, 10 fictional participants and one separate fixed real-user replay, including the subsequent Musk and Lambert additions below. Dario Amodei already existed and was refreshed rather than duplicated. The landing map uses the actual regenerated results for its featured people; no desired scores or coordinates are given to either the participant or Jev.

## Sources and attribution

The executable briefs in [additional-public-personas.ts](../../lib/journeys/additional-public-personas.ts) and [frontier-public-personas.ts](../../lib/journeys/frontier-public-personas.ts) contain dated links, compact source summaries, brief quotations and narrative synthesis. These are the source packets actually sent to the participant model. The [existing public personas](../../lib/journeys/public-personas.ts) retain Dario’s longer essay collection.

| Persona | Current grounding | Interpretation to preserve |
| --- | --- | --- |
| Gary Marcus | September regulation and agent-risk essays; June economics; November 2025 capability critique | Criticism of LLM reliability does not deny current harm or all future AI potential. |
| Andrew Ng | September 18 letter on responsibility; February labor-market letter | Practical enthusiasm, engineering safety and worker transitions; no invented AGI date. |
| Yann LeCun | May interview and July 2030 discussion; explicitly older 2024 conceptual interview | Skepticism about a technical route differs from pessimism about eventual potential. |
| Geoffrey Hinton | September CNN interview and July NCSL event report | Serious control and employment fears coexist with large medical and educational benefits. |
| Ed Zitron | August manifesto; September corporate-risk and concentration essays | Industry hostility and economic concerns do not imply belief in imminent superintelligence. |
| Bernie Sanders | March and September official proposals and his own accompanying remarks | Democratic control and worker protection alongside an explicit superintelligence ban. Proposed policy is not current law. |
| David Sacks | September 12–19 first-person posts | Opposes gatekeeping and compulsory coordination while demanding labs take responsibility for safety. |
| Demis Hassabis | July essay, September endorsement and public posts | Huge scientific ambition, coordination and a standards framework; current endorsement does not settle every policy detail. |
| Sholto Douglas | August economic/monitoring posts and September pacing endorsement; May 2025 technical interview | Coordinated progress as fast as safety permits, not unconditional acceleration or a permanent pause. |
| Roon | September 14–21 first-person posts and current profile | Frontier pacing and urgent alignment coexist with broad access and releasing current models. Jokes are not empirical evidence. |
| Noam Shazeer | March–June 2026 engineering posts; February 2025 interview | Recent material is chiefly about products. Broader forecast and control arguments use his own older interview turns; no new regulatory position is fabricated. |
| Noam Brown | September 17 interview plus September 3–18 posts and clarifications | Rapid progress, concrete bottlenecks and defense in depth. Hypothetical side channels are not observed exfiltration. |
| Dwarkesh Patel | June–September authored essays, experiments and his own interview introduction | His own views and updates, never an aggregate of his guests’ positions. |
| Dario Amodei | Existing essays through September 12 pacing proposal | Preserve exceptional ambition and the conditional nature of benefits; update the concrete evaluator and coordination commitments. |

First-person X posts and profile images were retrieved through the live X API. Full text was read where available; quoted-post context was checked where it mattered. Profile-photo provenance is in the prototype’s [portrait sources](../../public/personas/SOURCES.md).

Some source boundaries matter:

- Ng’s site was readable by direct public HTTP retrieval when the web reader failed.
- Marcus’s September 18 post relies heavily on embedded images. Its brief uses the explicit headline distinction only.
- LeCun’s Nebius interview is hosted by a supplier to his lab; it remains a firsthand interview, not an independent evaluation of its claims.
- Hinton’s NCSL source is the event organizer’s report of his session.
- Shazeer’s joint interview is speaker-attributed. Jeff Dean’s claims are not silently assigned to him. Douglas’s joint interview likewise does not transfer Bricken’s remarks to Douglas.
- Roon remains represented under the public pseudonym. No attempt was made to resolve a private identity.
- Published forecasts, product claims and political accusations remain attributed positions, not independently verified outcomes.

All new public proxies use the detailed response style. Detailed does not mean supplying ideal reasoning, invented numerical probabilities, or an artificial concession in every answer. Existing intentionally brief and weakly reasoned fictional cases remain separate stress tests.

## Review after generation

Inspect the actual wording, selected questions, per-answer results, interpretation ranges and stopping decisions. A surprising placement is a diagnostic observation; do not change persona inputs merely to force a preferred position. Compare each answer against its source packet before deciding whether an issue lies in the simulated participant, elicitation or measurement.

## Completed live replay

The following records the first expansion checkpoint, before Musk was added.

Suite `1789991485748-3e77a23e-5403-4ecc-9444-50503ef0028b` completed all 29 journeys with 90 accepted answers, no journey errors, a final placement for every journey and a result snapshot after every accepted answer. GPT-5.6 Sol generated the participant answers; the real engine made 443 live Jev requests. Input, engine and content hashes match the current source. Only the latest live suite remains in the local store.

Public-proxy openings contain 180–282 words. The two intentionally brief personas remain at 11–17 words per answer. The map displays the saved outlook and transformation coordinates; separated portrait labels have connector lines back to their measured positions. Desktop and mobile checks confirmed all 17 portraits load, result navigation works and the page has no horizontal overflow.

The automated review flags small readiness and map changes for LeCun answer 4, Zitron answer 3 and Dwarkesh answer 4, plus the existing high-risk accelerator answer 2, dogmatic utopian answer 2 and real-user replay answer 3. These are follow-up inspection candidates, not evidence that the answers added no information: the check measures outlook and reasoning movement, not every worldview facet. The general crux question appeared in 21 of 29 journeys, another useful routing-review target. Full observations are regenerated with `pnpm journeys:review` in `eval/runs/elicitation-review.json`.

Validation: 207 unit tests passed, the mechanical journey baseline matched, and TypeScript, lint and formatting checks passed. The expanded store was exercised with a 29-person round trip; the full live trace is approximately 65 MB, above the old 64 MB limit and within the new bounded 128 MB limit.

## Subsequent addition: Elon Musk

The `abundance-risk-taker` brief adds Musk as a detailed participant and the eighteenth featured map portrait. Its seven dated source records are in `frontier-public-personas.ts`.

Recent public posts were retrieved directly through the X API with quoted and reply context: September 12 endorsing Amodei; September 19 discussing the pressures on safety coordination; September 18 forecasting near-term growth; September 14 acknowledging a current software limitation; and April 17 proposing income payments. The latest statements govern the policy stance. Endorsement does not establish implementation of another lab’s commitments.

The Davos organizer’s January transcript supplies broader motivation and practical constraints. For the July Economist interview, the primary video reader returned no transcript and the publisher article was inaccessible. AI sections were read in the linked timestamped CEOInterviews transcript mirror; its speaker labeling is imperfect, so interviewer-supplied probability ranges are not treated as a new precise forecast by Musk. No authentic quote from that mirror is placed in the brief. Source summaries document this access boundary.

The persona keeps strong optimism alongside risk and control concerns, without selecting a desired map coordinate or catastrophe probability. Its portrait was retrieved from the current public X profile on September 21.

## Subsequent addition: Nathan Lambert

The `open-science-realist` persona uses four directly read Interconnects essays: the user-requested [September 19 RSI post](https://www.interconnects.ai/p/where-i-stand-on-rsi), [September 9 adoption essay](https://www.interconnects.ai/p/when-will-average-people-feel-ais), [August 9 safety analysis](https://www.interconnects.ai/p/lessons-from-the-hacks) and [September 21 open-model briefing](https://www.interconnects.ai/p/the-current-balance-of-power-in-open). The safety essay’s substantive body was publicly readable; nothing beyond its displayed subscription boundary was inferred.

The brief separates enthusiasm for economic diffusion from skepticism about runaway improvement. It retains concrete safety concerns, support for independent research and the risks of concentrated benefits. Numerical forecasts attributed to interview guests or quoted authors are not assigned to Lambert. His current public X photo supplies the nineteenth map portrait.

Lambert was requested while the 30-journey replay was running. His separate live journey is combined with that replay, preserving original source-run hashes for each included persona. The latest collection contains 31 journeys, with no retained old-run selector.

The final collection is `1789993101553-9d987be3-8811-422b-9dc3-6f41e89802de`: 31 journeys, 102 accepted answers, no journey errors, and a placement and per-answer snapshots for every usable answer. Musk completed three answers; Lambert’s detailed opening triggered an immediate automatic result. That early stop remains a routing-review observation, not a reason to force extra questions or adjust his placement. The assembled hashes match the current catalog; original hashes remain in `sourceRuns`. Only one live collection is retained.
