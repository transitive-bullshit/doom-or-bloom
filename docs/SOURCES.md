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

## Current local draft integration — 2026-09-17

New assessments use `0.3.0-draft`, with 135 reference identities: the earlier 42 plus 93 mapped required-source drafts. All 114 mapped required snapshot identities, representing 111 required URLs, are present in the local corpus. The three unmapped originals and all partial-access scopes remain open; assembly confers no new review. Prompts, rubrics, findings and the 14 recommendations keep their existing semantics. Saved `0.2.0-draft` assessments retain their original 42-reference corpus until restart.

The [release provenance](../content/releases/0.3.0-draft/provenance.json) records source paths, original content versions and hashes, including deliberate reuse of the two older required publication drafts. The 127 authoring copies remain preserved; 93 have current-release copies, so the populations overlap rather than provide 262 distinct entries. The original authoring notes describe their earlier inclusion state; the current manifest and generated index identify runtime copies. No content/rubric release has been frozen.

Required-source review and balanced genre/topical coverage remain explicit gates. Freeze now refuses any required original without compatible reviewed snapshot mappings, in addition to the ordinary complete-asset review/hash checks.

## Research and authoring checkpoints before integration

Use the [source coverage and review index](research/source-coverage-2026-09-17.md) to find every required original, mapped asset, research heading, access gate, overlapping identity and current subject counts. `pnpm content:coverage` regenerates the index from repository metadata; its counts do not confer review or prove topical balance.

All 114 required records now link to scoped research notes in the intake registry. That records what was accessible and actually inspected; it does not claim full-text access or corpus completion. Intake statuses are 96 scoped drafts, 17 partial-access records and one blocked record. One hundred eleven required URLs map to active or separate draft snapshots; none of these mappings records new editorial approval.

Follow-up notes inspect selected current developer cards behind the three required [system-card hubs](research/required-current-system-cards.md), preserving checkpoint, induced-behavior and inherited-assessment limitations. [Economic methods notes](research/required-economic-methods.md) cover accessible current related primary versions, causal scope and disclosures; the exact NBER originals remain blocked. Research depth does not change review status or silently replace required URLs.

The [recent-source inventory](research/required-recent-reports.md) links the 18 contemporary draft snapshots first integrated with 24 background entries. The two earlier publication batches remain historical authoring candidates, with two required identities selected into the expanded release. Travis approved the [revised direction](current-context-review-packet.md) and prioritized an end-to-end demo before further reassessment. Individual review remains open. At that seed checkpoint the demo contained 42 references and 14 reading suggestions; older entries support explicitly named history or mechanisms.

The [required perspective batch](research/required-perspectives-batch-01.md) authored 25 separate essay/scenario/testimony drafts: 16 dated 2026, eight older influential or conceptual sources and one undated scenario with a current changelog. Their findings remain attributed rather than promoted into measurements. The unread SAGE chapter and limited Noah Smith preview remain unresolved. The original batch preceded integration and conferred no individual asset review.

The [measurement/disclosure batch](research/required-measurement-batch-01.md) authored 15 separate drafts and mapped 12 required URLs, retaining three original developer hubs alongside separately pinned September cards. Dashboard success rates, evidence vintages, inherited assessments, private test conditions and organizational disclosures remain explicit. That authoring checkpoint retained the earlier 42-reference demo. [Workforce follow-up](research/required-workforce-evidence.md) further distinguishes descriptive payroll signals from randomized workplace interventions and preserves the blocked exact HBS working-paper version; it is research, not asset review.

The [workforce batch](research/required-workforce-batch-01.md) authored six scoped snapshots, retaining causal versus descriptive estimands, percentage-point versus relative-percent differences and intervention/evidence vintages. Four related-version mappings retain partial access for the exact required HBS/NBER originals; a mapped source is not necessarily completed. No new asset was individually reviewed at that checkpoint.

The [conceptual batch](research/required-foundations-batch-01.md) adds 13 required historical/abstract/publisher-scope drafts, keeping objective mismatch, learned goals, strategic concealment, alignment generalization and containment distinct. Thought experiments, human roleplay and advertised book theses are explicitly separated from contemporary observed evidence. The existing Off-Switch identity is reused, and three partial-access records remain partial.

The [governance/control/scenario batch](research/required-governance-batch-01.md) authored 11 scoped drafts, including a [pinned RSP policy follow-up](research/required-rsp-policy-followup.md). Written provisions, conditional scenarios and ontologies remain distinct from compliance or demonstrated capability. The [social/video batch](research/required-social-batch-01.md) authored nine verified-root or selected-caption publications, retaining unverified empirical claims, quote/edit dependencies and attribution limits. These batches were separate from the demo at authoring and remain unreviewed after draft integration.

The [perspective/discovery batch](research/required-perspective-hubs-batch-01.md) adds 12 scoped drafts, preserving competing adoption/acceleration arguments, historical theory, named practitioner examples and discovery-only hub identities. Four access-limited records remain partial. Subject tags on this and the governance/social batches reflect actual content. Existing mapped draft snapshots have been reconciled to intake `draft` status; none becomes reviewed.

Three required URLs still have no snapshot: the blocked Reuters article (`source.required-005`), unread SAGE chapter (`source.required-028`) and preview-only Noah Smith essay (`source.required-042`). The other 15 partial-access records have limited-scope mappings; this does not clear their access gates or prove full required-source incorporation.

Partial access includes publisher abstracts/previews, selected hub sections and the requested Epoch graph configuration. The Reuters article remains blocked. A [bounded limited-access follow-up](research/required-limited-access-followup.md) found no change to the unread SAGE chapter or Noah Smith preview-only essay; a later essay is not silently substituted. Read each record's scope before extending its claims. Preserve these requirements and resolve access or obtain verifiable publisher material before counting the full required library complete.

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
