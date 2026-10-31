# SEO and backlink implementation review

Research date: October 31, 2026. Base: `027bfec861811587bad750ca03309dc005428fe0`, compared with a fresh HTTPS fetch of `main` (identical). Work is local on `codex/seo-citation-assets`. SSH authentication failed through the local key agent; HTTPS succeeded. No production change, outreach, listing, account signup, link placement or paid inference was performed.

## Evidence and decisions

The user supplied [Borja’s post](https://x.com/borjafat/status/2116164330014007296). X returned 403; its full 69-item text was readable in the [repost on Florian Darroman’s public timeline](https://teapawt.org/floriandarroman). This is a secondary copy. Its tactic rankings and reported AI mentions are unverified marketing claims, not evidence that any tactic caused growth.

The useful recommendations for this project are source-backed resources, reader-relevant editorial references, documented methods, mention reclamation, and placement verification. The existing free assessment, research posts and source table provide those assets already. A downloadable source table adds practical value without creating another competing landing page. [Google’s dataset guidance](https://developers.google.com/search/docs/appearance/structured-data/dataset) supports describing a download through `Dataset.distribution`.

Reject automated placements, reciprocal-link obligations, paid ranking links and mass low-quality directories. [Google’s link spam policy](https://developers.google.com/search/docs/essentials/spam-policies#link-spam) explicitly covers these patterns. The post’s exchange ranking does not override it. Do not buy a Distribb subscription or install its skill on this task’s authority.

| Recommendation | Project decision |
| --- | --- |
| Useful free tools | Keep the existing bounded interview as the tool; do not invent another P(doom) calculator or imply calibrated predictions |
| Citable evidence | Add a sourced CSV to the existing P(doom) hub; retain original tokens, dates and context |
| Original statistics | Reuse the existing launch-week and poll-methodology posts with their methods and limitations; public statements are a curated compilation, not original survey data |
| Editorial and roundup gaps | Propose a narrowly relevant addition on the candidate pages below; SaaS buyer roundups do not fit this educational product |
| Reclamation | Check actual mentions and Links exports before proposing a request or redirect |
| Broken links | Require a currently broken URL and a substantively equivalent replacement; none was verified in this pass |
| Graphics and video | Defer until an editor expresses interest; no unsolicited production or implied endorsement |
| Journalist requests | Prepare evidence from existing public posts; no reporter request or deadline was verified, so no invented lead |
| Vendor case studies | A possible later technical story about the adaptive interview; obtain permission and verifiable outcomes before pitching |
| Directories | Only independently curated, eligible educational resources; no fabricated government, supplier or business eligibility |

## Local implementation

- `/p-doom/data.csv` uses the same curated published people and verified statements as the hub, cached until the next deployment. A localized download label appears on the hub in all ten locales; every language uses the same English data file without changing the locale cookie.
- `Dataset.distribution` points to the CSV, and llms.txt describes its scope and citation guidance. The sitemap keeps the descriptive `/p-doom` landing page, rather than adding a duplicate dataset landing page.
- The CSV includes `name`, `statement_type`, `stated_p_doom`, `quote`, `note`, `outcome`, `horizon`, `conditions`, `source_title`, `source_url`, `source_published`, `profile_url`, `citation_url` and `dataset_as_of`. `no_number` has an empty value, never zero. Dates retain their original precision; the dataset date matches the hub. Quoted cells preserve Unicode, commas, quotes and newlines.
- No simulated probability, private participant answer or new demographic statistic enters this export. Bounds and ranges stay text, so consumers must not treat them as directly comparable measurements. Cite the hub and the original statement. No third-party quotation license is asserted.
- The current [SEO contract](../SEO.md#citable-resources-and-backlinks) documents these rules. Regression coverage checks filtering, source context, ranges/refusals, CSV encoding, locale routing, structured data and the browser download.

## Candidate ledger

These pages were read on October 31. Priority reflects editorial fit, not predicted ranking benefit. Every item remains **research only**; no contact, submission or earned link is claimed. Public channels are navigation paths, not permission to use them. Recheck the live page and source dates before any approved approach.

| ID / priority | Specific page and observed context | Proposed addition and destination | Public channel / readiness |
| --- | --- | --- | --- |
| P1 / first | [AISafety.info: What is p(doom)?](https://aisafety.info/questions/NM24/What-is-pdoom) explains subjective estimates and why different outcomes and horizons complicate comparisons; it links to PauseAI’s list | After the paragraph about estimates varying, offer a sourced table and reusable data, linking to `/p-doom#pdoom-table-title`. The extra value is context and exportability, not another definition | The article has “Suggest changes in Google Docs”. Draft below; approval and publication of the new download required |
| P2 / first | [PauseAI: List of p(doom) values](https://pauseai.info/pdoom) has linked estimates and explicitly notes unspecified horizons | Offer the CSV as a companion reference with outcome/horizon/conditions and no-number statements. Do not claim older statements are false merely because dates differ; verify discrepancies against the original source | [Contact page](https://pauseai.info/contact-us), Feedback tab; the site also offers an edit-on-GitHub link. Draft below; no submission |
| P3 / later | [80,000 Hours AI guide](https://80000hours.org/ai/) includes introductory risk FAQs and links to further reading | A supplemental exercise to articulate an AI worldview, linking to `/`, with the experimental nature and simulated comparisons disclosed. This is a stretch fit, not a career or safety-training product | Editorial channel not verified in this pass. Hold until a public feedback route and a specific learning slot are confirmed |
| P4 / later | [AI Impacts surveys](https://aiimpacts.org/surveys/) links primary survey results and methodology discussion | Offer the existing `/blog/why-polls-on-ai-disagree` comparison as a downstream explanation of question and sample differences. Preserve AI Impacts as the primary source; do not request a link in return for citing it | [Public feedback page](https://aiimpacts.org/feedback/). Review the exact section with an editor first; no promise of inclusion |
| P5 / defer | [AISafety.com self-study](https://aisafety.com/self-study) is specifically a directory of courses, curricula and reading lists | The current interview alone is not a course. Do not use “Add a course”. Reconsider only if a real reading guide built from the existing sourced materials meets the category | “Suggest a correction” and “Add a course” are visible, but eligibility for the latter is not established. Do not submit |

AISafety.info and AISafety.com may share maintainers; deduplicate by actual editor/contact before using either channel. Browser-readable searches of the first two candidate pages found no `doom-or-bloom` text. That is a page-level observation, not proof of no backlink anywhere on the domain.

### Draft for P1 — not sent

Subject: A sourced P(doom) table for your examples paragraph

Your explanation of why P(doom) estimates are hard to compare would pair well with a concrete set of examples. I build Doom or Bloom; our curated table links each public statement to its source, and the downloadable CSV retains outcomes, horizons, conditions and no-number responses. It keeps these statements separate from our simulated worldview profiles. Would this be useful as an optional reference after your paragraph about estimates varying?

Suggested addition: “For examples, Doom or Bloom’s [sourced table of public P(doom) statements](https://www.doom-or-bloom.com/p-doom#pdoom-table-title) includes source links and downloadable context; the estimates use different definitions and time horizons.”

### Draft for P2 — not sent

Subject: A context-preserving CSV companion for your P(doom) list

Your list already notes the problem of unspecified time horizons. I build Doom or Bloom, where we maintain another curated set of public statements with source dates, outcomes, horizons and conditions in a downloadable CSV. It also distinguishes people who decline to give a number. If useful for readers comparing statements, this could be a companion resource; it is not a like-for-like survey or a reason to discard an older source.

Suggested addition: “A [context-preserving P(doom) table and CSV](https://www.doom-or-bloom.com/p-doom#pdoom-table-title) from Doom or Bloom records source dates, outcomes, horizons and conditions alongside the stated numbers.”

## Reclamation and execution queue

1. After approval to publish, deploy and verify the hub, CSV and structured-data URL. The drafts above describe the proposed published behavior and must not be sent before it is live.
2. Obtain current Search Console Links and 28-day Performance exports through the owner’s account. The [measurement contract](../MEASUREMENT.md#search-engines) records both Google and Bing as already verified; do not duplicate setup. Inspect referring-page context and any dead destination before deciding on a request or redirect.
3. Broad searches for the domain and “Doom or Bloom” plus AI worldview found repository activity and a domain-information page, not a verified unlinked editorial mention to reclaim. Exclude those low-value pages; do not treat this limited search as a complete backlink audit. Check the owner’s known launch threads separately before contacting anyone.
4. Present P1 and P2 with the final deployed URL and proposed copy for specific outreach approval. If approved, use one appropriate channel per editor, disclose creator affiliation, and leave inclusion and anchor wording to the editor. No reciprocal link or followed-link requirement.
5. Track `prospect_id`, source page, editor/channel, destination, reader benefit, approval, contact date, response, placement URL, observed anchor/rel, first verified date and status. Deduplicate domain, editor and source page before contact. Recovered links and new links are separate, as are links and referring domains. The ledger currently has no sent or live entries.
6. After any approved placement, verify the actual href, response status, surrounding paragraph, rel attribute and whether the destination is still useful. Review after 28 days and again after 60 days; do not promise a ranking change. These are suggested review intervals, not scheduled automations.

Use [existing attribution](../MEASUREMENT.md#acquisition-attribution) for referral visits and assessment starts/completions, and compare Search Console query/page impressions and clicks across two adjacent 28-day windows. Report timing and other launches/content changes as confounders. Measure AI citations separately; the existing paid AI-answer command remains approval-gated and was not run. A placement, citation, referral and completed assessment are four different observations.

## Verification record

Verification ran on base `027bfec861811587bad750ca03309dc005428fe0` with this task's changes uncommitted. No production acceptance or publication was attempted.

| Command / evidence | Result |
| --- | --- |
| `SWC_NATIVE_BINDING_CACHE=/private/tmp/doom-bloom-swc-501 pnpm test` | Pass: formatting, lint, TypeScript, **755 tests in 124 files** (Vitest 8.19 seconds), content, translation and contract validation, and unused-code checks |
| `SWC_NATIVE_BINDING_CACHE=/private/tmp/doom-bloom-swc-501 pnpm check:browser tests/browser/seo.spec.ts tests/browser/breadcrumbs.spec.ts --max-failures=1` | **12 passed**, 40.7 seconds; actual English and Spanish downloads, filename, headers, table parity, language-cookie preservation, metadata and surrounding SEO/breadcrumb flows |
| `SWC_NATIVE_BINDING_CACHE=/private/tmp/doom-bloom-swc-501 pnpm build:local` | Pass after the framework's initial security interruption: 384 generated pages, **215** pregenerated profiles, two public assessments, new static CSV, portrait/font tracing and admin-route checks |
| `SWC_NATIVE_BINDING_CACHE=/private/tmp/doom-bloom-swc-501 pnpm check:prefetch --max-failures=1` | **14 passed**, 13.5 seconds, with PostgreSQL deliberately unreachable; the CSV returns 200, `x-nextjs-cache: HIT`, the correct content type and filename, and no language cookie |
| Python standard-library CSV parse of the built response | **24 rows: 20 stated, four no-number**, all source URLs present, dataset dated `2026-10-11`; no-number values empty. Review copy and summary in ignored `work/seo/p-doom-public-statements.csv` and `work/seo/csv-review.json` |
| `pnpm fix:lint`, `pnpm fix:format`, `git diff --check` | Pass; local contract links and section anchors checked |

Setup repairs were local and credential-free apart from existing localhost database access. The default SWC cache was outside the sandbox; an explicitly allowed real `/private/tmp` path fixed native-addon loading (`/tmp` is a symlink and SWC rejects it). Localhost checks required sandbox escalation and were approved. The first browser seed stopped because the ignored latest collection lacked Taleb. Recovered his exact already-published simulated journey, original run `1792697334331-ef6d5024-bbaf-4340-b0ac-a3d3db163e12`, from the native local development database into the ignored store, preserving original provenance and verifying equality. This recovery made no database writes or inference calls; the normal browser seed then succeeded against the disposable test database. Recovery receipts are in ignored `work/seo/`.

Next.js 16.4.0 issued its existing security-upgrade interruption on the first build and dev-server run; the repeated commands completed with the warning retained. The interrupted browser run saw Portless 404 pages after that server exited; its traces were preserved under ignored `work/seo/browser-security-interrupted/`. These were setup interruptions, followed by the passing suites above. The warning is backed by the [official October 14 security advisory](https://nextjs.org/blog/nextjs-security-update-october-14-2026), which identifies **16.4.1** as the patched 16.4 release. Recommend a separate framework security update; no dependency upgrade is included in this SEO change. Existing metadataBase and optional Agentation warnings also appeared; the metadata assertions passed.

There are no remaining implementation/check blockers. Publication and all external approaches remain pending explicit approval under this task's scope; nothing has been sent, submitted, purchased or deployed. Search Console exports and a paid AI-citation run were not obtained, so no ranking, citation or backlink uplift is claimed.
