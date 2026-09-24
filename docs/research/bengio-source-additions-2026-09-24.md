# Bengio source additions — September 24, 2026

Updated `scientist-ai-advocate` in `lib/journeys/foundational-public-personas.ts`.

- [Requested X post](https://x.com/yoshua_bengio/status/2102853542348501322): X’s public oEmbed endpoint verified the author, September 23 publication date and announcement of his UN Security Council address. The embed truncates the post; neither its unseen remainder nor its video was treated as inspected. The local Birdclaw archive was unavailable, and Bird lacked authentication.
- [Published transcript](https://www.policymagazine.ca/an-urgent-mission-for-humanity-yoshua-bengio-briefs-the-unsc-on-ai-security/): Policy Magazine identifies this as Bengio’s September 23 briefing transcript and publishes it under his byline. Read the complete speech from its opening through its closing thanks. This is a publisher-hosted speech text, not a timestamped transcript independently checked against the recording.
- [UN event confirmation](https://www.un.org/en/live-openai-and-anthropic-brief-security-council-amid-%E2%80%98real-and-imminent%E2%80%99-threat-posed-runaway-ai): corroborates his appearance and the event date. Used for provenance, not as a substitute transcript.

## Integration

The X entry links to the speech through the existing `transcriptUrl` field. A separate transcript source makes the full text discoverable in the public persona’s source list, which displays source URLs rather than transcript metadata. Both entries explicitly refer to one address.

The participant generator receives authored source summaries, not fetched transcript bodies (`lib/journeys/participant.ts`). The new dated summary and belief additions therefore incorporate the inspected speech into future generated answers without requiring runtime fetching or copying the full text into the repository. Existing technical sources remain available for subjects this address does not develop.

This updates the current authored brief and its source links. It does not regenerate the selected persistent simulation, change its historical source snapshot or assessment coordinates, establish independent verification of reported incidents, or confer editorial approval on corpus assets.

## Subsequent authorized regeneration

Regenerated locally on September 24 with `pnpm journeys:generate --persona=scientist-ai-advocate --turns=5`. The engine stopped automatically after three accepted answers at 84% readiness. The successful immutable simulation is now selected; the previous public simulation remains available.

| Placement (0–100)        | Before | After |
| ------------------------ | -----: | ----: |
| Doom → Bloom             |   35.5 |  39.5 |
| Scale of transformation  |   68.5 |  54.0 |
| Human influence          |   73.0 |  85.8 |
| Expected upside          |   67.3 |  67.7 |
| Expected harm            |   72.0 |  66.7 |
| Controllability          |   34.7 |  52.0 |
| Institutional competence |   44.7 |  57.7 |

Outlook retains its 25–50 interpretation range. Transformation widens from 50–75 to 8–100, so the lower point is poorly determined. Human influence narrows from 50–100 to 75–100. These are interpretation ranges, not statistical confidence intervals.

The old assessment used version 0.6.0 and four answers; the new one uses 0.6.1 and three answers. Both use Jev 1.13.0. Inferred P(doom) changes from approximately 19% to 10%, but its adjustment method also changes from shifted-sharpening-v2 to v3. Neither is a quoted Bengio probability. This is a rerun comparison, not a controlled estimate of the transcript’s effect.

- Before assessment: `11f16e9d-f459-41fc-8425-5d908f1efddd`
- After assessment: `1b2b8087-7813-42cc-8066-5efe12e5c39f`
- New run: `1790226142833-b50524bf-db59-405a-b83e-19ea64239cfc`
- Estimated inference cost: $0.0532.
- [Recorded placements and provenance](bengio-assessment-comparison-2026-09-24.json).

Verified the selected database pointer and both frozen results after generation. Local database only; cached persona HTML may lag until regeneration, while the new direct public assessment URL identifies the exact run.
