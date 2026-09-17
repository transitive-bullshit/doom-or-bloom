import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment, currentPrompt } from '@/lib/assessment/state'
import { createFixtureProvider, fixtureAnswer } from './provider'
import type { Provider } from './provider'
import { runAssessment } from './engine'
import type { Assessment, Operation } from '@/lib/assessment/schema'
let request = 0
async function advance(
  state: Assessment,
  operation: Operation,
  provider = createFixtureProvider()
) {
  return (
    await runAssessment(
      {
        assessment: state,
        operation,
        requestId: `correction-${++request}`,
        debug: true
      },
      provider,
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

test('catastrophic-risk correction names the selected claim and retains ordinary-harm evidence', async () => {
  let state = createAssessment('catastrophe-correction')
  for (let i = 0; i < 3; i++)
    state = await advance(state, {
      type: 'answer',
      text: 'I expect job disruption and concentration, with a separate concern about irreversible loss of control.'
    })
  state = await advance(state, { type: 'project' })
  const before = structuredClone(state)
  const ordinaryRisk = before.result!.components.find(
    (component) => component.vector === 'risk_landscape'
  )!
  const catastrophe = before.result!.components.find(
    (component) => component.vector === 'catastrophic_risk'
  )!
  state = await advance(state, {
    type: 'clarify',
    vector: 'risk_landscape',
    claim: 'catastrophic_risk'
  })
  expect(currentPrompt(state).text).toContain(catastrophe.claim)
  expect(currentPrompt(state).claimTarget).toBe('catastrophic_risk')
  expect(currentPrompt(state).sourceEvidenceIds).toEqual(
    catastrophe.evidenceIds
  )
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    evaluate: async (input, questions, signal) => {
      const result = await fixture.evaluate(input, questions, signal)
      if (questions['catastrophic_risk:score'])
        result.answers['catastrophic_risk:score'] = fixtureAnswer(
          questions['catastrophic_risk:score'],
          undefined,
          0
        )
      return result
    }
  }
  state = await advance(
    state,
    {
      type: 'answer',
      text: 'I meant ordinary disruption is likely; catastrophic loss of control seems remote over the next decade.'
    },
    provider
  )
  expect(state.answers.slice(0, 3)).toEqual(before.answers)
  expect(state.answers.at(-1)?.correctionClaimTarget).toBe('catastrophic_risk')
  expect(
    state.evidence.filter((entry) =>
      before.evidence.some((old) => old.id === entry.id)
    )
  ).toEqual(before.evidence)
  expect(
    state.result!.components.find(
      (component) => component.vector === 'risk_landscape'
    )
  ).toEqual(ordinaryRisk)
  const corrected = state.result!.components.find(
    (component) => component.vector === 'catastrophic_risk'
  )!
  expect(corrected.value).toBe(0)
  expect(
    corrected.evidenceIds.every((id) =>
      state.evidence.some(
        (entry) =>
          entry.id === id && entry.answerId === state.answers.at(-1)?.id
      )
    )
  ).toBe(true)
  await expect(
    advance(state, {
      type: 'clarify',
      vector: 'technical_controllability',
      claim: 'catastrophic_risk'
    })
  ).rejects.toThrow('scope')
})
