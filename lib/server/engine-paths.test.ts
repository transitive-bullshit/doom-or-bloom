import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { assessmentSchema, limits } from '@/lib/assessment/schema'
import { createAssessment, currentPrompt } from '@/lib/assessment/state'
import { runAssessment } from './engine'
import { createFixtureProvider, fixtureAnswer } from './provider'
import type { Provider } from './provider'

test('eight answered prompts preserve the full transcript and bound reference grounding', async () => {
  const bundle = loadBundle()
  const references = bundle.references.filter(
    (reference) =>
      reference.kind === 'publication' && reference.id.endsWith('-2026')
  )
  expect(references.length).toBeGreaterThanOrEqual(17)
  const fixture = createFixtureProvider()
  let mentioned = new Set<string>()
  const provider: Provider = {
    kind: 'fixture',
    evaluate: async (...args) => {
      const result = await fixture.evaluate(...args)
      const questions = args[1]
      for (const [id, question] of Object.entries(questions))
        if (question.type === 'choice' && 'mentioned' in question.criteria)
          result.answers[id] = fixtureAnswer(
            question,
            mentioned.has(id) ? 'mentioned' : 'none'
          )
      return result
    }
  }
  let state = createAssessment('eight-reference-path')
  const groundedIds = new Set<string>()
  for (let i = 0; i < 8; i++) {
    const prompt = currentPrompt(state)
    expect(prompt.ordinal).toBe(i + 1)
    const invoked = references.slice(i * 2, i * 2 + 2)
    if (i === 0) invoked.push(references[16]!)
    mentioned = new Set(invoked.map((reference) => reference.id))
    const text =
      `Answer ${i + 1}: I am weighing ${invoked.map((reference) => reference.aliases[0]).join('; ')}.\n` +
      `This is my distinct raw answer ${i + 1}, with uncertainty about transfer to deployment.\n`.repeat(
        12
      ) +
      `Complete final sentence ${i + 1}.`
    const result = await runAssessment(
      {
        requestId: `eight-reference-${i}`,
        assessment: state,
        operation: { type: 'answer', text },
        debug: true
      },
      provider,
      bundle,
      true
    )
    state = result.assessment
    const answer = state.answers.at(-1)!
    expect(answer.text).toBe(text)
    expect(answer.promptText).toBe(prompt.text)
    const identity = result.debug!.stages.find(
      (stage) => stage.name === 'B1: identify references'
    )!
    const identityCandidates = (
      identity.state as {
        candidates: {
          id: string
          kind: string
          date: string
          related: string[]
        }[]
      }
    ).candidates
    expect(identityCandidates.length).toBeLessThanOrEqual(
      limits.referenceCandidates
    )
    for (const candidate of identityCandidates) {
      const reference = bundle.references.find((r) => r.id === candidate.id)!
      expect(candidate.kind).toBe(reference.kind)
      expect(candidate.date).toBe(reference.date)
      expect(candidate.related).toEqual(reference.related)
      expect(candidate).not.toHaveProperty('summary')
    }
    const grounding = result.debug!.stages.find(
      (stage) => stage.name === 'B2: grounded claims'
    )!
    expect(grounding).toBeDefined()
    const summaries = (
      grounding.state as {
        canonicalSummaries: { id: string; summary: string }[]
      }
    ).canonicalSummaries
    expect(summaries).toHaveLength(limits.resolvedReferences)
    const claims = state.referenceClaims.filter(
      (claim) => claim.answerId === answer.id
    )
    expect(claims.map((claim) => claim.referenceId)).toEqual(
      summaries.map((summary) => summary.id)
    )
    for (const summary of summaries) {
      expect(mentioned.has(summary.id)).toBe(true)
      const reference = bundle.references.find(
        (reference) => reference.id === summary.id
      )!
      expect(summary).toEqual({
        id: reference.id,
        title: reference.title,
        kind: reference.kind,
        date: reference.date,
        related: reference.related,
        summary: reference.summary
      })
      groundedIds.add(summary.id)
    }
    expect(state.unresolved).toContainEqual(
      expect.objectContaining({
        id: `${state.answers[0]!.id}:reference`,
        kind: 'reference'
      })
    )
    for (const stage of result.debug!.stages)
      expect(Object.keys(stage.questions).length).toBeLessThanOrEqual(
        limits.questions
      )
    expect(
      result.debug!.stages.reduce((sum, stage) => sum + stage.attempts, 0)
    ).toBeLessThanOrEqual(limits.providerAttempts)
    expect(assessmentSchema.safeParse(state).success).toBe(true)
  }
  expect(state.answers).toHaveLength(8)
  expect(state.referenceClaims).toHaveLength(16)
  expect(groundedIds.size).toBe(16)
  const result = await runAssessment(
    {
      requestId: 'eight-reference-result',
      assessment: state,
      operation: { type: 'project' },
      debug: true
    },
    provider,
    bundle,
    true
  )
  const projection = result.debug!.stages.find((stage) =>
    stage.name.startsWith('D:')
  )!
  expect(projection).toBeDefined()
  expect(projection.state).toEqual(
    expect.objectContaining({
      completeParticipantEvidence: state.answers.map((answer, i) => ({
        id: `a${i}`,
        prompt: answer.promptText,
        answer: answer.text,
        correctionTarget: null
      })),
      referenceContext: bundle.references
        .filter((reference) => groundedIds.has(reference.id))
        .map((reference, i) => ({
          id: `r${i}`,
          canonicalId: reference.id,
          title: reference.title,
          kind: reference.kind,
          date: reference.date,
          related: reference.related,
          summary: reference.summary
        }))
    })
  )
  expect(result.assessment.result?.insufficient).toBe(false)
  expect(result.assessment.result?.evidenceRevision).toBe(
    state.evidenceRevision
  )
})

