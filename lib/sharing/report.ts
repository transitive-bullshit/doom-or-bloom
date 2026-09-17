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
      `Position: ${position(c.value)}. Evidence: ${c.evidenceIds.join(', ') || 'None'}.`,
      ''
    ]),
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
