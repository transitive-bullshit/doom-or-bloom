import { expect, test } from 'vitest'
import { createOpenAIParticipant, participantRequest } from './participant'
import { liveJourneyBudget } from './live-budget'
import { personas } from './catalog'
import { runPersona } from './runner'
import { loadBundle } from '@/lib/content/loader'
import { createFixtureProvider } from '@/lib/server/provider'
import { versions } from '@/lib/assessment/schema'

const context = {
  persona: personas[0]!,
  prompt: {
    id: 'p1',
    text: 'What do you think AI means for our future—and why?'
  },
  history: [],
  recoveryGuidance: null
}
test('participant sees character beliefs and actual conversation, never fixture judgments', () => {
  const request = participantRequest(context)
  const input = JSON.parse(request.input)
  expect(input.currentQuestion).toBe(context.prompt.text)
  expect(input.background.beliefs).toEqual(context.persona.beliefs)
  expect(input.background.sources).toEqual(context.persona.sources)
  expect(input.background.voice).toEqual(context.persona.voice)
  expect(input.background.responseStyle).toBe('detailed')
  expect(request.model).toBe('gpt-5.6-sol')
  for (const key of [
    'levels',
    'openingVectors',
    'concern',
    'coverage',
    'readiness',
    'rubric'
  ])
    expect(request.input).not.toContain(`"${key}"`)
  expect(request).toMatchObject({ store: false, reasoning: { effort: 'none' } })
})

test('OpenAI text is submitted unchanged through real engine routing; both transcripts are retained', async () => {
  const budget = liveJourneyBudget()
  const requests: ReturnType<typeof participantRequest>[] = []
  const participant = createOpenAIParticipant({
    apiKey: 'fake-secret',
    budget,
    maxRequests: 2,
    fetcher: async (_url, init) => {
      requests.push(JSON.parse(init!.body as string))
      return Response.json({
        id: `response-${requests.length}`,
        model: 'gpt-5.6-sol',
        status: 'completed',
        output: [
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text: `Generated answer ${requests.length}.`
              }
            ]
          }
        ],
        usage: { input_tokens: 100, output_tokens: 20 }
      })
    }
  })
  const fixture = createFixtureProvider()
  const seen: unknown[] = []
  const journey = await runPersona(
    personas[0]!,
    loadBundle(),
    2,
    {
      kind: 'live',
      evaluate: async (...args) => {
        seen.push(args[0])
        return { ...(await fixture.evaluate(...args)), model: versions.model }
      }
    },
    participant
  )
  expect(journey.error).toBeNull()
  expect(journey.steps.every((step) => step.operation === 'answer')).toBe(true)
  expect(journey.steps.every((step) => step.resultState)).toBe(true)
  expect(
    journey.steps.filter((s) => s.operation === 'answer').map((s) => s.answer)
  ).toEqual(['Generated answer 1.', 'Generated answer 2.'])
  const second = JSON.parse(requests[1]!.input)
  expect(second.currentQuestion).toBe(journey.steps[0]!.nextPrompt!.text)
  expect(second.conversation).toEqual([
    { question: context.prompt.text, answer: 'Generated answer 1.' }
  ])
  expect(JSON.stringify(seen)).not.toContain('control-alarmist')
  expect(JSON.stringify(seen)).not.toContain('openingVectors')
  expect(JSON.stringify(seen)).not.toContain('responseStyle')
  expect(JSON.stringify(journey)).not.toContain('fake-secret')
  expect(journey.steps).toHaveLength(2)
  expect(journey.steps.map((step) => step.result?.evidenceRevision)).toEqual([
    1, 2
  ])
  expect(
    journey.steps[0]!.resultState!.completeParticipantEvidence
  ).toHaveLength(1)
  expect(
    journey.steps[1]!.resultState!.completeParticipantEvidence
  ).toHaveLength(2)
  expect(journey.steps[0]!.trace!.stages.map((stage) => stage.name)).toEqual([
    'A: interpret',
    'D: projection',
    'D: result evidence',
    'C: route'
  ])
  expect(journey.result).toEqual(journey.steps[1]!.result)
  expect(journey.participantExchanges).toHaveLength(2)
  expect(journey.personaSnapshot).not.toHaveProperty('levels')
  expect(journey.personaSnapshot).not.toHaveProperty('openingVectors')
  expect(budget.report().usage.openai.requests).toBe(2)
  await expect(participant.generate(context)).rejects.toThrow('request budget')
})

