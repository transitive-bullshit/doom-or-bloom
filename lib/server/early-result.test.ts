import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment } from '@/lib/assessment/state'
import { createFixtureProvider, fixtureAnswer } from './provider'
import type { Provider } from './provider'
import { runAssessment } from './engine'

test('a detailed first answer can finish automatically and voluntary exploration still issues a follow-up', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(state, questions) {
      const result = await fixture.evaluate(state, questions)
      for (const id of Object.keys(questions))
        if (id.endsWith(':novelty'))
          result.answers[id] = { type: 'noul', noul: 0.02 }
      return result
    }
  }
  const bundle = loadBundle()
  const response = await runAssessment(
    {
      assessment: createAssessment('early-complete'),
      requestId: 'first-answer',
      debug: true,
      operation: {
        type: 'answer',
        text: 'Useful AI is likely, with uneven gains and serious risks. My forecast depends on effective oversight.'
      }
    },
    provider,
    bundle,
    true
  )
  expect(response.assessment.answers).toHaveLength(1)
  expect(response.assessment.status).toBe('results')
  expect(response.assessment.result).not.toBeNull()
  expect(response.assessment.prompts).toHaveLength(1)
  const route = response.debug!.stages.find(
    (stage) => stage.name === 'C: route'
  )!
  expect(
    Object.keys(route.questions).some(
      (id) => id.endsWith(':ambiguity') || id.endsWith(':tension')
    )
  ).toBe(false)
  const continued = await runAssessment(
    {
      assessment: response.assessment,
      requestId: 'voluntary-follow-up',
      debug: false,
      operation: { type: 'continue' }
    },
    provider,
    bundle
  )
  expect(continued.assessment.status).toBe('answering')
  expect(continued.assessment.prompts).toHaveLength(2)
  expect(continued.assessment.answers).toHaveLength(1)
})

test('an incomplete short account is not stopped solely because no candidate clears the novelty threshold', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(state, questions) {
      const result = await fixture.evaluate(state, questions)
      for (const [id, question] of Object.entries(questions)) {
        if (id.endsWith(':novelty'))
          result.answers[id] = { type: 'noul', noul: 0.02 }
        if (id.endsWith(':status') && question.type === 'choice')
          result.answers[id] = {
            type: 'choice',
            choice: 'not_expressed',
            confidence: 1,
            probabilities: Object.fromEntries(
              Object.keys(question.criteria).map((key) => [
                key,
                key === 'not_expressed' ? 1 : 0
              ])
            )
          }
      }
      return result
    }
  }
  const response = await runAssessment(
    {
      assessment: createAssessment('brief-opening'),
      requestId: 'brief-answer',
      debug: false,
      operation: { type: 'answer', text: 'Probably useful.' }
    },
    provider,
    loadBundle()
  )
  expect(response.assessment.status).toBe('answering')
  expect(response.assessment.result?.insufficient).toBe(true)
})

test('an independent pair check can reject a preliminary tension signal', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(state, questions) {
      const result = await fixture.evaluate(state, questions)
      if (questions.tension_present)
        result.answers.tension_present = { type: 'noul', noul: 0.92 }
      for (const id of Object.keys(questions))
        if (id.endsWith(':novelty'))
          result.answers[id] = { type: 'noul', noul: 0.02 }
      return result
    }
  }
  const response = await runAssessment(
    {
      assessment: createAssessment('conflicting-control'),
      requestId: 'conflicting-answer',
      debug: true,
      operation: {
        type: 'answer',
        text: 'The labs fully control every AI action, but nobody controls those same AI actions.'
      }
    },
    provider,
    loadBundle(),
    true
  )
  expect(response.assessment.status).toBe('results')
  expect(response.assessment.unresolved).toEqual([])
  expect(
    response.debug!.stages.find((stage) => stage.name === 'D: projection')!
      .state
  ).toHaveProperty('unresolved', [])
  expect(
    response.debug!.decisions.some(
      (decision) =>
        decision.action === 'tension pair check rejected apparent conflict'
    )
  ).toBe(true)
})

