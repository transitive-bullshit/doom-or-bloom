# Local debugging and editorial feedback

Run `pnpm dev` and use its Portless URL (`pnpm exec portless get doom-or-bloom`). The usual local address is `http://doom-or-bloom.localhost:1355/`; use the printed address if configuration differs.

## Jev exchanges

Enable **Debug on** before submitting. Open **Jev / assessment debugging details** to inspect the selected operation. Requests are actual shared state plus that physical batch's questions; responses are validated typed outputs. Current operations use A (interpret), C (route) and D (project on demand). Corpus grounding is paused; old B1/B2 exchanges remain labeled historical. Each stage explains its purpose. Local routing/projection decisions and the current saved assessment are separate views. Fixture exchanges are explicitly synthetic. Debugging does not expose hidden model reasoning.

JSON trees have syntax colors, accessible expand/collapse controls, exact JSON copy and reset-folds. Depth 2+ starts folded. Jev `answers` records offer **Default**, **High first** and **Low first** order in the JSON header. Choice/Score answers use `confidence`; Noul answers use their `noul` probability on the same sorting scale. Default is initially selected; ties preserve original order and missing/non-finite values stay last. Sorting changes only presentation, preserving folds; **Copy JSON** still copies the recorded payload in its original order.

Requests/responses appear beside each other on desktop and stack on smaller screens. Everything uses the page scrollbar.

Successful recorded operations are stored in browser IndexedDB for the current assessment, separately from progress. Refresh restores them; **Recorded operation** selects an earlier revision/stage set. Keep up to 64 recent operations, evicting entire oldest operations toward a 32 MB target. A retained operation is never shortened; a single operation exceeding storage availability can fail with a visible notice. Debug-off submissions record nothing. Restart clears that assessment's history. History belongs to this browser/origin, contains answer text, and is excluded from reports, analytics, server logs and remote storage. Already lost traces cannot be recovered. Failed operations currently preserve the draft but do not produce a completed operation trace.

## Questions and corpus

Open `/questions` for the 30 current catalog entries. Rejected questions are deleted from all local draft catalogs; there is no soft-delete state. Select a graph node or list entry to inspect its wording and metadata and leave feedback. Family transitions show authored compatibility, not the next runtime choice: prerequisites, coverage, familiarity, usage, caps and Jev benefits still gate routing. Shared targets/novelty groups are similarity links. See [prompt quality review](prompt-quality-review.md) for the original full-catalog audit and deletion rationale. Existing feedback notes and issued participant history are retained; neither keeps a removed question in the built-in pool.

Open `/corpus` for the active built-in reference snapshots. Inspect kinds, dates/qualifiers, aliases, topics, source links, review status, complete summaries and associated entities/related entries. Arrows preserve authored direction. Related reports can describe the same event and do not prove independent corroboration. The diagram caps neighboring nodes at 25; the selected entry's full authored relationships remain listed.

Both pages are available only in local development. They make no inference or analytics calls. Save free-form notes explicitly with **Save feedback**:

- `content/feedback/questions.json` — question feedback.
- `content/feedback/corpus.json` — snapshot feedback.

Each append records an ID, asset identity/label, current content version, resolved asset hash, timestamp and full feedback. Earlier notes remain intact; writes are serialized and replaced atomically. Damaged files are never silently overwritten. Failed saves retain the draft. The editor has no hard input cap; above 20,000 characters it explains the excess and disables saving. Switching entries retains in-tab drafts; unsubmitted feedback is not durable across refresh.

Future revisions should read these notes, check version/hash against the current asset and explicitly revise offline. Preserve earlier notes as history. A feedback note does not approve, validate or automatically change an asset. Do not put participant answers into these project files automatically.

## Synthetic User Journeys

Open `/user-journeys` for ten Codex-authored fictional personas, exact questions/answers, candidate decisions and per-step readiness. Free reruns save complete local exchanges and support comparisons against previous runs or the checked-in baseline. Real Jev regeneration is explicit, bounded and CLI-only. See [user-journeys.md](user-journeys.md) for modes, scripts, artifact storage and review limits. The tool is development-only and initializes no analytics or participant assessment.

## Interview shortcuts

Cmd+Enter or Ctrl+Enter submits a nonempty answer through the same Continue guards. It cannot bypass the soft length cap, busy/recovery controls or storage conflicts. Plain Enter inserts a newline; IME composition and repeated shortcut events do not submit. Focus remains under normal browser/user control.

## Paperclips

Ordinary recovery requires two consecutive high-confidence non-answers (threshold 0.85). Usable or ambiguous replies reset the streak; navigation/failed inference do not advance it. Exact standalone `test`, then `test again` count as clear misses locally. Exact `show me paperclips` or `show paperclips` explicitly requests the interlude. Case, repeated whitespace and terminal sentence punctuation are normalized; meaningful answers mentioning tests or paperclip maximizers still require normal inference.

These exact phrases make no Jev calls, contribute no scores and consume the same recovery submission budget. The interlude appears at most once per assessment, surviving refresh. It pauses the interview; dismissing only removes the visual effect. **Try again** uses a remaining submission, **Try a different question** consumes a prompt, and restart creates a fresh assessment. Reduced motion uses a static treatment. Once exhausted, a repeated explicit request cannot replenish attempts or replay the effect.

## Meaning help and readiness

Dotted JSON keys offer a short explanation on hover or keyboard focus; Escape dismisses it. Response judgments use their actual recorded request question; saved judgments use their stored question. Dimension IDs/classifications in assessment state use the authored meanings and local glossary. This is contextual help, not Jev reasoning or generated explanation. It adds no requests, alters no payload and is excluded from Copy JSON.

The Evidence readiness meter summarizes existing presence confidence and coverage. Debug disclosure explains the draft 55% threshold and formula; state JSON exposes per-dimension contributions. It is unrelated to forecast correctness or a high reasoning score. A well-covered first answer can unlock results; answering multiple sparse questions does not guarantee readiness. No paid pressure testing is needed to exercise these paths with fixtures.
