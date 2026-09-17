import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment, currentPrompt } from '@/lib/assessment/state'
import { createFixtureProvider } from './provider'
import { runAssessment } from './engine'
import type { Assessment, Operation } from '@/lib/assessment/schema'
let request = 0
async function advance(state: Assessment, operation: Operation) {
  return (
    await runAssessment(
      {
        assessment: state,
        operation,
        requestId: `correction-${++request}`,
        debug: true
      },
      createFixtureProvider(),
      loadBundle(),
      true
    )
  ).assessment
}
test('correction retains raw evidence, supersedes its target, and recomputes dependent result', async () => {
  let state = createAssessment('correction')
  for (let i = 0; i < 3; i++)
    state = await advance(state, {
      type: 'answer',
      text: `A relevant synthetic view ${i}.`
    })
  state = await advance(state, { type: 'project' })
  const before = structuredClone(state)
  const target = 'technical_controllability'
  const originalOther = before.evidence.filter((e) => e.vector !== target)
  const originalIds = before.evidence
    .filter((e) => e.vector === target)
    .map((e) => e.id)
  state = await advance(state, { type: 'clarify', vector: target })
  expect(currentPrompt(state).target).toBe(target)
  state = await advance(state, {
    type: 'answer',
    text: 'I meant current tests are limited, rather than control being impossible.'
  })
  expect(state.answers.slice(0, 3)).toEqual(before.answers)
  expect(
    state.evidence
      .filter((e) => originalIds.includes(e.id))
      .every((e) => e.status === 'superseded')
  ).toBe(true)
  expect(
    state.evidence.filter((e) => originalOther.some((old) => old.id === e.id))
  ).toEqual(originalOther)
  expect(state.result?.evidenceRevision).toBe(before.evidenceRevision + 1)
  expect(state.status).toBe('results')
  const projected = state.result?.components.find((c) => c.vector === target)
  expect(projected?.evidenceIds.some((id) => originalIds.includes(id))).toBe(
    false
  )
})