for (const acrossAnswers of [false, true])
  test(`scoped tension clarification quotes actual ${acrossAnswers ? 'cross-answer' : 'within-answer'} claims and accepts a reply`, async () => {
    const fixture = createFixtureProvider()
    let interpretation = 0
    const provider: Provider = {
      kind: 'fixture',
      async evaluate(input, questions) {
        const result = await fixture.evaluate(input, questions)
        if (questions.tension_present) {
          interpretation++
          result.answers.tension_present = {
            type: 'noul',
            noul: interpretation === (acrossAnswers ? 2 : 1) ? 0.95 : 0
          }
        }
        if (questions.tension_pair?.type === 'choice') {
          const keys = Object.keys(questions.tension_pair.criteria)
          const selected = keys.find((key) => key !== 'none')!
          result.answers.tension_pair = {
            type: 'choice',
            choice: selected,
            confidence: 1,
            probabilities: Object.fromEntries(
              keys.map((key) => [key, key === selected ? 1 : 0])
            )
          }
        }
        return result
      }
    }
    const bundle = loadBundle()
    let state = createAssessment(`quoted-${acrossAnswers}`)
    const texts = acrossAnswers
      ? [
          'Nobody can control what AI does.',
          'The labs control everything AI does.'
        ]
      : [
          'Nobody can control what AI does. The labs control everything AI does.'
        ]
    for (const [index, text] of texts.entries())
      state = (
        await runAssessment(
          {
            assessment: state,
            requestId: `a-${index}`,
            operation: { type: 'answer', text },
            debug: false
          },
          provider,
          bundle
        )
      ).assessment
    const prompt = state.prompts.at(-1)!
    expect(prompt.variant).toBe('tension')
    expect(prompt.text).toContain('Nobody can control what AI does.')
    expect(prompt.text).toContain('The labs control everything AI does.')
    expect(prompt.target).toBeUndefined()
    const clarified = await runAssessment(
      {
        assessment: state,
        requestId: 'clarify',
        operation: {
          type: 'answer',
          text: 'I meant that labs choose where to deploy AI, but cannot reliably control every action after deployment.'
        },
        debug: false
      },
      provider,
      bundle
    )
    expect(
      clarified.assessment.answers.at(-1)?.correctionTarget
    ).toBeUndefined()
    expect(clarified.assessment.answers).toHaveLength(texts.length + 1)
    const tampered = structuredClone(state)
    tampered.prompts.at(-1)!.quotedClaims![0]!.text =
      'Invented participant claim'
    await expect(
      runAssessment(
        {
          assessment: tampered,
          requestId: 'tampered',
          operation: { type: 'answer', text: 'No.' },
          debug: false
        },
        provider,
        bundle
      )
    ).rejects.toThrow('Invalid tension clarification')
  })

test('doubling down preserves an unresolved tension without repeating its clarification', async () => {
  const fixture = createFixtureProvider()
  const provider: Provider = {
    kind: 'fixture',
    async evaluate(...args) {
      const result = await fixture.evaluate(...args)
      for (const [id, question] of Object.entries(args[1])) {
        if (id === 'tension_present')
          result.answers[id] = { type: 'noul', noul: 0.95 }
        if (id.endsWith(':novelty'))
          result.answers[id] = { type: 'noul', noul: 0 }
        if (id.endsWith(':resolved'))
          result.answers[id] = { type: 'noul', noul: 0 }
        if (id === 'tension_pair' && question.type === 'choice') {
          const keys = Object.keys(question.criteria)
          const selected = keys.find((key) => key !== 'none') ?? 'none'
          result.answers[id] = {
            type: 'choice',
            choice: selected,
            confidence: 1,
            probabilities: Object.fromEntries(
              keys.map((key) => [key, key === selected ? 1 : 0])
            )
          }
        }
      }
      return result
    }
  }
  const bundle = loadBundle()
  const opening = await runAssessment(
    {
      assessment: createAssessment('no-clarification-loop'),
      requestId: 'first',
      operation: {
        type: 'answer',
        text: 'Nobody controls AI. The labs control every AI action.'
      },
      debug: false
    },
    provider,
    bundle
  )
  expect(opening.assessment.prompts.at(-1)?.variant).toBe('tension')
  const reply = await runAssessment(
    {
      assessment: opening.assessment,
      requestId: 'doubled-down',
      operation: {
        type: 'answer',
        text: 'Both are true. Nobody controls AI. The labs control every AI action.'
      },
      debug: false
    },
    provider,
    bundle
  )
  expect(reply.assessment.status).toBe('results')
  expect(reply.assessment.prompts).toHaveLength(2)
  expect(
    reply.assessment.unresolved.some((issue) => issue.kind === 'tension')
  ).toBe(true)
})

