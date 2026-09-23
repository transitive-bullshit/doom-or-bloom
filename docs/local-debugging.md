# Local debugging and content inspection

> Persistent assessments use [synchronous operations](PERSISTENCE.md#synchronous-execution-and-idempotency): server-side submissions, processing status and bounded failure records are saved inside bounded POST handlers. Inspect them with normal PostgreSQL tools. Detailed browser traces remain separate from server progress; no operator dashboard is required.

The [0.6.0 diagnostic loop](diagnostic-improvement-loop.md) documents the current export and per-answer inspection contract. All browser operations capture local traces; the debug toggle controls their visibility.

Run `pnpm dev` and use its Portless URL (`pnpm exec portless get doom-or-bloom`). The usual local address is `http://doom-or-bloom.localhost:1355/`; use the printed address if configuration differs.

## Jev exchanges

Enable **Debug on** to inspect any recorded step. Trace capture is independent of this visibility toggle. Open **Jev / assessment debugging details** to inspect the selected operation. Requests are actual shared state plus that physical batch's questions; responses are validated typed outputs. Current operations use A (interpret), C (route) and D (shared projection after each answer, followed by rubric evidence selection where needed). Corpus grounding is paused; old B1/B2 exchanges remain labeled historical. Each stage explains its purpose. Local routing/projection decisions and the current saved assessment are separate views. Fixture exchanges are explicitly synthetic. Debugging does not expose hidden model reasoning.

JSON trees have syntax colors, accessible expand/collapse controls, exact JSON copy and reset-folds. Depth 2+ starts folded. Jev `answers` records offer **Default**, **High first** and **Low first** order in the JSON header. Choice/Score answers use `confidence`; Noul answers use their `noul` probability on the same sorting scale. Default is initially selected; ties preserve original order and missing/non-finite values stay last. Sorting changes only presentation, preserving folds; **Copy JSON** still copies the recorded payload in its original order.

Requests/responses appear beside each other on desktop and stack on smaller screens. Everything uses the page scrollbar.

Successful recorded operations are stored in browser IndexedDB for the current assessment, separately from progress. Refresh restores them; **Recorded operation** selects an earlier revision/stage set. Keep up to 64 recent operations, evicting entire oldest operations toward a 32 MB target. A retained operation is never shortened; a single operation exceeding storage availability can fail with a visible notice. Debug-off submissions retain the same diagnostic information. Creating a new assessment uses separate trace history and preserves the original. History belongs to this browser/origin, contains answer text, and is included in participant-downloaded reports but excluded from analytics, server logs and remote storage. Already lost traces cannot be recovered. Failed inference operations preserve the draft and return safe completed/failed-stage diagnostics when the connection succeeds; failures are not counted as completed assessment revisions.

## Questions and corpus

Open `/questions` for the current catalog entries. Rejected questions are deleted from all local draft catalogs; there is no soft-delete state. Select a graph node or list entry to inspect its wording and metadata. Family transitions show authored compatibility, not the next runtime choice: prerequisites, coverage, familiarity, usage, caps and Jev benefits still gate routing. Shared targets/novelty groups are similarity links. See [prompt quality review](prompt-quality-review.md) for the original full-catalog audit and deletion rationale. Issued participant history remains readable but does not keep a removed question in the built-in pool.

Open `/corpus` for the active built-in reference snapshots. Inspect kinds, dates/qualifiers, aliases, topics, source links, review status, complete summaries and associated entities/related entries. Arrows preserve authored direction. Related reports can describe the same event and do not prove independent corroboration. The diagram caps neighboring nodes at 25; the selected entry's full authored relationships remain listed.

Both pages are available only in local development. They make no inference or analytics calls. Editorial feedback forms and their write API have been removed.

## Synthetic User Journeys

Open `/user-journeys` for 15 generated personas and the fixed real-user transcript replay, exact questions/answers, candidate decisions and per-answer results. The inspector shows the latest live run. Regeneration uses live Jev and OpenAI through the CLI; fixed answers use no OpenAI participant. Mechanical regressions remain separate. See [user-journeys.md](user-journeys.md).

## Interview shortcuts

Cmd+Enter or Ctrl+Enter submits a nonempty answer through the same Continue guards. It cannot bypass the soft length cap, busy/recovery controls or saved-revision conflicts. Plain Enter inserts a newline; IME composition and repeated shortcut events do not submit. Focus remains under normal browser/user control.

## Paperclips

Ordinary recovery requires two consecutive high-confidence non-answers (threshold 0.85). Usable or ambiguous replies reset the streak; navigation/failed inference do not advance it. Exact standalone `test`, then `test again` count as clear misses locally. Exact `show me paperclips` or `show paperclips` explicitly requests the interlude. Case, repeated whitespace and terminal sentence punctuation are normalized; meaningful answers mentioning tests or paperclip maximizers still require normal inference.

These exact phrases make no Jev calls, contribute no scores and consume the same recovery submission budget. The interlude appears at most once per assessment, surviving refresh. It pauses the interview; dismissing only removes the visual effect. **Try again** uses a remaining submission, **Try a different question** consumes a prompt, and New assessment creates a separate assessment. Reduced motion uses a static treatment. Once exhausted, a repeated explicit request cannot replenish attempts or replay the effect.

## Meaning help and readiness

Dotted JSON keys offer a short explanation on hover or keyboard focus; Escape dismisses it. Response judgments use their actual recorded request question; saved judgments use their stored question. Dimension IDs/classifications in assessment state use the authored meanings and local glossary. This is contextual help, not Jev reasoning or generated explanation. It adds no requests, alters no payload and is excluded from Copy JSON.

The Evidence readiness meter summarizes existing presence confidence and coverage. Debug disclosure explains the draft 55% threshold and formula; state JSON exposes per-dimension contributions. It is unrelated to forecast correctness or a high reasoning score. A well-covered first answer can unlock results; answering multiple sparse questions does not guarantee readiness. No paid pressure testing is needed to exercise these paths with fixtures.

## Structured server failures

Provider and engine failures emit structured server logs. Engine stage and Jev batch failures share a server-generated request ID; logs contain bounded status, stage, size and attempt metadata, without raw answers, credentials, provider bodies or exception messages. Jev transient failures retry once. A `max_tokens_exceeded` response fails the operation without recursive splitting.

For saved-assessment requests, use the assessment ID and request key to inspect `assessment_operations`. Owner APIs expose only the action, status, deadline, base revision, failure category and retry link; private diagnostic counts and failure history remain in PostgreSQL. The public assessment serializer excludes all operations and browser debug traces. Do not assume every route returns an `X-Request-ID` header: saved-state recovery uses the persisted request key.

## Full assessment download

“Download full report” creates `doom or bloom assessment <id>.zip` in the browser. It contains `interview.md` (usable questions and answers), `assessment.md` (readable result summary), `diagnostics.json` (the complete recorded report data, including Jev inputs, outputs and assessment snapshots), `results.png` (the social sharing image) and `worldview-map.png` (the current main map). Text and JSON are compressed; PNGs are stored without additional compression. The archive preserves trace completeness metadata and existing draft/credential exclusions. Missing historical diagnostics remain missing. Image generation must succeed before the archive is downloaded.

The new persistence endpoints retain operation input/status/deadline, physical request count, and bounded status/stage diagnostics in PostgreSQL. Inspect `assessment_operations` with normal Postgres tools. Failed attempts do not change `assessment_snapshots` or the head revision. Repeating the same request key reads its outcome; retrying a known failed/interrupted attempt uses a new key and `retryOf`. The interview now uses these endpoints. Browser-only unsubmitted drafts are keyed by assessment and prompt; refresh loads committed snapshots and saved submission status.

The optional development feedback widget is omitted when browser localStorage cannot be read. Assessment submission still uses the server; unsent typing remains in memory until the tab closes when draft storage is unavailable.
