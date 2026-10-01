import type { Translator } from '@/i18n/translator'
import type { SavedDebugOperation } from '@/lib/debug/trace-storage'
import type { Assessment } from '@/lib/assessment/schema'
import {
  claimText,
  componentLabel,
  hingeLabel,
  hingeQuestion,
  milestoneLabel,
  promptText
} from '@/lib/assessment/display-text'
import { pdoomTokenLabel, presentResult } from '@/lib/assessment/present-result'

/** The report download; its readable files use the active locale. */
export function serializeReport(
  t: Translator,
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
  // participant sees, including render-time presentation upgrades, in the
  // active locale. Answers, authored text and identifiers stay as saved.
  const shown = presentResult(result)
  const position = (value: number | null) =>
    value === null
      ? t('Report.unplaced')
      : t('Report.position', { value: Math.round(value * 100) })
  const range = (bounds: [number, number]) =>
    bounds.map((v) => Math.round(v * 100)).join('–')
  const interview = [
    `# ${t('Report.interviewTitle')}`,
    '',
    ...state.answers.flatMap((answer, index) => {
      const prompt = state.prompts.find(
        (item) => item.id === answer.promptInstanceId
      )
      return [
        `## ${t('Report.question', {
          number: index + 1,
          text: prompt
            ? promptText(t, { ...prompt, text: answer.promptText })
            : answer.promptText
        })}`,
        '',
        answer.text,
        ''
      ]
    })
  ].join('\n')
  const pdoom = shown.experiment?.pdoom
  const status = shown.insufficient
    ? 'insufficient'
    : shown.provisional
      ? 'provisional'
      : 'supported'
  const markdown = [
    `# ${t('Report.title')}`,
    '',
    t('Report.intro'),
    '',
    shown.capped
      ? t('Report.statusCapped', { status })
      : t('Report.status', { status }),
    '',
    t('Report.versions', { versions: JSON.stringify(shown.versions) }),
    '',
    t('Report.reasoning', {
      position: position(shown.vertical.value),
      range: range(shown.vertical.range)
    }),
    '',
    `## ${t('Report.mapsTitle')}`,
    '',
    t('Report.outlook', {
      position: position(shown.horizontal.value),
      range: range(shown.horizontal.range)
    }),
    '',
    ...(['influence', 'transformation'] as const).map((axis) =>
      t('Report.axis', {
        label: t(`Claims.labels.${axis}`),
        position: position(shown.experiment?.[axis].value ?? null),
        interpretation:
          shown.experiment?.[axis].interpretation ?? 'experimental',
        range: range(shown.experiment?.[axis].range ?? [0, 1])
      })
    ),
    '',
    `${t('Report.pdoom', {
      source: pdoom?.source === 'inferred' ? 'inferred' : 'stated',
      token: pdoom?.token
        ? pdoomTokenLabel(t, pdoom.token)
        : t('Report.notSpecified')
    })} ${pdoom?.publicStatement ? t('Report.pdoomPublic') : t('Report.pdoomScope')}`,
    ...(pdoom
      ? [
          ...(pdoom.publicStatement
            ? [
                t('Report.source', {
                  title: pdoom.publicStatement.title,
                  url: pdoom.publicStatement.url,
                  date: pdoom.publicStatement.publishedAt
                }),
                t('Report.statement', {
                  outcome: pdoom.publicStatement.outcome,
                  horizon: pdoom.publicStatement.horizon,
                  conditions: pdoom.publicStatement.conditions
                }),
                t('Report.originalEstimate', {
                  token: pdoom.assessmentEstimate?.token
                    ? pdoomTokenLabel(t, pdoom.assessmentEstimate.token)
                    : t('Report.notSpecified')
                })
              ]
            : []),
          ...(pdoom.text ? [`> ${pdoom.text}`] : []),
          [
            pdoom.answerNumber
              ? t('Report.basisAnswer', { number: pdoom.answerNumber })
              : pdoom.publicStatement
                ? t('Report.basisPublic')
                : t('Report.basisHistory'),
            ...(pdoom.source === 'inferred'
              ? [
                  t('Report.inferredRange', {
                    range:
                      pdoom.bounds
                        ?.map((value) => Math.round(value * 100))
                        .join('–') ?? '',
                    basis:
                      pdoom.basis === 'contextual' ? 'contextual' : 'direct'
                  })
                ]
              : [])
          ].join(' ')
        ]
      : []),
    '',
    `## ${t('Report.milestonesTitle')}`,
    '',
    ...(shown.experiment?.milestones.flatMap((m) => [
      `### ${milestoneLabel(t, m)}`,
      '',
      `> ${m.evidence.text}`,
      '',
      t('Report.answer', { number: m.evidence.answerNumber }),
      ''
    ]) ?? []),
    ...(shown.experiment?.hinges.flatMap((h) => [
      `### ${hingeLabel(t, h)}`,
      '',
      `> ${h.evidence.text}`,
      '',
      `${t('Report.answer', { number: h.evidence.answerNumber })} ${hingeQuestion(t, h)}`,
      ''
    ]) ?? []),
    '',
    t('Report.rangesNote'),
    '',
    `## ${t('Report.profileTitle')}`,
    '',
    ...shown.components.flatMap((c) => [
      `### ${componentLabel(t, c)}`,
      '',
      c.claim ? claimText(t, c.claim, c.vector) : t('Report.unassessed'),
      '',
      t('Report.componentPosition', {
        position: position(c.value),
        range: range(c.range),
        coverage:
          state.coverage[c.vector as keyof typeof state.coverage] ?? 'separate'
      }),
      '',
      t('Report.supportingAnswers', {
        ids:
          Array.from(
            new Set(
              evidence
                .filter((entry) => c.evidenceIds.includes(entry.id))
                .map((entry) => entry.answerId)
            )
          ).join(', ') || t('Report.none')
      }),
      ''
    ]),
    `## ${t('Report.fingerprintTitle')}`,
    '',
    ...shown.fingerprint.flatMap((c) => [
      `### ${componentLabel(t, c)}`,
      '',
      c.claim
        ? claimText(t, c.claim, c.vector)
        : t('Report.fingerprintUnassessed'),
      ''
    ]),
    `## ${t('Report.findingsTitle')}`,
    '',
    ...shown.findings.flatMap((f) => [
      f.text,
      '',
      t('Report.evidence', { ids: f.evidenceIds.join(', ') }),
      ''
    ]),
    `## ${t('Report.resourcesTitle')}`,
    '',
    ...shown.resources.flatMap((r) => [
      `[${r.title}](${r.url}) — ${r.purpose}`,
      ''
    ]),
    `## ${t('Report.sourcesTitle')}`,
    '',
    ...shown.sources.flatMap((s) => [
      `### ${s.title}`,
      '',
      t('Report.sourceMeta', {
        id: s.id,
        status: s.status,
        accessed: s.accessed,
        version: shown.versions.content
      }),
      '',
      ...s.urls.map(
        (url, i) => `[${t('Report.primarySource', { number: i + 1 })}](${url})`
      ),
      ''
    ]),
    `## ${t('Report.methodologyTitle')}`,
    '',
    t('Report.methodology'),
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
