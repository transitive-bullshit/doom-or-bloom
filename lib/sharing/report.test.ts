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
    spans: [{ id: 's', start: 0, end: text.length, text }],
    context: {
      horizonSpanId: null,
      convictionSpanId: null,
      assumptionSpanId: 's'
    }
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
  for (const artifact of [report.markdown, report.json]) {
    expect(artifact).toContain(text)
    expect(artifact).not.toContain('PRIVATE_DRAFT_CANARY')
    expect(artifact).not.toContain('PRIVATE_REJECTED_CANARY')
    expect(artifact).not.toContain('interactionHistory')
  }
  expect(report.markdown).toContain('Expressed assumption')
  expect(JSON.parse(report.json).versions).toEqual(state.versions)
})
