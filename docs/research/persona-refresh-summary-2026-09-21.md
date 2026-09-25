# Persona source and presentation refresh — 2026-09-21

The current catalog has 37 public proxies and 10 fictional personas. The saved collection has 48 journeys including the fixed real-user regression. Noah Smith was generated through the real OpenAI participant and Jev assessment path; his first answer produced a result. Incremental estimated API cost: $0.02066. Existing journeys remain unchanged; current source briefs are distinguished from the source snapshots used to generate their answers.

Source review reports:

- [Core voices](persona-refresh-core-2026-09-21.md)
- [Frontier voices](persona-refresh-frontier-2026-09-21.md)
- [Foundations, society and civic voices](persona-refresh-foundations-2026-09-21.md)
- Recent speaker-specific interviews: [Sam](persona-interviews-sam-2026-09-21.md), [Dario](persona-interviews-dario-2026-09-21.md), [Hinton](persona-interviews-hinton-2026-09-21.md)
- [Noah Smith](noah-persona-2026-09-21.md), including unresolved supplied Substack redirect links
- [Explicit P(doom) evidence and simulation comparison](explicit-pdoom-2026-09-21.md)

Persona results share assessment components with subject-aware language and avatar markers. Standard source bookmarks appear in one column, followed by tweets in masonry with at most two columns. Tweet failures retain a usable source link.

## Preview maintenance

Run `pnpm resources:previews` to prefetch source metadata and optimize images to local WebPs. The pipeline prefers social images, then representative article/structured-data hero images or video posters. PDFs can use their first page when Poppler's `pdftoppm` is installed. `lib/sharing/resource-preview-overrides.json` holds reviewed exceptions; platform logos and unrelated navigation images are not suitable article previews.

For sources requiring rendered-page inspection, save reviewed HTML or a viewport screenshot to a temporary directory, named with the first 12 hexadecimal characters of SHA-256 of the exact source URL, followed by `.html` or `.png`. Import with `pnpm resources:previews --captures=/tmp/doom-source-captures`. Use `--url=<exact-url> --refresh` for a targeted refresh. Do not capture access challenges or paywalls as article previews.

Image provenance is retained in `lib/sharing/resource-previews.json`; unresolved URLs are recorded in resource-preview-gaps.json (local `work/research/resource-preview-gaps.json`). The latest pass covers 199 of 207 non-tweet URLs, including preserved older snapshot URLs. Remaining gaps include blocked/time-out sources and obsolete snapshot links; the UI keeps normal bookmarks for these rather than fabricated imagery.
