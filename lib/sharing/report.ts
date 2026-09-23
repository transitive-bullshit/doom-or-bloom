import type { SavedDebugOperation } from '@/lib/debug/trace-storage'
import type { Assessment } from '@/lib/assessment/schema'

export function serializeReport(
  state: Assessment,
  operations: SavedDebugOperation[] = []
) {
  if (!state.result) throw new Error('A result is required')
  const result = state.result
  const evidence = state.evidence
  const data = {
    reportVersion: 2,
    assessmentId: state.id,
    revision: state.revision,
    evidenceRevision: state.evidenceRevision,
    status: state.status,
    prompts: state.prompts,
    attempts: state.attempts,
    diagnosticTrace: {
      completeness: Array.from({ length: state.revision }, (_, i) => i).every(
        (i) =>
          operations.some((o) => o.assessment && o.trace.baseRevision === i)
      )
        ? 'complete'
        : 'partial',
      expectedCompletedOperations: state.revision,
      recordedCompletedOperations: operations.filter((o) => o.assessment)
        .length,
      missingBaseRevisions: Array.from(
        { length: state.revision },
        (_, i) => i
      ).filter(
        (i) =>
          !operations.some((o) => o.assessment && o.trace.baseRevision === i)
      ),
      note: 'Trace capture is local. Missing revisions can mean an older run, storage failure or whole-operation eviction. Failed operations are included when recorded; a disconnected request may lack server diagnostics. No hidden reasoning, credentials or unsubmitted drafts are included.',
      operations: operations.map((entry) => {
        const saved = { ...entry }
        if (entry.assessment)
          saved.assessment = {
            ...entry.assessment,
            draft: '',
            interactionHistory: []
          }
        return saved
      })
    },
    versions: result.versions,
    result,
    coverage: state.coverage,
    unresolved: state.unresolved,
    answers: state.answers,
    evidence,
    referenceClaims: state.referenceClaims,
    familiarity: state.familiarity,
    judgments: state.judgments
  }
  const position = (value: number | null) =>
    value === null
      ? 'Unplaced'
      : `${Math.round(value * 100)} / 100 (interpretation coordinate)`
  const interview = [
    '# Interview',
    '',
    ...state.answers.flatMap((answer, index) => [
      `## Question ${index + 1}) ${answer.promptText}`,
      '',
      answer.text,
      ''
    ])
  ].join('\n')
  const markdown = [
    `# Doom or Bloom — assessment`,
    '',
    'Experimental interpretation of the expectations and reasoning expressed in your answers. P(doom) describes your stated or inferred belief, not an independent prediction of AI catastrophe.',
    '',
    `Status: ${result.insufficient ? 'Insufficient evidence' : result.provisional ? 'Provisional' : 'Supported projection'}${result.capped ? ' · lifetime prompt cap reached' : ''}`,
    '',
    `Versions: ${JSON.stringify(result.versions)}`,
    '',
    `Demonstrated reasoning: ${position(result.vertical.value)}; interpretation range ${result.vertical.range.map((v) => Math.round(v * 100)).join('–')}. Describes reasoning shown in the answers, not intelligence or viewpoint.`,
    '',
    '## Experimental worldview maps',
    '',
    `Doom–Bloom: ${position(result.horizontal.value)}; interpretation range ${result.horizontal.range.map((v) => Math.round(v * 100)).join('–')}.`,
    '',
    ...(['influence', 'transformation'] as const).map(
      (axis) =>
        `${axis === 'influence' ? 'Human influence' : 'Scale of transformation'}: ${position(result.experiment?.[axis].value ?? null)}; ${result.experiment?.[axis].interpretation ?? 'experimental'} interpretation; range ${(result.experiment?.[axis].range ?? [0, 1]).map((v) => Math.round(v * 100)).join('–')}.`
    ),
    '',
    `${result.experiment?.pdoom?.source === 'inferred' ? 'Inferred' : 'Stated'} P(doom): ${result.experiment?.pdoom?.token ?? 'Not specified'}. ${result.experiment?.pdoom?.publicStatement ? 'The estimate comes from the cited public statement, overriding the simulated assessment estimate.' : 'The estimate applies to the outcome, horizon and conditions described in your answers.'}`,
    ...(result.experiment?.pdoom
      ? [
          ...(result.experiment.pdoom.publicStatement
            ? [
                `Source: [${result.experiment.pdoom.publicStatement.title}](${result.experiment.pdoom.publicStatement.url}) (${result.experiment.pdoom.publicStatement.publishedAt}).`,
                `Outcome: ${result.experiment.pdoom.publicStatement.outcome}. Horizon: ${result.experiment.pdoom.publicStatement.horizon}. Conditions: ${result.experiment.pdoom.publicStatement.conditions}`,
                `Original assessment estimate: ${result.experiment.pdoom.assessmentEstimate?.token ?? 'Not specified'}.`
              ]
            : []),
          ...(result.experiment.pdoom.text
            ? [`> ${result.experiment.pdoom.text}`]
            : []),
          `${result.experiment.pdoom.answerNumber ? `Answer ${result.experiment.pdoom.answerNumber}` : result.experiment.pdoom.publicStatement ? 'Based on a sourced public statement' : 'Based on the full answer history'}.${result.experiment.pdoom.source === 'inferred' ? ` Approximate interpretation range: ${result.experiment.pdoom.bounds?.map((value) => Math.round(value * 100)).join('–')}%. Inferred from ${result.experiment.pdoom.basis === 'contextual' ? 'broader worldview and priorities' : 'qualitative likelihood'}; not a stated percentage or statistical confidence interval.` : ''}`
        ]
      : []),
    '',
    '## Milestones and assumptions',
    '',
    ...(result.experiment?.milestones.flatMap((m) => [
      `### ${m.label}`,
      '',
      `> ${m.evidence.text}`,
      '',
      `Answer ${m.evidence.answerNumber}.`,
      ''
    ]) ?? []),
    ...(result.experiment?.hinges.flatMap((h) => [
      `### ${h.label}`,
      '',
      `> ${h.evidence.text}`,
      '',
      `Answer ${h.evidence.answerNumber}. ${h.question}`,
      ''
    ]) ?? []),
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
      `Supporting answer IDs: ${Array.from(new Set(evidence.filter((entry) => c.evidenceIds.includes(entry.id)).map((entry) => entry.answerId))).join(', ') || 'None'}. Support refers to whole answers, not selected passages.`,
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
    '## Methodology',
    '',
    'The horizontal projection summarizes expressed outlook from concern to hope. A mixed, conditional or undecided orientation can be understood and placed without inventing a net-impact forecast. The separately recorded overall expected impact can remain explicitly unknown. The middle orientation is not a forecast that benefits and harms cancel. Development pace, deployment rules and access preferences are separate and have no map weight. The vertical map projection interprets expected scale of societal transformation. Human influence over AI outcomes and demonstrated reasoning are shown on separate single axes and preserved with its components in the structured evidence. Unsettled map points mark the center of an unresolved range, not moderate beliefs. Missing evidence widens interpretation ranges. Editorial framing and rubric choices can introduce bias, including the name’s emphasis on doom and bloom.',
    ''
  ].join('\n')
  return { markdown, interview, json: JSON.stringify(data, null, 2) }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
