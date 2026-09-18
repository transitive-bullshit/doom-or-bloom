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
  expect(input.background.beliefs).toEqual(context.persona.claims)
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
        model: 'gpt-5.4-mini',
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
  expect(JSON.stringify(journey)).not.toContain('fake-secret')
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
        model: 'gpt-5.4-mini',
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
        model: 'gpt-5.4-mini',
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
  const budget = liveJourneyBudget(0.01)
  budget.reserve('openai', 10_000, 0)
  expect(budget.report().reservedUsd).toBe(0.0075)
  expect(() => budget.reserve('openai', 10_000, 0)).toThrow('budget exhausted')
})
