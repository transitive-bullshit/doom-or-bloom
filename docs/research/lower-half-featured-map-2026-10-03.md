# Lower-half featured-map proposal — 2026-10-03

Status: editorial proposal and local visual preview. No featured metadata, selected simulations, production data, scoring rules, or persona source briefs changed. No paid inference ran.

## Finding

The current [homepage](https://www.doom-or-bloom.com/) has 44 plotted featured personas, with only Nathan Lambert below transformation 0.5 (44.5/100). The current [directory](https://www.doom-or-bloom.com/users) has 171 plotted personas, with 34 below 0.5. Featured lower-half representation is therefore 2.3%, versus 19.9% in the catalog. These are counts of saved simulated positions, not a survey of people's actual beliefs.

Verified on October 3 through live homepage/directory DOM coordinate anchors (`.study-dot`), matching selected public simulation records in native local PostgreSQL. Counts use underlying coordinates rather than portrait centers, which collision separation can displace across the line. Read-only database connection used `default_transaction_read_only=on` and a 15-second statement timeout. Rounded directory DOM coordinates treat Florian Brand as exactly 50/100; floating-point values just below 0.5 do not count as meaningful lower-half coverage.

The axis measures eventual societal change, including economic and institutional effects, independently of desirability, speed, and technical capability. Slow diffusion and rejection of current LLM-based AGI do not necessarily imply low societal transformation. See [the assessment contract](../ASSESSMENT.md#participant-facing-projections) and [the source-defined transformation levels](../../lib/assessment/worldview-experiment.ts). This matters for Ed Zitron and the normal-technology writers.

## Existing-persona shortlist

All coordinates below are selected simulation outputs, in 0–100 units. They are not personal probability statements, personal self-placements, or percentage confidence in these beliefs.

| Persona | Outlook | Transformation | Saved scale interpretation and range | Editorial reason |
| --- | --: | --: | --- | --- |
| [Simon Willison](https://www.doom-or-bloom.com/users/simonw) | 74.7 | 29.4 | Supported; 15–60 | Strongest recognizable practical AI builder: useful tools, engineering judgment, concrete agent-security constraints. Adds constructive lower-right coverage. |
| [Mario Zechner](https://www.doom-or-bloom.com/users/badlogicgames) | 47.7 | 21.9 | Supported; 0–36 | Pi coding-agent builder. Clear bounded-tool account and continued human architectural responsibility; useful lower-center coverage. Recognition is strongest in developer circles. |
| [Joe Weisenthal](https://www.doom-or-bloom.com/users/thestalwart) | 62.1 | 46.3 | Supported; 14–61 | Bloomberg Odd Lots economics perspective: prices, access, market power, inspections, real-world usefulness. Near-midline rather than a strong claim of merely incremental change. |
| [Jesse Genet](https://www.doom-or-bloom.com/users/jessegenet) | 74.7 | 25.3 | Supported; 21–29 | Family administration, education, affordability and local-model control. Adds lived everyday-use experience and a woman to the featured map. Narrower name recognition; optional fourth addition. |

Recommendation: prioritize Simon and Joe for recognition; add Mario for a distinctive lower-center position and Jesse for family/everyday-use coverage. These are known within relevant communities, rather than household-name public figures. This improves map coverage without resolving the broader recruitment bias by itself.

The checked-in follower snapshot, captured September 25, provides one dated visibility signal: Simon 225,874; Joe 449,645; Mario 73,551; Jesse 62,150. Follower counts are neither expertise nor demographic representativeness; these are not live counts. Source: [x-followers.json](../../lib/personas/x-followers.json).

These four selected runs were generated September 28 under assessment 0.7.1 and have two accepted answers each. None was asked `transformation.ultimate`. The [current interview contract](../ASSESSMENT.md) documents that omitting the eventual-scale question produced low-biased scale estimates in persona validation. Review adequate source evidence and regenerate these four through the current bounded interview before making a durable publication decision; let the coordinates fall wherever their sourced answers lead. Do not instruct the generator to occupy a desired region.

Useful source material already in the briefs includes [Willison's year in LLMs](https://simonwillison.net/2025/Dec/31/the-year-in-llms/), [Zechner's scoped-agent argument](https://mariozechner.at/posts/2026-03-25-thoughts-on-slowing-the-fuck-down/), Weisenthal's own posts alongside carefully attributed hosted discussions, and [Genet's full Cognitive Revolution appearance](https://www.cognitiverevolution.ai/try-this-at-home-jesse-genet-on-openclaw-agents-for-homeschool-how-to-live-your-best-ai-life/). These support practical-use views; do not treat short-term product observations as definitive eventual societal forecasts.

Kylie Robison is an alternate for journalism and gender coverage, currently 39.0/100 transformation and 49.5/100 outlook. Hold off on promoting her specifically as an incremental-change representative: the saved scale is tentative, its range is 0–94, and her run uses assessment 0.6.1. Stella Biderman is also below the line (43.5) but tentative, so not a strong remedy for the requested gap.

Recognizable candidates who **do not currently fill this gap** include DHH (57.0), Ethan Mollick (57.3), Brian Merchant (60.0), Grady Booch (63.5), Melanie Mitchell (65.5), and Sayash Kapoor (74.7). Arvind Narayanan is already featured at 72.7. Source: selected public simulation results; corresponding [directory profiles](https://www.doom-or-bloom.com/users). Being a skeptic or normal-technology advocate is insufficient to assume a lower saved position.

## Ed Zitron

The currently selected run is dated October 2, 05:55 UTC and uses assessment 0.7.3. Its transformation is **51.5/100**, with a supported interpretation and a **25–75** range. It has four answers and includes the eventual-scale question.

His **generated** answer to that question separates limited technological transformation from potentially large economic effects, then selects “a lot” overall on the basis of resources and businesses being reorganized around AI. The projection therefore has some basis in its input. The answer and score are not new statements by the real Zitron.

The source brief and [Zitron's August 25 manifesto](https://www.wheresyoured.at/the-ai-haters-manifesto/) retain a bounded-tool account. The relevant editorial question is whether the simulation turns conditional economic damage into an adopted expectation too strongly, and whether readers understand that the y-axis includes socioeconomic effects of the AI industry. Rejecting AGI and expecting potentially large financial/institutional harm can coexist. Avoid concluding either that Zitron changed his beliefs or that a low placement is mandatory merely because he rejects AGI.

Ignored historical local artifacts show transformation outputs of 24.0, 9.75, 51.5 (selected), and 61.75 (an unselected 0.7.4 run). The two recent low/high answers differ in whether the forced categorical conclusion chooses limited technological change or large economic impact. This illustrates answer-generation and interpretation sensitivity; it does not establish a public-person belief trajectory. These artifact filenames and data are local diagnostic provenance rather than publication candidates.

## Preview and verification

The local preview adds the four shortlisted profiles to the current 44, yielding **5/48 (10.4%) below the line**. Existing coordinates, including Ed's, are preserved. Outlined portraits and persistent labels identify the additions; added-label styling is annotation for review, not a proposed production interaction change.

The standalone preview reuses `components/landing/prism.css`, `components/worldview/prism-theme.css`, existing local portrait assets, and the actual `separatePortraits` layout function from `lib/landing/portrait-layout.ts`. It is a browser-rendered proposal using real saved coordinates, not an image-generator reconstruction or a deployed application change. Live homepage anchors were independently checked against selected local outputs; standalone coordinates retain full precision.

Artifacts:

- [Screenshot](/Users/tfischer/.codex/visualizations/2026/10/03/01a10074-40fd-7582-9948-06d11863212d/lower-half-featured-preview.jpg)
- [Standalone clickable preview](/Users/tfischer/.codex/visualizations/2026/10/03/01a10074-40fd-7582-9948-06d11863212d/lower-half-featured-preview.html)
- [Coordinate data](/Users/tfischer/.codex/visualizations/2026/10/03/01a10074-40fd-7582-9948-06d11863212d/lower-half-featured-coordinates.json)

Browser verification: all 48 portraits rendered, labels legible after moving Simon's annotation beside his portrait, expected four additions present, lower-half counts correct, and full-page screenshot saved. No application code changed, so no application regression suite ran.

For potential new simulations beyond the tech-heavy existing catalog, see [the companion candidate research](lower-half-new-persona-candidates-2026-10-03.md). Its likely map-region assessments are research hypotheses, not generated scores.