function unresolvedOutlookProvider(
  position: 'not_expressed' | 'explicitly_unknown' | 'tentative' | 'ambiguous'
): Provider {
  const fixture = createFixtureProvider()
  return {
    kind: 'fixture',
    async evaluate(state, questions) {
      const result = await fixture.evaluate(state, questions)
      for (const [id, question] of Object.entries(questions)) {
        if (id.endsWith(':novelty'))
          result.answers[id] = { type: 'noul', noul: 0.02 }
        if (id === 'facet:overall_outlook' && question.type === 'choice')
          result.answers[id] = {
            type: 'choice',
            choice:
              position === 'tentative'
                ? '3'
                : position === 'ambiguous'
                  ? 'explicitly_unknown'
                  : position,
            confidence: position === 'tentative' ? 0.75 : 1,
            probabilities: Object.fromEntries(
              Object.keys(question.criteria).map((key) => [
                key,
                position === 'tentative'
                  ? ((
                      {
                        '3': 0.75,
                        not_expressed: 0.1,
                        explicitly_unknown: 0.15
                      } as Record<string, number>
                    )[key] ?? 0)
                  : position === 'ambiguous'
                    ? ((
                        {
                          '3': 0.22,
                          not_expressed: 0.25,
                          explicitly_unknown: 0.53
                        } as Record<string, number>
                      )[key] ?? 0)
                    : Number(key === position)
              ])
            )
          }
      }
      return result
    }
  }
}

test.each([
  ['not_expressed', 'answering', 2, 'impact.overall'],
  ['tentative', 'answering', 2, 'impact.overall'],
  ['ambiguous', 'answering', 2, 'impact.overall'],
  ['explicitly_unknown', 'results', 1, 'root']
] as const)(
  'outlook %s distinguishes missing information from indecision despite low novelty',
  async (position, status, count, promptId) => {
    const first = await runAssessment(
      {
        assessment: createAssessment(`outlook-${position}`),
        requestId: 'opening',
        debug: true,
        operation: {
          type: 'answer',
          text: 'Large benefits and serious harms are possible.'
        }
      },
      unresolvedOutlookProvider(position),
      loadBundle(),
      true
    )
    expect(first.assessment.result?.horizontal.value).toBe(
      position === 'tentative' ? 0.75 : null
    )
    expect(first.assessment.status).toBe(status)
    expect(first.assessment.prompts).toHaveLength(count)
    expect(first.assessment.prompts.at(-1)?.promptId).toBe(promptId)
  }
)

test('the direct overall question cannot repeat until a directional answer appears', async () => {
  const provider = unresolvedOutlookProvider('not_expressed')
  const first = await runAssessment(
    {
      assessment: createAssessment('bounded-outlook'),
      requestId: 'opening',
      debug: false,
      operation: {
        type: 'answer',
        text: 'Large benefits and serious harms are possible.'
      }
    },
    provider,
    loadBundle()
  )
  const second = await runAssessment(
    {
      assessment: first.assessment,
      requestId: 'still-unplaced',
      debug: false,
      operation: {
        type: 'answer',
        text: 'I cannot give you an overall forecast.'
      }
    },
    provider,
    loadBundle()
  )
  expect(second.assessment.result?.horizontal.value).toBeNull()
  expect(second.assessment.status).toBe('results')
  expect(second.assessment.prompts).toHaveLength(2)
})

test.each([true, false])(
  'a borderline novel crux is useful only when updateability is unassessed: %s',
  async (missing) => {
    const fixture = createFixtureProvider()
    const provider: Provider = {
      kind: 'fixture',
      async evaluate(state, questions) {
        const result = await fixture.evaluate(state, questions)
        for (const [id, question] of Object.entries(questions)) {
          if (id.endsWith(':novelty'))
            result.answers[id] = {
              type: 'noul',
              noul: id === 'crux.general:novelty' ? 0.58 : 0.02
            }
          if (
            id === 'updateability:status' &&
            missing &&
            question.type === 'choice'
          )
            result.answers[id] = {
              type: 'choice',
              choice: 'not_expressed',
              confidence: 1,
              probabilities: Object.fromEntries(
                Object.keys(question.criteria).map((key) => [
                  key,
                  Number(key === 'not_expressed')
                ])
              )
            }
          if (id === 'updateability:score' && !missing)
            result.answers[id] = fixtureAnswer(question, undefined, 0)
        }
        return result
      }
    }
    const response = await runAssessment(
      {
        assessment: createAssessment(`crux-${missing}`),
        requestId: 'opening',
        debug: true,
        operation: {
          type: 'answer',
          text: 'I expect serious harm, because I think powerful systems cannot be controlled.'
        }
      },
      provider,
      loadBundle(),
      true
    )
    expect(response.assessment.status).toBe(missing ? 'answering' : 'results')
    expect(response.assessment.prompts.at(-1)?.promptId).toBe(
      missing ? 'crux.general' : 'root'
    )
  }
)
