import { expect, test } from 'vitest'
import { createAssessment } from '@/lib/assessment/state'
import { baseResult, emptyComponent } from '@/lib/assessment/projections'
import { loadBundle } from '@/lib/content/loader'
import { serializeReport } from './report'

test('expanded reports preserve usable evidence while excluding local rejected text, drafts and retry records', () => {
  const state = createAssessment('report')
  state.draft = 'PRIVATE_DRAFT_CANARY'
  state.interactionHistory.push({
    requestId: 'rejected',
    promptInstanceId: state.prompts[0]!.id,
    text: 'PRIVATE_REJECTED_CANARY',
    disposition: 'non_answer'
  })
  const text = 'My exact usable answer with a conditional benefit.'
  state.answers.push({
    id: 'a',
    promptInstanceId: state.prompts[0]!.id,
    promptText: state.prompts[0]!.text,
    text,
    substantive: true,
    hasHorizon: false,
    hasConviction: false
  })
  state.result = baseResult(
    state,
    [
      {
        ...emptyComponent('beneficial_potential', 'Benefits'),
        value: 0.7,
        range: [0.5, 1]
      }
    ],
    loadBundle().rubric,
    false
  )
  const report = serializeReport(state)
  for (const artifact of [report.interview, report.json]) {
    expect(artifact).toContain(text)
    expect(artifact).not.toContain('PRIVATE_DRAFT_CANARY')
    expect(artifact).not.toContain('PRIVATE_REJECTED_CANARY')
    expect(artifact).not.toContain('interactionHistory')
  }
  expect(report.interview).toContain(`## Question 1) ${state.prompts[0]!.text}`)
  expect(report.markdown).not.toContain('```json')
  expect(report.markdown).not.toContain(text)
  expect(JSON.parse(report.json).versions).toEqual(state.versions)
})

test('diagnostic reports retain routes, exact evaluator input, snapshots and explicit gaps', () => {
  const state = createAssessment('diagnostic-report')
  state.revision = 2
  state.result = baseResult(state, [], loadBundle().rubric)
  const operation = {
    trace: {
      requestId: 'first',
      baseRevision: 0,
      stages: [],
      decisions: [
        {
          action: 'routing priorities and tie-break by ID',
          detail: [
            {
              id: 'crux.general',
              intendedDistinction: 'A possible belief-changing observation',
              novelty: 0.8
            }
          ]
        }
      ],
      elapsedMs: 10
    },
    operation: { type: 'answer' as const, text: 'Exact submitted answer' },
    assessment: { ...state, revision: 1, draft: '', interactionHistory: [] },
    createdAt: '2026-09-20T00:00:00.000Z',
    provider: 'live' as const
  }
  const partial = JSON.parse(serializeReport(state, [operation]).json)
  expect(partial.diagnosticTrace.completeness).toBe('partial')
  expect(partial.diagnosticTrace.missingBaseRevisions).toEqual([1])
  expect(partial.diagnosticTrace.operations[0].assessment.result).toEqual(
    state.result
  )
  expect(
    partial.diagnosticTrace.operations[0].trace.decisions[0].detail[0]
      .intendedDistinction
  ).toContain('belief-changing')
  const failed = {
    ...operation,
    assessment: undefined,
    error: 'Evaluation failed',
    trace: { ...operation.trace, requestId: 'failed', baseRevision: 1 }
  }
  const last = {
    ...operation,
    trace: { ...operation.trace, requestId: 'last', baseRevision: 1 },
    assessment: { ...operation.assessment, revision: 2 }
  }
  const complete = JSON.parse(
    serializeReport(state, [operation, failed, last]).json
  )
  expect(complete.diagnosticTrace.completeness).toBe('complete')
  expect(complete.diagnosticTrace.operations[1].error).toBe('Evaluation failed')
})