test('twelve sequential usable answers force a final result and stop further inference', async () => {
  const bundle = loadBundle()
  const fixture = createFixtureProvider()
  let calls = 0
  const provider: Provider = {
    kind: 'fixture',
    evaluate: async (...args) => {
      calls++
      return fixture.evaluate(...args)
    }
  }
  let state = createAssessment('sequential-cap')
  for (let i = 0; i < limits.prompts; i++) {
    expect(currentPrompt(state).ordinal).toBe(i + 1)
    state = (
      await runAssessment(
        {
          requestId: `sequential-cap-${i}`,
          assessment: state,
          operation: {
            type: 'answer',
            text: `Synthetic accepted answer ${i + 1}: useful tools and uncertain transitions.`
          },
          debug: false
        },
        provider,
        bundle
      )
    ).assessment
  }
  expect(state.answers).toHaveLength(limits.prompts)
  expect(state.prompts).toHaveLength(limits.prompts)
  expect(state.status).toBe('capped')
  expect(state.result?.capped).toBe(true)
  expect(state.result?.insufficient).toBe(false)
  const before = calls
  await expect(
    runAssessment(
      {
        requestId: 'past-sequential-cap',
        assessment: state,
        operation: { type: 'continue' },
        debug: false
      },
      provider,
      bundle
    )
  ).rejects.toThrow('Restart')
  expect(calls).toBe(before)
  expect(assessmentSchema.safeParse(state).success).toBe(true)
})

for (const contentVersion of ['0.2.0-draft', '0.3.0-draft']) {
  test(`saved ${contentVersion} assessment resumes with its own corpus and result version`, async () => {
    const bundle = loadBundle(contentVersion)
    const provider = createFixtureProvider()
    let state = createAssessment('pinned-corpus')
    state.versions.content = contentVersion
    for (let i = 0; i < 3; i++)
      state = (
        await runAssessment(
          {
            requestId: `pinned-corpus-${i}`,
            assessment: state,
            operation: {
              type: 'answer',
              text: `Preserved earlier-version answer ${i}.`
            },
            debug: false
          },
          provider,
          loadBundle(state.versions.content)
        )
      ).assessment
    state = (
      await runAssessment(
        {
          requestId: 'pinned-corpus-result',
          assessment: state,
          operation: { type: 'project' },
          debug: false
        },
        provider,
        bundle
      )
    ).assessment
    expect(state.versions.content).toBe(contentVersion)
    expect(state.result?.versions.content).toBe(contentVersion)
    expect(state.answers[0]?.text).toBe('Preserved earlier-version answer 0.')
    expect(state.result?.insufficient).toBe(false)
  })
}