test('Jev failure preserves the paid participant reply without substituting scripted judgments', async () => {
  const participant = createOpenAIParticipant({
    apiKey: 'fake-secret',
    budget: liveJourneyBudget(),
    maxRequests: 1,
    fetcher: async () =>
      Response.json({
        id: 'response',
        model: 'gpt-5.6-sol',
        status: 'completed',
        output: [
          {
            type: 'message',
            content: [{ type: 'output_text', text: 'A real generated reply.' }]
          }
        ],
        usage: { input_tokens: 100, output_tokens: 20 }
      })
  })
  const journey = await runPersona(
    personas[0]!,
    loadBundle(),
    1,
    {
      kind: 'live',
      evaluate: async () => {
        throw new Error('sensitive-provider-body')
      }
    },
    participant
  )
  expect(journey.accepted).toBe(0)
  expect(journey.result).toBeNull()
  expect(journey.pendingAnswer).toBe('A real generated reply.')
  expect(journey.participantExchanges).toHaveLength(1)
  expect(JSON.stringify(journey)).not.toContain('sensitive-provider-body')
  const fixture = createFixtureProvider()
  const resumed = await runPersona(
    personas[0]!,
    loadBundle(),
    1,
    {
      kind: 'live',
      async evaluate(...args) {
        return { ...(await fixture.evaluate(...args)), model: versions.model }
      }
    },
    undefined,
    false,
    journey
  )
  expect(resumed.error).toBeNull()
  expect(resumed.accepted).toBe(1)
  expect(resumed.steps[0]?.answer).toBe('A real generated reply.')
  expect(resumed.pendingAnswer).toBeNull()
  expect(resumed.participantExchanges).toEqual(journey.participantExchanges)
})

test('failed and incomplete OpenAI responses never become participant answers', async () => {
  for (const response of [
    () => new Response('private error body', { status: 429 }),
    () =>
      Response.json({
        id: 'response',
        model: 'gpt-5.6-sol',
        status: 'incomplete',
        output: [],
        usage: { input_tokens: 100, output_tokens: 900 }
      })
  ]) {
    const participant = createOpenAIParticipant({
      apiKey: 'fake',
      budget: liveJourneyBudget(),
      maxRequests: 1,
      fetcher: async () => response()
    })
    await expect(participant.generate(context)).rejects.toThrow(
      /failed|incomplete/
    )
  }
})

test('unknown cost remains reserved and prevents overspending', () => {
  const budget = liveJourneyBudget(0.05)
  budget.reserve('openai', 10_000, 0)
  expect(budget.report().reservedUsd).toBe(0.04)
  expect(() => budget.reserve('openai', 10_000, 0)).toThrow('budget exhausted')
})

test('a failed shared interpretation resumes the saved answer without generating another participant reply', async () => {
  const fixture = createFixtureProvider()
  const evaluator = {
    kind: 'live' as const,
    async evaluate(...args: Parameters<typeof fixture.evaluate>) {
      return { ...(await fixture.evaluate(...args)), model: versions.model }
    }
  }
  const participant = {
    model: 'test-participant',
    async generate(
      input: Parameters<import('./participant').Participant['generate']>[0]
    ) {
      return {
        promptInstanceId: input.prompt.id,
        request: participantRequest(input),
        response: {
          id: 'reply',
          model: 'test-participant',
          text: 'My answer stays accepted.',
          usage: { input_tokens: 0, output_tokens: 0 }
        },
        elapsedMs: 0
      }
    }
  }
  const journey = await runPersona(
    personas[0]!,
    loadBundle(),
    1,
    {
      ...evaluator,
      async evaluate(...args) {
        if (Object.keys(args[1]).some((key) => key.endsWith(':score')))
          throw new Error('projection failure')
        return evaluator.evaluate(...args)
      }
    },
    participant
  )
  expect(journey.accepted).toBe(0)
  expect(journey.steps).toHaveLength(0)
  expect(journey.failedOperation?.operation.type).toBe('answer')
  const resumed = await runPersona(
    personas[0]!,
    loadBundle(),
    1,
    evaluator,
    undefined,
    false,
    journey
  )
  expect(resumed.error).toBeNull()
  expect(resumed.accepted).toBe(1)
  expect(resumed.steps).toHaveLength(1)
  expect(resumed.steps[0]!.result?.evidenceRevision).toBe(1)
  expect(resumed.steps[0]!.resultUnavailable).toBeUndefined()
})

test('response detail is per persona and never leaks into the evaluator', () => {
  for (const id of ['brief-pragmatist', 'brief-job-worrier']) {
    const persona = personas.find((item) => item.id === id)!
    const request = participantRequest({ ...context, persona })
    expect(JSON.parse(request.input).background.responseStyle).toBe('brief')
  }
  const novice = personas.find((item) => item.id === 'worried-novice')!
  expect(
    JSON.parse(participantRequest({ ...context, persona: novice }).input)
      .background.responseStyle
  ).toBe('conversational')
})
