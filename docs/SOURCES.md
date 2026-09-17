# Corpus selection and source guidance

Updated 2026-09-17 from Travis’s source list and Notion canon. This supersedes the initial seed’s emphasis on historical milestones. The expanded seed is **not approved**; reassess it before editorial review and freeze.

## Required intake and freshness

Every source marked `requiredForInitialCorpus: true` in [source-intake.json](../content/source-intake.json) must be incorporated into the initial corpus. There are 114 deduplicated required URLs from the directly supplied list and [AI Risk Canonical Resources](https://app.notion.com/p/transitive-bs/AI-Risk-Canonical-Resources-3c5edb27f124807daa8fe82eb1cd4ffd). Preserve original URLs and their origin even when deduplicating tracking variants. The Notion bookmark was resolved to the already supplied Adolescence of Technology essay; its bookmark page is blank.

The later [argument maps and terminology tables](JOURNEYS.md) add 247 distinct candidate URLs, retaining overlaps and origins on the required records. These candidates support targeted authoring and definitions; they are not automatically independently verified or an additional mandatory reading quota. Preserve all five risk families and 69 concepts in authoring context, while choosing snapshots by relevance and the source roles below.

The list is a requirement for coverage, not an endorsement of every claim. A source can inform multiple snapshots; several articles about one incident do not become several independent incidents. Track the source-to-snapshot mapping so nothing disappears in deduplication. An inaccessible source stays required and blocked, with no invented summary. A URL inventory alone does not satisfy incorporation.

Heavily favor recent material for claims about **current** capabilities, behavior, deployments, cybersecurity, economic effects and institutional responses. Prioritize the last 90 days, then the current annual reports and previous 12 months. Use older work for mechanisms, history, or explicit conceptual arguments. The user’s required older sources remain included with those roles. Do not manufacture freshness from a crawl date, access date, copyright footer, or undated hub.

Pin a hub’s actual report/card/version and publication or revision date where its contents are used. A hub is useful as a resource, but reading its landing page does not establish that every linked document was read. Prefer recent evidence about both upside and risk; the required list’s composition must never become a scoring prior against a participant’s conclusion.

## Content types and their jobs

| Source type | What to capture | What it cannot establish by itself |
| --- | --- | --- |
| Model/system cards and lab research | Named model/version, tested behavior, methods, conditions, limitations, developer attribution | Independent safety certification, universal behavior or future guarantees |
| Independent evaluations and broad reports | Evaluation protocol, task distribution, reliability threshold, dates, uncertainty, coverage gaps | All real-world capability, AGI arrival, or calibrated catastrophe probability |
| Incident investigations and news | Event date, observed versus alleged actions, investigator, access to evidence, disputed accounts, aftermath | Intent or general prevalence beyond the evidence; related reporting is not independent corroboration |
| Cybersecurity and defensive programs | Measured attack/defense evidence separately from promises, program status and participation | That announcement implies effectiveness, universal access, or elimination of offensive advantage |
| Economics, science, energy and adoption evidence | Measured outcomes, population, study design, distribution, physical constraints, causal versus exposure claims | Economy-wide effects from one workplace; exposure is not job loss; benchmark science is not clinical validation |
| Forecasts and scenarios | Author, forecast date, assumptions, conditional paths, revisions, horizon and epistemic status | A realized event or a settled trajectory; a scenario is not evidence that its future happened |
| Essays, advocacy and firsthand testimony | Attributed thesis, stated values, incentives, firsthand versus inferred claims, competing interpretations | Unattributed factual consensus or verification of every allegation |
| Social posts, videos and podcasts | Author/speaker, date, exact thread/video, verified transcript or accessible content, linked primary evidence | Context from a headline, link preview, or inferred video contents; a post is not a whole research report |
| Foundational concepts and metaphors | Definition, logical assumptions, origin, illustrative purpose and transfer limits | Empirical proof of current model behavior or a separate branch of the assessment taxonomy |

Sources feed three reference kinds: **entities** identify scoped actors; **events** identify actual dated developments; **publications** capture reports, papers, essays, scenarios, posts and audiovisual works. Record the publication’s genre explicitly in authoring notes. Recommendations are a separate curated resource layer, with learning purpose, familiarity, effort and eligibility. A required source need not be recommended to every participant.

## Snapshot authoring and review

Keep the seven sections in [AUTHORING.md](AUTHORING.md): neutral context, reported facts, interpretations, known unknowns, claim support, related entries and review notes. Each snapshot must distinguish reported evidence from our interpretation, provide primary links/access dates, and name applicable dates and versions. Prefer concise paraphrase; do not archive entire copyrighted articles or transcripts.

For contemporary entries, add an explicit role and genre in the neutral-context section and a freshness note in review notes. State original publication/event date, material revision date if verified, and access date separately. Record author/developer/investigator incentives where sourced; mission language or affiliation alone does not prove impartiality or unreliability. Resolve apparent conflicts rather than silently favoring one source. Relationships should separate independent evidence from commentary, responses, updates and shared underlying experiments.

The reviewer checks accuracy, recency, neutrality, attribution, aliases, claimed transfer limits and recommendation fit. Earlier approval of a historical snapshot’s factual wording does not approve its relevance as a current entry point. Agent drafts and user-selected URLs are not automatically human-reviewed assets.

Before a local release, recheck contemporary model/evaluation entries older than 90 days, unsettled incidents, and mutable resource hubs. Annual reports must be the latest verified edition. Historical or conceptual entries do not expire merely because they are old, but must retain their role. Runtime uses frozen snapshots; this does not add live news retrieval or automatic rubric changes.

## Reassessment of the existing seed and drafts

| Existing material | Updated decision |
| --- | --- |
| OpenAI, Anthropic, DeepMind, METR | Keep entity identity/remit context; supplement with the supplied 2026 investigations, system evidence and institutional responses. An about page is insufficient evidence of current system behavior. |
| NIST, OECD, EU Commission, CAIS | Keep scoped institutional context. Use the current report/operating sources in the canon; the 2024 AI Act event only establishes its historical force date, not current legal obligations. |
| Deep Blue, Watson, AlphaGo, AlphaStar, AlphaFold CASP14, GPT-4 launch, ChatGPT preview | Retain historical milestones where a participant names them. They should not dominate current grounding or default reading suggestions. Replace the seed’s topical priority with recent supplied events and measurements. |
| Attention, scaling laws, Chinchilla, GPT-3 few-shot | Keep as historical technical context. They do not characterize the current frontier. |
| Concrete Problems, Off-Switch Game, CIRL | Keep conceptual/mechanistic roles; combine with recent empirical control, misalignment, multiagent and interpretability evidence. |
| NIST RMF 1.0 | Retain the required practical framework; contextualize it with current agentic operating guidance and dated deployment evidence. |
| The 36 publication expansion drafts | Reclassify as optional background candidates; pause historical expansion. Learned optimization, Concrete Problems, Off-Switch and the NBER study also occur in the required canon and must remain accounted for. |
| Existing 14 reading suggestions | Re-curate around current evidence and the supplied resource library. Older task-demo recommendations are background examples rather than primary current entry points. Preserve purpose diversity and familiarity gates. |

The former 100/100/100 target is a coverage guide, not a reason to pad the corpus with dated or weak entries. Incorporating every required source and achieving balanced, reviewed topical coverage takes precedence over symmetrical counts. Document actual counts, overlaps, exclusions of optional candidates and any required-source blockers.

## Research and draft checkpoint — 2026-09-17

All 114 required records now link to scoped research notes in the intake registry. That records what was accessible and actually inspected; it does not claim full-text access or corpus completion. Of these, 96 have research drafts, 17 have partial access and one is blocked. Twenty-three required URLs map to existing or separate draft snapshots; none of these mappings records new editorial approval.

The [recent-source inventory](research/required-recent-reports.md) links 18 contemporary draft snapshots in the current demo bundle. The two earlier publication batches remain optional historical background. Travis approved the [revised direction](current-context-review-packet.md) and prioritized an end-to-end demo before further reassessment. Individual review remains open. The demo contains 42 references and 14 current reading suggestions; older entries support explicitly named history or mechanisms.

Partial access includes publisher abstracts/previews, selected hub sections and the requested Epoch graph configuration. The Reuters article remains blocked. Read each record's scope before extending its claims. Preserve these requirements and resolve access or obtain verifiable publisher material before counting the full required library complete.

## Execution checklist

- [x] Fetch the Notion canon, resolve its unknown bookmark, and inventory all supplied external URLs.
- [x] Reassess the historical seed and pending expansion against the revised guidance.
- [x] Attempt every required source and attach scoped research notes, including access limits and source relationships.
- [ ] Resolve partial/blocked access and complete the required-source reading within each source’s stated scope.
- [x] Draft the first 18 contemporary reference snapshots outside the runtime bundle.
- [ ] Complete snapshots and source mappings for every required URL.
- [x] Re-curate the demo’s 14 reading suggestions using current sources, familiarity and purpose diversity.
- [ ] Complete review of prompts/findings and coverage changes across the full required library.
- [ ] Human-review the revised seed and subsequent batches; validate and freeze only approved assets.
- [ ] Verify all required sources are mapped and balanced coverage is documented before calling the MVP complete.
