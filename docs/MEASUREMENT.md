# Measurement, Privacy, and Evaluation

For storage, ownership and publication behavior, use [PERSISTENCE.md](PERSISTENCE.md). This document owns telemetry boundaries and evaluation standards; [testing.md](testing.md) owns routine engineering checks.

## Privacy posture

- No sign-up is required. Better Auth creates an anonymous owner on explicit start. Server records are retained indefinitely until deletion; clearing cookies loses access without deleting records. Optional X recovery is implemented when credentials are configured; local login, anonymous claim and sign-out/recovery were verified on 2026-09-23. Signing in transfers anonymous assessments without changing publication or revealing account identity on public pages.
- PostgreSQL stores submitted replies, rejected interactions, results and bounded failure diagnostics. Operators may inspect private assessments for improvement. Unsubmitted drafts stay in localStorage keyed by assessment and prompt. Browser debug records may contain raw text; keep them separate from analytics and public payloads.
- Internal `/questions` and `/corpus` tools disable page analytics and make no Jev calls. Participant transcripts are not sent to editorial tools.
- A random assessment identifier links anonymous events across resumed visits and changes when a new assessment or fork is created.
- Do not send raw answers, answer excerpts, full reports, private assessment URLs, query strings, or free-form clarification text to analytics. The only exception is the normalized link tags described under [Acquisition attribution](#acquisition-attribution).
- Do not enable session replay, heatmaps, autocapture, automatic exception payloads, or person profiles for MVP.
- Configure PostHog's project-level IP-data disposal; the deprecated client `ip: false` option is not sufficient.
- Each participant assessment stores the country it was created from, a two-letter code from Vercel's `x-vercel-ip-country` header, never the IP address ([PERSISTENCE.md](PERSISTENCE.md#constraints-and-indexes)). Publish it only in aggregates of 10 or more, like any participant statistic ([BLOG.md](BLOG.md#participant-data)); public pages and share cards never show it.
- PostHog's GeoIP enrichment adds an approximate location (country, region, city, postal code and coordinates) to every event before the IP is discarded, so `$geoip_*` properties exist even with IP-data disposal on. The privacy page says so.
- Explain accurately that this is pseudonymous per-assessment event linkage, not mathematical anonymity.

## Analytics responsibilities

- **Vercel Analytics:** basic site traffic and page-level health. Pageview URLs keep the path plus normalized `utm_source`, `utm_medium` and `utm_campaign` tags; a bare `ref` is sent as `utm_source`. A share link page reports its route, `/s/[id]` (with any locale prefix), never the link ID, which is the only key to that card. Vercel records the referring site itself. Paths keep their locale prefix (`/es/users`), so language shows up in page reports; owner, admin and local-tool paths are excluded in every locale ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#routing)).
- **PostHog:** explicit assessment events, enumerated result properties and the browser's first-touch properties.
- **Offline evaluation:** whether Jev and the authored system interpreted people correctly.

Production distributions cannot establish classifier correctness.

## Minimum event vocabulary

| Event | Meaning |
| --- | --- |
| `assessment_started` | First substantive answer submitted. |
| `answer_classified` | An answer disposition was committed, including deterministic test/paperclip replies that make no Jev call. |
| `answer_recovery_shown` | A committed response disposition produced an authored re-ask or clarification. |
| `assessment_paused` | Reserved compatibility event; current transitions retain recovery state without emitting a pause event. |
| `paperclip_interlude_shown` | The one-time paperclip recovery state was displayed. |
| `question_routed` | The next authored prompt was selected. |
| `results_unlocked` | Readiness and result eligibility reached. |
| `results_viewed` | A result was rendered to the participant. |
| `assessment_completed` | Once per assessment when the engine reaches `results` or an eligible `capped` result. This event does not freeze or publish the assessment. |
| `clarification_started` | Compatibility event for claim-specific clarification; the current participant UI does not expose this action. |
| `result_recomputed` | Compatibility event for a result updated after claim-specific clarification. |
| `assessment_capped` | The assessment’s prompt budget forced finalization (12 initially, up to 12 more per fork, 30 total). |
| `assessment_restarted` | Legacy event name; no longer emitted. Creating an assessment preserves previous records. |
| `resource_opened` | Curated resource link opened. |
| `full_report_downloaded` | Expanded report downloaded. |
| `share_card_downloaded` | Personalized card downloaded. |
| `share_intent_opened` | The owner opened a share action. Carries `share_target` (`native`, `x`, `threads`, `bluesky`, `linkedin` or `copy_link`), `share_surface` (`result_bar`, or `compare_result` for “Send them your result”) and `link_kind` (`snapshot` for a share link or `public` for a published page; `home` is reserved for links to the home page). Opening a composer does not mean anything was posted. |
| `share_link_created` | The owner's first share action created a share link for this result ([PERSISTENCE.md](PERSISTENCE.md#share-links)); reusing one emits nothing. Carries `share_surface`. |
| `compare_result_viewed` | A result was shown beside someone the participant came to compare with, once per result and source. Carries `alignment_bucket` (`very_aligned`, `mostly_aligned`, `some_distance`, `worlds_apart`, or `unknown` with too little in common) and `compare_source` (`persona` or `snapshot`). Never the share link, the thought leader or the other assessment. |
| `assessment_published` | The owner published an assessment. |
| `self_placement_submitted` | The participant placed themselves on the map before their first result was revealed. Carries only a coarse `placement_gap` (`close`, `moderate` or `far`). |
| `self_placement_skipped` | The participant skipped self-placement. |
| `result_feedback_submitted` | The participant answered “Does this feel right?”. Carries `feedback_rating` and the enumerated `feedback_aspects`; the optional comment is never sent. |

## Enumerated properties

Allowlisted properties may include:

- Assessment, content, rubric, and model versions.
- Question, prompt-family, and branch identifiers.
- Classification identifiers, never text.
- Question count and completion reason.
- Coverage and interpretation-range buckets.
- Result buckets and coarse projection regions.
- Resource identifiers.
- Whether an inference was disputed and which authored vector it concerned.
- Response disposition, recovery-attempt bucket, pause reason, and recovery action, using enumerated values only; never a participant “sincerity” or “troll” label.
- First-touch attribution: `first_touch_channel` (the tag, else the referring host, else `direct`), `first_touch_ref`, `first_touch_source`, `first_touch_medium`, `first_touch_campaign`, `first_touch_referrer` (a hostname only), `first_touch_landing` (a coarse page kind: `home`, `users`, `user`, `public_assessment`, `share_link`, `assessment`, `about`, `pdoom`, `blog` or `other`) and `first_touch_locale` (the landing URL's locale code, such as `en` or `es`; absent on records made before October 1, 2026).
- `interview_locale`: the locale code of the latest submitted answer (`es`, `ja`), from the answer's saved `displayLocale`; absent before algorithm `0.7.4` and before the first answer.
- Share target, share surface and link kind identifiers; alignment bucket and compare source. A comparison never sends the share link ID, persona slug or either assessment's ID beyond the event's own pseudonymous `distinct_id`: sending them would link two pseudonymous assessments.
- Self-placement gap bucket, feedback rating and feedback aspect identifiers. Guess coordinates and comment text stay in the private `assessment_feedback` table ([PERSISTENCE.md](PERSISTENCE.md#result-feedback)).

Use a client allowlist or `before_send` equivalent to strip unexpected properties and URL query/hash data.

PostHog's transport also carries its configured public project identifier, the random per-assessment `distinct_id`, SDK event identifiers/timestamps and `$process_person_profile: false`. Retain the public project identifier required by ingestion; it is not participant data. Verify the actual SDK payload against intercepted dummy endpoints in addition to testing the application event allowlist. Local fixtures and analytics transport checks use no inference credentials or real analytics ingestion.

Recovery events can occur before `assessment_started`, which still requires the first substantive answer. Keep their denominators separate when reading funnels. Re-asks are not new `question_routed` events unless a different prompt instance is issued; retries/reloads must not duplicate events. An Easter egg or paused assessment is not `assessment_completed`. Measure successful recovery and false rejection of usable answers alongside non-answer frequency; do not optimize for triggering the joke.

## Operational signals

The Jev spend budget reports through structured server logs (`lib/server/error-reporting.ts`), not PostHog: `jev_budget_threshold_crossed` at 80% (warn) and 100% (error) of the UTC day or month budget, `jev_provider_out_of_credits` (error) when TypeSafe reports no credits, and `jev_budget_unavailable` or `jev_budget_config_invalid` (error) when the budget cannot be read or configured. Each carries the period, threshold, spent and limit in USD, plus the usual request correlation and deployment fields; never answers, assessment or owner IDs. Find them in the Vercel runtime logs by event name. Blocked operations add no analytics event; their saved `budget_exhausted` and `provider_out_of_credits` operations are visible to operators in the [admin](admin.md) dashboard. See [TYPESAFE.md](TYPESAFE.md#spend-budget).

## Acquisition attribution

`lib/attribution/first-touch.ts` owns this boundary. The first page a browser loads writes a first-party `dob_first_touch` cookie, once, for 180 days. It holds the normalized `ref`, `utm_source`, `utm_medium` and `utm_campaign` tags (lowercase slugs of up to 64 characters), the external referring hostname, a coarse landing kind, the landing locale and a timestamp. The landing kind ignores the locale prefix: `/es/users/simonw` is a `user` landing with locale `es`. It never stores a path, query string, assessment ID or answer. Visitors who arrived before this cookie existed record their next visit as their first touch.

The server copies the cookie onto a new owner when Better Auth creates one, whether anonymous or through X sign-in, in the `user.first_touch` column. Claiming an anonymous owner into an account keeps the earlier of the two records ([PERSISTENCE.md](PERSISTENCE.md#implemented-x-claim-boundary)). The client adds the same record to every PostHog assessment event as the enumerated properties above. PostHog runs in memory with no persistence, so the cookie is the only link between a landing and later events.

Tag every link we post with `?ref=`, using a lowercase slug: a platform (`x`, `hn`, `lw`, `ph`, `reddit-<subreddit>`), a newsletter or podcast (`nl-<name>`, `pod-<name>`), outreach to a simulated person (`sim-<handle>`), or a share surface (`share-x`, `share-threads`, `share-bluesky`, `share-linkedin`, `share-native`, `share-copy-link`; the share bar adds these automatically). A result sent back from a comparison is tagged `compare`. Share links keep their ID in the path, which first touch never stores. Use `utm_campaign` to group a launch. Tags describe a channel, never a person who clicked.

## Search engines

Google Search Console and Bing Webmaster Tools measure how people find the site in search, which neither analytics product sees. Both were set up on October 2, 2026 under the owner's accounts:

- **Google Search Console** has a domain property for `doom-or-bloom.com`, covering every subdomain and protocol. It is verified by a `google-site-verification` TXT record at the apex in Vercel DNS; removing the record drops verification.
- **Bing Webmaster Tools** has `https://www.doom-or-bloom.com/`, verified by a `545d227d8ab453efdd8e9cde25b8a31f` CNAME to `verify.bing.com` in Vercel DNS. Bing's index also feeds ChatGPT search and Copilot.
- Both have `https://www.doom-or-bloom.com/sitemap.xml` submitted.
- **IndexNow** tells Bing and other participating engines about changed pages at once. The key is public by design and served at `/<key>.txt` from `public/` (`lib/seo/indexnow.ts`). Each submission goes to Bing's own endpoint (`https://www.bing.com/indexnow`), which Bing Webmaster Tools reports on, and to the shared `api.indexnow.org`. 200 and 202 mean accepted; 403 or 422 mean a key problem (the key file is missing or doesn't match, or a URL is off the host), 429 too many requests, and any of these fails the command.
- **Submission is automatic.** The [IndexNow workflow](../.github/workflows/indexnow.yml) runs `pnpm seo:indexnow --changed-since <time>` after every successful Production deployment Vercel reports to GitHub (a `deployment_status` event in the `Production` environment), and daily at 07:23 UTC. A deploy run submits the sitemap URLs whose `lastmod` is newer than the start of the previous successful run, so a failed run leaves its URLs for the next; the daily run looks back three days, which covers data-only changes such as a simulated-user import reaching the sitemap within its 48-hour regeneration, and posts dated a day or two before they were merged. A `lastmod` that is a bare date counts for its whole day. Only pages with a content date have a `lastmod` ([SEO.md](SEO.md#indexing-and-canonical-urls)); after changing a page without one, such as the home page, submit it by hand.
- By hand, `pnpm seo:indexnow` submits every sitemap URL, `--changed-since <ISO date or time>` only the changed ones, and `--url <url>` specific pages. It checks that the key file is live first, and `--dry-run` prints the URLs it would send without sending them.
- Bing Webmaster Tools also has an **AI Performance** report: citations of the site in Copilot and partner AI answers, with the grounding queries behind them.

**AI answers.** `pnpm seo:ai-citations` is the monthly AI-answer check from the SEO playbook. It asks the questions in `lib/seo/ai-questions.ts` (the site's core queries and a few searches from the [keyword study](research/seo-keywords-2026-10-02.md), phrased neutrally) to OpenAI's `gpt-5-nano`, the cheapest model with web search, and records the URLs each answer cites, whether any is on doom-or-bloom.com and at what rank, and the cited domains. Run `bash -lc 'pnpm seo:ai-citations --allow-paid --max-cost=0.5'`: the OpenAI key exists only in the owner's login shell, so never print it. It refuses without `--allow-paid` and a `--max-cost` of at most $1, `--dry-run` lists the questions, and each call is appended to `eval/runs/seo-ai-citations-<time>.jsonl`. A run costs about $0.16, almost all of it OpenAI's $10 per 1,000 searches. It writes the ignored `work/seo/ai-citations/<date>-<model>.json` and prints the questions where the site is cited, the top cited domains and the changes since the same model's previous run, comparing domains only across questions both runs answered. A reply cut off before any answer text counts as failed, not as an uncited answer. A request that times out without a response is logged and reported as possible spend, since OpenAI may still bill it, and the run file is written before any earlier run is read. Answers vary from run to run, so read the runs as a trend rather than a monthly score. Bing Webmaster Tools' AI Performance report (Copilot citations) and Search Console's Generative AI report complement it with what real users were shown.

## Experimental success

The project is exploratory. Do not impose a single vanity KPI. Read evidence across:

### North Star learning questions

Evaluate progress toward the [product goals](PRODUCT.md#north-star) separately from engagement:

| Goal | Evidence to seek | What it does not establish |
| --- | --- | --- |
| Understand one's worldview | Participants can explain their result, recognize its claims, correct misinterpretations, and distinguish their beliefs from our uncertainty. Reviewed cases support interpretation fidelity across divergent views. | Recognition or satisfaction alone does not establish correctness; a polished chart is not a validated assessment. |
| Sharpen one's worldview | In future Socratic follow-up studies, participants can identify a material assumption, assess pertinent evidence, and articulate a justified revision, retained belief, or uncertainty. Review evidence relevance and false challenges as well as participant feedback. | Moving toward a preferred outlook or policy is not success. The current MVP does not demonstrate learning from evidence-grounded follow-up. |
| Improve AI discourse | Future qualitative review finds clearer claims, explicit assumptions, better use of evidence, and substantive engagement with alternatives in discussions the product supports. | Sharing, resource clicks, and completion cannot establish broader discourse impact or causation. |

For result-design experiments, compare the current map with candidate axes and visualizations on comprehension, faithful interpretation, and usefulness of the next question they suggest. Check whether participants confuse overall outlook with P(doom), evaluator interpretation ranges with forecast uncertainty, or unexplored reasoning with demonstrated weakness. Treat attention and sharing as supporting signals.

These are research directions, not new telemetry requirements or claims of validated outcomes. Use voluntary feedback and appropriately reviewed study material within the privacy posture above; do not collect participant transcripts through analytics to measure them.

### Sharing and comparison

The share loop is measured by `share_intent_opened` ÷ `results_viewed` (unique assessments) and by completions whose first touch is a `share-*` or `compare` tag. Alignment buckets are calibrated on simulated users ([lib/sharing/compare.ts](../lib/sharing/compare.ts)): about the 10th, 35th and 70th percentiles of pairwise distances between the 144 selected simulated users on October 1, 2026. Revisit the thresholds once real comparisons exist, from the bucket distribution alone; comparisons are never stored. As elsewhere, none of this changes scoring or is a target for it.

### Engagement

- Root-answer submission.
- Readiness-based result completion.
- Voluntary continuation depth.
- Additional answers that refine an interpretation; claim-specific clarification is a future/compatibility path.
- Resource openings, report downloads, and sharing intent.
- Organic discussion, criticism, and repeat references to the project.

### Resonance

Participants give two optional, lightweight signals ([PRODUCT.md](PRODUCT.md#results)):

- a self-placement on the map before their first result is revealed;
- a one-tap “Does this feel right?” with optional aspects and a comment.

Both are stored privately with the assessment, together with what was displayed. A participant who answers the optional placement question sends their guess once more, in that private operation record, so the engine can choose the question; it is never published or sent to analytics. A disagreement is informative, but neither agreement nor disagreement alone establishes evaluator correctness. Review them periodically as patterns across many participants, for example by answer length, outlook region or algorithm version, using the read-only [feedback audit](benchmark.md). Never tune to a single response. Record decisions in a dated research note before changing questions, definitions or estimators, then confirm them on the [regression benchmark](benchmark.md).

### Evaluation quality

Maintain a blinded, human-reviewed holdout set.

Follow [evaluation-protocol.md](evaluation-protocol.md) when preparing labels, locking a held-out run, adjudicating disagreements or assessing release quality. It records provisional numerical tolerances before a new run; paid evaluation remains unapproved.

Use [argument journeys](JOURNEYS.md) to create development examples and separate held-out cases. Published synthetic journeys are drafts, not a blinded holdout or estimates of participant prevalence. Use local fixtures for bounds. Future paid semantic evaluation requires a small reviewed suite and explicit cost budget; paid pressure testing is out of scope. Evaluate at least:

- Reference identification and attribution when corpus grounding is enabled; it is currently paused.
- Worldview-category classification.
- Epistemic rubric agreement.
- Question-routing usefulness.
- Projection stability under paraphrase.
- Bias across conclusion, expertise, verbosity, technical vocabulary, and writing style.
- False contradiction and false factual-error rates.
- False non-answer rejection, especially on relevant humor, uncertainty, critical viewpoints, and writing styles; recovery success and bounded termination on repeated nonsense.
- Answer language. Every enabled language asks machine-translated questions (native review covers only the root question, recovery copy and claim wording), and Jev reads answers as written, with one line naming the interview language. Each answer records its `displayLocale` and events carry `interview_locale`. Treat results across interview languages as not yet comparable: compare dispositions, readiness, confidence and placements by language once there is real data ([INTERNATIONALIZATION.md](INTERNATIONALIZATION.md#jev-and-the-participants-language)).

Review disagreements qualitatively; aggregate accuracy can hide asymmetric ideological failures.

## Release learning loop

1. Review aggregate funnels, routing frequency, low-confidence regions, corrections, and abandonment.
2. Form a concrete hypothesis about a prompt, rubric, or graph weakness.
3. Add reviewed examples that reproduce the issue.
4. Revise authored assets offline.
5. Evaluate against held-out and regression sets.
6. Publish a versioned content or rubric release with a short methodology changelog.

Do not automatically change assessment standards to match the majority of participants or optimize solely for agreement and sharing.

The [feedback audit](benchmark.md#feedback-audit) supports step 1 with a private, read-only review of participants' self-placement and agreement feedback. The [regression benchmark](benchmark.md#regression-benchmark) supports step 5 with fixed simulated participants and references. Both are development evidence, not the blinded human-reviewed holdout above.
