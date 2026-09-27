import type { SavedDebugOperation } from '@/lib/debug/trace-storage'
import type { Assessment } from '@/lib/assessment/schema'
import { presentResult } from '@/lib/assessment/present-result'

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
  // The JSON keeps the saved snapshot; the readable summary shows what the
  // participant sees, including render-time presentation upgrades.
  const shown = presentResult(result)
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
    `Status: ${shown.insufficient ? 'Insufficient evidence' : shown.provisional ? 'Provisional' : 'Supported projection'}${shown.capped ? ' · lifetime prompt cap reached' : ''}`,
    '',
    `Versions: ${JSON.stringify(shown.versions)}`,
    '',
    `Demonstrated reasoning: ${position(shown.vertical.value)}; interpretation range ${shown.vertical.range.map((v) => Math.round(v * 100)).join('–')}. Describes reasoning shown in the answers, not intelligence or viewpoint.`,
    '',
    '## Experimental worldview maps',
    '',
    `Doom–Bloom: ${position(shown.horizontal.value)}; interpretation range ${shown.horizontal.range.map((v) => Math.round(v * 100)).join('–')}.`,
    '',
    ...(['influence', 'transformation'] as const).map(
      (axis) =>
        `${axis === 'influence' ? 'Human influence' : 'Scale of transformation'}: ${position(shown.experiment?.[axis].value ?? null)}; ${shown.experiment?.[axis].interpretation ?? 'experimental'} interpretation; range ${(shown.experiment?.[axis].range ?? [0, 1]).map((v) => Math.round(v * 100)).join('–')}.`
    ),
    '',
    `${shown.experiment?.pdoom?.source === 'inferred' ? 'Inferred' : 'Stated'} P(doom): ${shown.experiment?.pdoom?.token ?? 'Not specified'}. ${shown.experiment?.pdoom?.publicStatement ? 'The estimate comes from the cited public statement, overriding the simulated assessment estimate.' : 'The estimate applies to the outcome, horizon and conditions described in your answers.'}`,
    ...(shown.experiment?.pdoom
      ? [
          ...(shown.experiment.pdoom.publicStatement
            ? [
                `Source: [${shown.experiment.pdoom.publicStatement.title}](${shown.experiment.pdoom.publicStatement.url}) (${shown.experiment.pdoom.publicStatement.publishedAt}).`,
                `Outcome: ${shown.experiment.pdoom.publicStatement.outcome}. Horizon: ${shown.experiment.pdoom.publicStatement.horizon}. Conditions: ${shown.experiment.pdoom.publicStatement.conditions}`,
                `Original assessment estimate: ${shown.experiment.pdoom.assessmentEstimate?.token ?? 'Not specified'}.`
              ]
            : []),
          ...(shown.experiment.pdoom.text
            ? [`> ${shown.experiment.pdoom.text}`]
            : []),
          `${shown.experiment.pdoom.answerNumber ? `Answer ${shown.experiment.pdoom.answerNumber}` : shown.experiment.pdoom.publicStatement ? 'Based on a sourced public statement' : 'Based on the full answer history'}.${shown.experiment.pdoom.source === 'inferred' ? ` Approximate interpretation range: ${shown.experiment.pdoom.bounds?.map((value) => Math.round(value * 100)).join('–')}%. Inferred from ${shown.experiment.pdoom.basis === 'contextual' ? 'broader worldview and priorities' : 'qualitative likelihood'}; not a stated percentage or statistical confidence interval.` : ''}`
        ]
      : []),
    '',
    '## Milestones and assumptions',
    '',
    ...(shown.experiment?.milestones.flatMap((m) => [
      `### ${m.label}`,
      '',
      `> ${m.evidence.text}`,
      '',
      `Answer ${m.evidence.answerNumber}.`,
      ''
    ]) ?? []),
    ...(shown.experiment?.hinges.flatMap((h) => [
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
    ...shown.components.flatMap((c) => [
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
    ...shown.fingerprint.flatMap((c) => [
      `### ${c.label}`,
      '',
      c.claim ?? 'Unassessed; no supported position is invented.',
      ''
    ]),
    '## Findings',
    '',
    ...shown.findings.flatMap((f) => [
      f.text,
      '',
      `Evidence: ${f.evidenceIds.join(', ')}`,
      ''
    ]),
    '## Resources',
    '',
    ...shown.resources.flatMap((r) => [
      `[${r.title}](${r.url}) — ${r.purpose}`,
      ''
    ]),
    '## Reference sources',
    '',
    ...shown.sources.flatMap((s) => [
      `### ${s.title}`,
      '',
      `${s.id} · ${s.status} · accessed ${s.accessed} · content ${shown.versions.content}`,
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
