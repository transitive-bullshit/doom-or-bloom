# Civic and cultural persona source audit

Inspected 2026-10-03. Implemented narrative briefs in `lib/journeys/civic-cultural-personas.ts` and exact public statements in the three corresponding `content/profiles/` files. This note records source selection and attribution; it does not prescribe coordinates. Generated answers remain fictional.

| Person | Substantive inspected sources | Recent coverage | Public statements |
| --- | --: | --- | --: |
| Naomi Klein | 6 | May 2025–September 2026 | 3 |
| Jon Stewart | 5 | October 2025–July 2026 | 4 |
| Elizabeth Warren | 8 | April 2025–September 2026 | 5 |

Counts are distinct relevant works, not search results, mirrors or repeat clips. Warren’s reproduced TIME op-ed counts once. Klein’s Substack republication of the Globe and Mail excerpt counts once. Stewart’s publisher video and caption track count together. No inaccessible source counts toward the minimum.

## Naomi Klein

The brief prioritizes identifiable author/speaker material and the May–September 2026 public record. The packet connects political economy, labor, environmental consequences and epistemic integrity. It does not establish a universal capability ceiling or a personal AGI timeline.

- [September 14, 2026, Fossil Tech](https://naomiklein.substack.com/p/big-tech-and-big-oil-have-fused-call): full coauthored excerpt inspected; first published September 12. Climate and infrastructure analysis. Coauthorship is explicit in the brief and quote venue.
- [September 15, 2026, Democracy Now](https://www.democracynow.org/2026/9/15/klein_taylor_end_times_fascism): reviewed named Klein turns; excludes Astra Taylor’s arguments.
- [July 8, 2026, Welcome to Patterns](https://naomiklein.substack.com/p/welcome-to-my-substack): full authored essay inspected. Human sense-making and fabricated digital identity.
- [July 31, 2026, Democracy Now correction](https://www.democracynow.org/2026/7/31/naomi_klein_ai_quote): speaker-labeled correction inspected.
- [May 9, 2025, Capital & Main interview](https://capitalandmain.com/we-are-in-a-moment-of-unparalleled-peril-an-interview-with-naomi-klein): full named interview inspected. Political coalition and labor analysis.
- [May 5, 2025, Democracy Now](https://www.democracynow.org/2025/5/5/naomi_klein_trump_silicon_valley): named turns inspected.

The viral quotation and image that Klein explicitly disowned are excluded, even though she agrees with their sentiment. Industry promises quoted in the climate essay remain claims she contests. Moral concern about large consequences cannot responsibly be converted into a desired low-transformation placement. No numerical catastrophe probability was verified.

Exact quote verification: Fossil Tech paragraph beginning “Forget the shiny clean image”; Patterns paragraph beginning “I have stumbled across it”; Capital & Main passage after its coalition question. The public statements file contains the only retained quotations, keeping each source below 25 verbatim words across artifacts.

## Jon Stewart

Five substantive primary videos were inspected through original **publisher en-US subtitle tracks**, fetched with `yt-dlp --skip-download --write-subs --sub-langs en-US --sub-format json3`. These are publisher transcripts with named speaker cues, not third-party summary pages. Review ranges below use the official video timebase. They include adjacent turns to distinguish a host question, a guest assertion and Stewart’s own position. Intros with unambiguous self-identification were also checked.

| Official source | Upload date | Reviewed ranges |
| --- | --- | --- |
| [Cory Doctorow / Enshittification](https://www.youtube.com/watch?v=-dAIJRjb-Bw) | 2026-07-29 | 00:00–05:30; 17:30–21:40; 32:30–41:40; 53:20–58:10; 60:50–73:20 |
| [Josh Tyrangiel / AI for Good](https://www.youtube.com/watch?v=kolVzstukgs) | 2026-05-12 | Full interview, 00:00–17:50 |
| [David Autor and Daron Acemoglu / Future of Work](https://www.youtube.com/watch?v=RB_WmoH5nQ4) | 2026-04-22 | 00:00–04:20; 07:10–10:40; 15:20–19:10; 30:40–35:00; 42:00–45:20; 51:10–55:50; 58:20–60:50 |
| [Sarah Shoker and Paul Scharre / Military AI](https://www.youtube.com/watch?v=NAWjXmsNiPU) | 2026-03-11 | 00:40–05:50; 23:20–29:00; 31:40–36:40; 41:50–51:40; 55:50–65:40; 68:10–75:10 |
| [Geoffrey Hinton / What Could Go Wrong](https://www.youtube.com/watch?v=jrK3PsD3APk) | 2025-10-09 | 00:40–05:50; 31:40–36:40; 45:40–51:40; 55:50–66:30; 69:40–76:40; 79:20–84:50 |

Upload dates come from the publisher video metadata and differ by one day from some search-index dates. Recording dates are not substituted for publication dates. English auto-captions of the Hinton episode initially proved to be a translation from another track; that version was rejected and replaced with the original English publisher track. A rate-limited military auto-caption request was likewise replaced by the accessible publisher track. Temporary fetched transcripts remain in `/tmp/`; they are not copied wholesale into the repository.

Stewart’s guest-directed questions establish curiosity, not automatic agreement. The brief preserves his own recognition of useful tools, labor and public-ownership concerns, discomfort with military use, and dated July shift. It never assigns him Acemoglu’s limits, Autor’s projected economics, Hinton’s probability or Doctorow’s full argument. The earlier search-engine joke describes experience at that time. His comic apocalyptic introductions are not calibrated forecasts.

Public quote checks on publisher captions: Doctorow introduction at 02:41–02:48; Tyrangiel at 03:18–03:24; Future of Work at 44:32–44:38, with preceding Stewart turn and following Autor turn; Hinton at 62:11–62:18, with explicit Stewart cue and next Hinton cue. Exact excerpts are retained only in `content/profiles/jon-stewart.json`.

## Elizabeth Warren

The eight official sources cover safety, financial stability, distribution, energy, military safeguards and competition. Joint letters are identified as such. Proposed laws are not treated as enacted; allegations remain concerns. The newest personal pause statement governs the brief’s current policy position.

- [September 16, 2026, advanced-development pause statement](https://www.warren.senate.gov/newsroom/press-releases/senator-warren-calls-for-pause-in-advanced-ai-development/): full statement inspected.
- [May 27, 2026, tax AI and invest in people](https://www.warren.senate.gov/newsroom/press-releases/warren-for-time-tax-ai-and-invest-in-people/): full reproduced authored op-ed inspected.
- [April 22, 2026, Vanderbilt prepared remarks](https://www.banking.senate.gov/newsroom/minority/warren-remarks-at-vanderbilt-policy-accelerator-event-highlighting-economic-and-financial-risks-of-potential-ai-crash): full prepared text inspected; delivery is not asserted to match every word.
- [March 26, 2026, mandatory energy reporting](https://www.warren.senate.gov/newsroom/press-releases/warren-hawley-lead-bipartisan-push-for-mandatory-energy-use-reporting-requirements-for-data-centers/): substantive release and joint-letter quotations inspected.
- [March 23, 2026, military contracts investigation](https://www.warren.senate.gov/newsroom/press-releases/warren-opens-investigation-into-pentagons-designation-of-anthropic-as-national-security-risk-new-openai-contract/): her attributed letter passages inspected.
- [January 29, 2026, OpenAI financial transparency](https://www.warren.senate.gov/newsroom/press-releases/warren-presses-openai-ceo-on-spending-commitments-and-bailout-requests-after-cfo-suggests-government-backstop/): substantive release and her letter quotations inspected.
- [May 15, 2025, defense competition legislation](https://www.warren.senate.gov/newsroom/press-releases/warren-schmitt-renew-bipartisan-fight-for-more-competition-in-pentagons-ai-and-cloud-contracting/): bill summary and procurement proposals inspected.
- [April 8, 2025, cloud partnerships investigation](https://www.warren.senate.gov/newsroom/press-releases/warren-wyden-launch-investigation-into-google-microsoft-partnerships-with-ai-developers-anthropic-openai/): substantive release and joint-letter passages inspected.

Counterevidence against a preselected lower-half reading is strong: technological promise, conditional transformative labor scenarios, advanced-model safety concern and an explicit refusal in April to forecast future capabilities. A possible financial crash is not a settled occurrence. No personal numerical catastrophe probability or AGI deadline was verified.

Public quotes are exact standalone sentences or contiguous clauses, checked in the linked official texts: September pause paragraph two; May op-ed final paragraph; April prepared opening; March letter passage on civilian harm; January passage on legitimate tax credits and guarantees. No simulated statement is included.

## Integration and checks

IDs use `*-public` with canonical hyphenated fallback slugs and `xUsername: null`; none is featured. All use `responseStyle: detailed`. Presentation and registry integration, preview assets, scoped paid journeys and selected-run persistence are handled in the parent task. The brief does not supply interview answer keys or score ranges.

Targeted formatting, lint and runtime persona-schema validation passed for all three briefs. Public statements retain three, four and five distinct-source excerpts respectively.
