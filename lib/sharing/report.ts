import type { Assessment } from '@/lib/assessment/schema'
export function serializeReport(state: Assessment) {
  if (!state.result) throw new Error('A result is required')
  const result = state.result
  const evidence = state.evidence.map((entry) => ({
    ...entry,
    excerpt:
      state.answers
        .find((a) => a.id === entry.answerId)
        ?.spans.find((s) => s.id === entry.spanId)?.text ?? ''
  }))
  const data = {
    versions: result.versions,
    result,
    coverage: state.coverage,
    unresolved: state.unresolved,
    answers: state.answers,
    evidence,
    referenceClaims: state.referenceClaims,
    familiarity: state.familiarity,
    judgments: state.judgments.filter((j) => j.stage !== 'route')
  }
  const position = (value: number | null) =>
    value === null
      ? 'Unplaced'
      : `${Math.round(value * 100)} / 100 (interpretation coordinate)`
  const markdown = [
    `# Doom or Bloom — full report`,
    '',
    'Experimental assessment of the reasoning and expectations demonstrated in your answers. Not a psychological measurement or a P(doom) calculator.',
    '',
    `Status: ${result.insufficient ? 'Insufficient evidence' : result.provisional ? 'Provisional' : 'Supported projection'}${result.capped ? ' · lifetime prompt cap reached' : ''}`,
    '',
    `Versions: ${JSON.stringify(result.versions)}`,
    '',
    '## Map',
    '',
    `Doom–Bloom: ${position(result.horizontal.value)}; interpretation range ${result.horizontal.range.map((v) => Math.round(v * 100)).join('–')}.`,
    '',
    `Demonstrated reasoning: ${position(result.vertical.value)}; interpretation range ${result.vertical.range.map((v) => Math.round(v * 100)).join('–')}.`,
    '',
    'Ranges reflect authored qualitative categories, missing evidence and ambiguity; they are not calibrated confidence intervals.',
    '',
    '## Profile',
    '',
    ...result.components.flatMap((c) => [
      `### ${c.label}`,
      '',
      c.claim ?? 'Unassessed',
      '',
      `Position: ${position(c.value)}. Interpretation range: ${c.range.map((v) => Math.round(v * 100)).join('–')}. Coverage: ${state.coverage[c.vector as keyof typeof state.coverage] ?? 'Separate fingerprint component'}.`,
      '',
      ...c.evidenceIds.flatMap((id) => {
        const entry = evidence.find((e) => e.id === id)
        return entry
          ? [
              `> ${entry.excerpt.replaceAll('\n', '\n> ')}`,
              '',
              `Evidence: ${id}; ${entry.status}.`,
              ''
            ]
          : []
      }),
      ''
    ]),
    '## Fingerprint and expressed forecast context',
    '',
    ...result.fingerprint.flatMap((c) => [
      `### ${c.label}`,
      '',
      c.claim ?? 'Unassessed; no supported position is invented.',
      ''
    ]),
    ...state.answers.flatMap((a) =>
      ['horizonSpanId', 'convictionSpanId', 'assumptionSpanId'].flatMap(
        (key) => {
          const span = a.spans.find(
            (s) =>
              s.id === a.context?.[key as keyof NonNullable<typeof a.context>]
          )
          const label =
            key === 'horizonSpanId'
              ? 'Expressed horizon'
              : key === 'convictionSpanId'
                ? 'Participant conviction'
                : 'Expressed assumption'
          return span
            ? [
                `${label} (${a.id}):`,
                '',
                `> ${span.text.replaceAll('\n', '\n> ')}`,
                ''
              ]
            : []
        }
      )
    ),
    '## Findings',
    '',
    ...result.findings.flatMap((f) => [
      f.text,
      '',
      `Evidence: ${f.evidenceIds.join(', ')}`,
      ''
    ]),
    '## Resources',
    '',
    ...result.resources.flatMap((r) => [
      `[${r.title}](${r.url}) — ${r.purpose}`,
      ''
    ]),
    '## Reference sources',
    '',
    ...result.sources.flatMap((s) => [
      `### ${s.title}`,
      '',
      `${s.id} · ${s.status} · accessed ${s.accessed} · content ${result.versions.content}`,
      '',
      ...s.urls.map((url, i) => `[Primary source ${i + 1}](${url})`),
      ''
    ]),
    '## Evidence and typed judgments',
    '',
    'The structured appendix preserves raw usable answers, exact evidence, relevant typed judgments and provenance. Rejected interaction text, secrets, debug traces and hidden reasoning are excluded.',
    '',
    '```json',
    JSON.stringify(data, null, 2),
    '```',
    '',
    '## Methodology',
    '',
    'The horizontal projection separates material benefits, adverse effects and valued agency/continuity. Action posture has no map weight. The vertical projection uses equally weighted demonstrated-reasoning components. Missing evidence widens interpretation ranges. Editorial framing and rubric choices can introduce bias, including the name’s emphasis on doom and bloom.',
    ''
  ].join('\n')
  return { markdown, json: JSON.stringify(data, null, 2) }
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
