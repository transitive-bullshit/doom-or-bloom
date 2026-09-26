# Local debugging and content inspection

Use this guide for a failed submission, unexpected interpretation/routing, or a diagnostic export. For read-only cross-assessment database inspection and Drizzle Studio, use [local admin](admin.md).

Run `pnpm dev` and use its printed Portless URL. `pnpm exec portless get doom-or-bloom --no-worktree` resolves the root checkout; linked worktrees use their printed branch-prefixed URL. The launcher forces live Jev and lets `.env.development.local` override inherited variables; see [environment boundaries](../CONTRIBUTING.md#environment-boundaries) for how other commands differ.

## Start with the saved operation

1. For a failed or uncertain submission, identify its assessment and persisted request key. Inspect `assessment_operations` for status, deadline, base revision and bounded diagnostics; the previous committed `assessment_snapshots` row remains authoritative until an operation commits.
2. A lost response may already represent success. Use **Check submission** or refresh before retrying. Repeating the same request key reads its outcome; a known failed/interrupted operation uses a new key with `retryOf`. After the processing deadline passes, **Retry saved submission** resumes through a new synchronous request. There is no worker or restart-time automatic inference.
3. For a successful but surprising result, select its recorded browser operation and inspect the actual Jev inputs/outputs and deterministic decisions below. Opening inspectors or downloading recorded diagnostics makes no new inference calls.

Server progress and browser diagnostics have different lifetimes. Operations persist in PostgreSQL. Detailed Jev traces live in this browser's IndexedDB; unsubmitted drafts and uncertain request keys live in localStorage. A new browser/origin can recover server progress with the appropriate owner session, but cannot recover traces or unsubmitted drafts stored only in the old browser. Storage failures leave unsent typing in memory until the tab closes.

## Jev exchanges

Enable **Debug on** to inspect any recorded step. Trace capture is independent of this visibility toggle. Open **Jev / assessment debugging details** to inspect the selected operation. Requests are actual shared state plus that physical batch's questions; responses are validated typed outputs. Current operations use A (interpret), C (route) and D (result generation on request or automatic stopping; only persona mode adds excerpt evidence selection). Corpus grounding is paused; old B1/B2 exchanges remain labeled historical. Each stage explains its purpose. Local routing/projection decisions and the current saved assessment are separate views. Fixture exchanges are explicitly synthetic. Debugging does not expose hidden model reasoning.

JSON trees support folding, contextual field explanations and **Copy JSON**. Jev answer sorting is presentation-only: Choice/Score use `confidence`, Noul uses its `noul` probability, and copying preserves the recorded payload order. Contextual help comes from authored meanings and the recorded question, not generated reasoning.

Successful recorded operations are stored in browser IndexedDB for the current assessment, separately from progress. Refresh restores them; **Recorded operation** selects an earlier revision/stage set. Keep up to 64 recent operations, evicting entire oldest operations toward a 32 MB target. A retained operation is never shortened; a single operation exceeding storage availability can fail with a visible notice. Debug-off submissions retain the same diagnostic information. Creating a new assessment uses separate trace history and preserves the original. History belongs to this browser/origin, contains answer text, and is included in participant-downloaded reports but excluded from analytics, server logs and remote storage. Already lost traces cannot be recovered. Failed inference operations preserve the draft and return safe completed/failed-stage diagnostics when the connection succeeds; failures are not counted as completed assessment revisions.

## Questions and corpus

Open `/questions` for the current catalog entries. Rejected questions are deleted from all local draft catalogs; there is no soft-delete state. Select a graph node or list entry to inspect its wording and metadata. Family transitions show authored compatibility, not the next runtime choice: prerequisites, coverage, familiarity, usage, caps and Jev benefits still gate routing. Shared targets/novelty groups are similarity links. See [prompt quality review](prompt-quality-review.md) for the original full-catalog audit and deletion rationale. Issued participant history remains readable but does not keep a removed question in the built-in pool.

Open `/corpus` for the active built-in reference snapshots. Inspect kinds, dates/qualifiers, aliases, topics, source links, review status, complete summaries and associated entities/related entries. Arrows preserve authored direction. Related reports can describe the same event and do not prove independent corroboration. The diagram caps neighboring nodes at 25; the selected entry's full authored relationships remain listed.

Both pages are available only in local development. They make no inference or analytics calls. Editorial feedback forms and their write API have been removed.

## Synthetic User Journeys

Open `/user-journeys` for recorded persona simulations and the fixed real-user transcript replay, including exact questions/answers, candidate decisions and per-answer results. The inspector reads the latest local live collection; a fresh checkout has no full collection until records are imported or generated. Regeneration uses paid Jev and OpenAI through the CLI; fixed answers use no OpenAI participant. Mechanical regressions remain separate. See [user-journeys.md](user-journeys.md).

## Interview shortcuts

Cmd+Enter or Ctrl+Enter submits a nonempty answer through the same Continue guards. It cannot bypass the soft length cap, busy/recovery controls or saved-revision conflicts. Plain Enter inserts a newline; IME composition and repeated shortcut events do not submit. Focus remains under normal browser/user control.

## Paperclips

Ordinary recovery requires two consecutive high-confidence non-answers (threshold 0.85). Usable or ambiguous replies reset the streak; navigation/failed inference do not advance it. Exact standalone `test`, then `test again` count as clear misses locally. Exact `paperclips`, `show me paperclips` or `show paperclips` explicitly requests the interlude. Case, repeated whitespace and terminal sentence punctuation are normalized; meaningful answers mentioning tests or paperclip maximizers still require normal inference.

These exact phrases make no Jev calls and contribute no scores. Recovery allows three evaluated submissions per prompt; the one submission that reveals the interlude is exempt. The interlude appears at most once per assessment, surviving refresh. It pauses the interview; dismissing only removes the visual effect. **Try again** uses a remaining submission, **Try a different question** consumes a prompt, and New assessment creates a separate assessment. Reduced motion uses a static treatment. Once exhausted, a repeated explicit request cannot replenish attempts or replay the effect.

## Readiness

Inspect the meter's debug disclosure and per-dimension contributions in state JSON. Readiness measures evidence presence and coverage, not forecast correctness, reasoning quality or answer count. A well-covered first answer can unlock results; repeated sparse answers need not raise the meter. The formula and threshold belong to [assessment readiness](ASSESSMENT.md#question-budget-and-readiness). Exercise these paths with fixtures rather than paid pressure testing.

## Structured server failures

Provider and engine failures emit structured server logs. Saved-assessment engine and Jev logs share the persisted operation request key and include the assessment ID. Failed upstream HTTP calls include status, timing, request byte count/SHA-256, allowlisted response headers (including provider request IDs and Cloudflare ray IDs), and a bounded, sanitized error-body preview. JSON previews retain error fields only; echoed request strings, common credentials and personal identifiers are redacted. Large or unavailable request bodies disable body previews because they cannot be safely compared for redaction. Body sampling is capped at 8 KiB and 300 ms and does not consume the SDK response. Raw SDK exception messages remain excluded from general logs. Jev transient failures retry once. A `max_tokens_exceeded` response fails the operation without recursive splitting.

For saved-assessment requests, use the assessment ID and request key to inspect `assessment_operations`. Owner APIs expose only the action, status, deadline, base revision, failure category and retry link; private diagnostic counts and failure history remain in PostgreSQL. The public assessment serializer excludes all operations and browser debug traces. Do not assume every route returns an `X-Request-ID` header: saved-state recovery uses the persisted request key.

## Full assessment download

“Download full report” creates `doom or bloom assessment <id>.zip` in the browser. It contains `interview.md` (usable questions and answers), `assessment.md` (readable result summary), `diagnostics.json` (the complete recorded report data, including Jev inputs, outputs and assessment snapshots), `results.png` (the social sharing image) and `worldview-map.png` (the current main map). Text and JSON are compressed; PNGs are stored without additional compression. The archive preserves trace completeness metadata and excludes unsubmitted drafts and credentials. Missing historical diagnostics remain missing. Image generation must succeed before the archive is downloaded. The [historical diagnostic loop](diagnostic-improvement-loop.md) records the original rationale; current export fields are defined in `lib/sharing/`.

## Upstream reproduction

See the [September 26 Jev investigation](research/jev-403-investigation-2026-09-26.md) for verified context limits, live results and support correlation IDs. `scripts/replay-provider-operation.ts --target production --operation <id>` reconstructs the first provider stage from a read-only database connection. Adding `--send` makes exactly one physical Jev call; it never submits or commits the assessment. Run through `node --conditions=react-server --import tsx`. `scripts/probe-jev-context.ts --send` makes exactly four synthetic size probes without retries. These are explicit paid diagnostic tools, not routine checks.

Artifacts are private local files under ignored `work/diagnostics/` and may contain participant text. Review before sharing. Server transport coverage includes TypeSafe evaluation, OpenAI journey participants, X OAuth/syndication SDK fetches installed at Node startup, and the resource-preview fetch script. Successful response bodies are not logged.

## Reading the error cascade

Every structured event is emitted by Doom or Bloom: `emitter: "doom-or-bloom"` and `eventSource: "application"`. Names such as `jev_call_failed` and `jev_batch_failed` are our event names, never messages supplied by TypeSafe. Use `boundary` to identify where the event was recorded:

| Boundary / event | Evidence and application effect |
| --- | --- |
| `upstream_transport` / `jev_call_failed` | `upstream.source: "http_response"` identifies observed HTTP status and allowlisted headers. `bodyPreview` is sanitized upstream content, not an app-authored explanation. `application.effect: "http_response_returned_to_caller"` means the SDK will receive the same response; it does not yet establish whether retries or the assessment will fail. No synthetic exception is logged for an HTTP response. |
| `provider_adapter` / `jev_batch_failed` | Our evaluator batch has aborted. `error.sdk` identifies the actual SDK exception class. `error` is an application summary, not a raw provider body; `codeSource: "application"` labels our classifications such as `provider_http_403` and `max_tokens_exceeded`. Runtime/library codes retain their separate provenance. |
| `assessment_engine` / `assessment_stage_failed` | Our named assessment stage has aborted. Nested `error.cause` follows JavaScript exception wrapping and is not an additional upstream request. |
| `api` / `assessment_failure_response` | The API returns a saved failed/interrupted operation. `application` records operation status, public failure category, and our HTTP response status. This can recur when an existing failed operation is read by another POST; it does not imply a new provider call. |

Correlate saved-assessment events by `requestId` (the persisted operation request key), then stage and physical attempt. Provider request IDs identify upstream calls, not our operation. Several log lines can describe one failed call cascading through our layers. For a rejected request, the chain is upstream HTTP **403** → SDK `PermissionDeniedError` → our batch/stage failures → stored `evaluation_failed` → public `provider_rejected` → our HTTP **503** and saved-submission recovery notice. These are different representations of the failure, not competing upstream status codes.

A transport exception has `upstream.source: "transport"`, `responseReceived: false`, and no HTTP status/body. Do not describe it as a provider rejection. HTTP responses may originate at a provider's gateway or firewall; the response alone does not prove that Jev's inference service produced it. Legacy top-level status fields remain for existing searches; prefer the explicit `upstream.status` or `application.responseStatus` when interpreting new logs.

Auth handler and tweet SDK calls carry request-local correlation through AsyncLocalStorage; concurrent requests do not share IDs. Auth logs record failed HTTP outcomes or rethrown exceptions without reading response bodies, OAuth query parameters or cookies. The account-claim recovery hook logs its original exception before preserving the anonymous session and redirecting as before. Saved-assessment fallback errors include a request ID, method, route family and session/operation phase; explicit persisted operation IDs override request-local IDs in evaluation logs.

`database_pool_error` reports idle-client errors with pool counts and sanitized exception codes. It has no request ID because an idle connection error cannot reliably be attributed to an active request. The listener is installed once with the shared pool; connection limits and timeouts are unchanged. Query failures still propagate through their existing callers; no SQL, connection strings or row data are logged.
