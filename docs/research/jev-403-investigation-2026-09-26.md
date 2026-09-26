# Jev 403 investigation — September 26, 2026

## Finding

The original HTTP 403 is not reproduced. Reconstructing its first interpretation request succeeded through the live Jev API. Deliberate context overflow reliably returned **HTTP 400**, with the exact response below. These results argue against size as the explanation for this incident, without proving what happened at the production edge.

```json
{ "detail": { "error_type": "max_tokens_exceeded" } }
```

The [TypeSafe model documentation](https://docs.typesafe.ai/models), checked September 26, specifies 64k tokens for state plus all questions, and 32k for state plus the longest question. The probes bracket these limits; they do not measure the exact tokenizer boundary. Raw request bytes are not token counts.

## Original incident

Assessment `b5e4591d-0ccf-4306-ac01-89fe5edf7ac6` had six failed operations between 06:34:15 and 06:35:45 UTC. All failed during `A: interpret`, attempt 1, upstream status 403. No answer was committed; the assessment remained at revision 0. The six stored action hashes matched. A read-only comparison found 67 successful operations on 18 other assessments between 05:30 and 08:00 UTC.

Selected Vercel invocation:

- Timestamp: `2026-09-26T06:35:45.608Z`
- Vercel request: `75pqs-1790404545199-dd923f02355b`
- Application log request: `1853227e-1e06-46c6-9640-1c333ff42a50`
- Persisted operation: `fa6302d8-0329-47e8-a4df-2d88e29c8cd5`
- Deployment: `dpl_7iRAdwtgXeATLQ2BTi7TWaChPF7P`
- Commit: `b8c9732aee4ec3e6e1848e586e4f8ff0c2ce3fdb`
- Function region: `iad1`; inbound edge: `hnd1`; Vercel firewall allowed.
- Upstream: `POST https://api.typesafe.ai/v1/systemone`, HTTP 403.
- Application response: HTTP 503, stored failure `evaluation_failed`.
- Stage metadata: state 536 bytes, questions 32,757 bytes, 20 questions; elapsed 108 ms.

Expanded Vercel `jev_batch_failed` and `assessment_stage_failed` records contained the TypeSafe wrapper, `provider_http_403`, status and stack fingerprint, but no original response body/message or provider request ID. The earlier `jev_call_failed` event was generated before SDK error parsing and serialized a generic Error. The historical body cannot be recovered from these logs or stored diagnostics. No request-level error log was found in the TypeSafe console's usage/home UI.

SDK 0.6.0 preserves `APIError.body`, `.message`, `.headers`, and `.requestId` (from `x-typesafe-request-id`). Our general error serializer intentionally omitted raw messages/bodies. No preserved ID does not prove the original response lacked a correlation header.

## Live experiments

Five physical requests, no retries, no production database writes. The local production credential was used without printing it. Its equality to the deployed credential was not independently verified. Calls traversed the Bangkok Cloudflare edge, unlike the original Vercel function in iad1; time, edge and possible credential differences remain uncontrolled.

| Case | Request size | Result | Input tokens |
| --- | --: | --- | --: |
| Reconstructed original first stage | state 536 + questions 32,757 bytes | 200, all 20 judgments returned | 7,155 |
| Synthetic state, 30,000 repeated words | 180,119 bytes | 200 | 30,273 |
| Synthetic state, 34,000 repeated words | 204,119 bytes | 400 `max_tokens_exceeded` | not returned |
| 70,000 words spread across 20 questions | 421,542 bytes | 400 `max_tokens_exceeded` | not returned |
| Tiny semantic input with 350,000 bytes trailing JSON whitespace | 350,124 bytes | 200 | 274 |

Both overflow cases produced SDK `BadRequestError`, with message `400 {"detail":{"error_type":"max_tokens_exceeded"}}` and the same parsed body shown above. The whitespace case demonstrates that a body more than ten times the original context's byte size can succeed; it does not establish the maximum HTTP body size.

### Correlation IDs for TypeSafe support

| Case (UTC) | TypeSafe request ID | Cloudflare ray |
| --- | --- | --- |
| Original reconstruction, 08:59 | `req_01a0dcf0c9997c9e831f31d26a678f55` | `a41112788e1e2db0-BKK` |
| 30k state, 09:04:33 | `req_01a0dcf5859779f8b8b221ced3396179` | `a4111a0e7ce92dcc-BKK` |
| 34k state, 09:04:34 | `req_01a0dcf588b2730da179e58cd0a72b96` | `a4111a139f1d2dcc-BKK` |
| 70k questions, 09:04:34 | `req_01a0dcf58a5f7566bd50044ba96f2d99` | `a4111a1618602dcc-BKK` |
| Whitespace, 09:04:35 | `req_01a0dcf58caa71b59cad6313cea72421` | `a4111a19ca1b2dcc-BKK` |

Ask TypeSafe to correlate the original UTC window/account/model `jev-1.13.0` and source region, explain possible 403 sources (API permission vs gateway/firewall), and compare with the successful reconstruction ID. These are investigation questions, not established causes. This report has not been sent.

## Reproduction artifacts and commands

Run from the repository root, with the selected environment's credentials available locally:

```sh
node --conditions=react-server --import tsx scripts/replay-provider-operation.ts --target production --operation fa6302d8-0329-47e8-a4df-2d88e29c8cd5 --send
node --conditions=react-server --import tsx scripts/probe-jev-context.ts --send
```

The first command reconstructs only the initial provider stage from the persisted base snapshot/action and makes one physical API call. It does not rerun the complete assessment or change progress. Omitting `--send` reconstructs without inference. The second sends four fixed synthetic probes without retries. These commands incur inference usage and should not run as tests or unattended pressure probes.

Private local artifacts (ignored by Git, restricted file permissions) contain outgoing JSON, response bodies and allowlisted headers:

- `work/diagnostics/fa6302d8-0329-47e8-a4df-2d88e29c8cd5/2026-09-26T08-59-19.749Z/`
- `work/diagnostics/jev-context/2026-09-26T09-04-32.960Z/`

Reconstructed wire request SHA-256: `d8a02d924a3696d7052c698861e97d4aca825a93144efcd59d7b693e39dc47c0`. This is the replay hash; no original wire hash was logged. Participant text is deliberately absent from this report. Review private artifacts before sharing.

## Recovery and diagnostics changes

The assessment UI now derives `provider_rejected` from the stored 403 failure and says: “Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.” Reload retains the notice and retry path. This UI work is committed separately as `8dc87370` and has not been deployed by this investigation.

New server transport logging retains bounded sanitized error previews, response correlation headers, request size/hash, timing, provider and status while preserving the original response for SDK parsing. It covers Jev, OpenAI journey generation, X OAuth/syndication fetches and resource-preview fetching. Persisted operation request keys now correlate engine/provider logs. It does not log successful response bodies or raw request payloads. Unit regressions exercise JSON 403, the observed context error, HTML responses, redaction, timeouts, transport exceptions and SDK interception.

Validation: `pnpm test` passed (68 files, 329 tests, formatting, lint, types, content, unused-code checks). `pnpm build:local` passed compilation and production-trace checks. `pnpm db:test:auth` passed mocked X callback and ownership recovery checks. No deployment performed.
