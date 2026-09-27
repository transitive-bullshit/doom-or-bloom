import { expect, test } from 'vitest'
import { autoStopFloor } from '@/lib/assessment/readiness'
import { loadBundle } from '@/lib/content/loader'
import { createFixtureProvider } from '@/lib/server/provider'
import type { Provider } from '@/lib/server/provider'
import { runInterview } from './interview'
import { participantTurnRequest } from './participant'
import type { ParticipantTurn } from './participant'
import { findPersona } from './personas'

// Fixture judgments place the map after one answer and find no worthwhile
// follow-up, so only the engine's answer floor delays automatic results. A
// reply of "hmm" is judged ambiguous. No network is involved.
const fixture = createFixtureProvider()
const provider: Provider = {
  kind: 'fixture',
  async evaluate(state, questions, ...rest) {
    const result = await fixture.evaluate(state, questions, ...rest)
    for (const id of Object.keys(questions))
      if (id.endsWith(':novelty'))
        result.answers[id] = { type: 'noul', noul: 0.02 }
    const current = (state as { current?: { answer: string } }).current
    if (current?.answer === 'hmm')
      result.answers.disposition = {
        type: 'choice',
        choice: 'needs_clarification',
        confidence: 1,
        probabilities: Object.fromEntries(
          Object.keys(
            questions.disposition!.type === 'choice'
              ? questions.disposition!.criteria
              : {}
          ).map((key) => [key, key === 'needs_clarification' ? 1 : 0])
        )
      }
    return result
  }
}
const bundle = loadBundle()
const interview = (
  options: Partial<Parameters<typeof runInterview>[0]> = {},
  reply = (turn: ParticipantTurn) =>
    `answer ${turn.history.length + 1}: mostly worried about jobs`
) => {
  const turns: ParticipantTurn[] = []
  return {
    turns,
    run: runInterview({
      id: 'benchmark-fixture',
      persona: findPersona('casual-unsure'),
      style: 'terse',
      bundle,
      provider,
      answer: async (turn) => {
        turns.push(turn)
        return reply(turn)
      },
      maxAnswers: 12,
      ...options
    })
  }
}

test('an interview stops at the automatic result and records what each answer could show', async () => {
  const { run, turns } = interview()
  const result = await run
  expect(result).toMatchObject({
    firstReadyAt: 1,
    autoStopAt: autoStopFloor,
    stopReason: 'automatic result'
  })
  expect(result.steps.map((step) => step.shownFrom)).toEqual([
    ...Array(autoStopFloor - 1).fill('inspection'),
    'automatic'
  ])
  expect(result.steps.every((step) => step.accepted && step.shown)).toBe(true)
  expect(result.steps[0]!.promptId).toBe('root')
  // The participant sees only its accepted history, in its benchmark style.
  expect(turns.map((turn) => turn.history.length)).toEqual([0, 1, 2, 3])
  expect(turns.every((turn) => turn.style === 'terse')).toBe(true)
})

test('an interview can continue past results up to its answer limit, without inspections', async () => {
  const result = await interview({
    maxAnswers: autoStopFloor + 2,
    continueAfterResult: true,
    inspect: false
  }).run
  expect(result.steps).toHaveLength(autoStopFloor + 2)
  expect(result.autoStopAt).toBe(autoStopFloor)
  expect(result.stopReason).toBe('answer limit')
  expect(result.steps[0]!.shown).toBeNull()
  expect(result.steps[autoStopFloor - 1]!.shownFrom).toBe('automatic')
})

test('an ambiguous reply is re-asked with the clarification the app would show', async () => {
  const { run, turns } = interview({ maxAnswers: 1 }, (turn) =>
    turn.recoveryGuidance ? 'jobs mostly' : 'hmm'
  )
  const result = await run
  expect(result.steps[0]!.replies).toEqual([
    { text: 'hmm', disposition: 'needs_clarification' },
    { text: 'jobs mostly', disposition: 'usable' }
  ])
  expect(turns[1]!.recoveryGuidance).toBe(
    bundle.prompts.find((p) => p.id === 'root')!.recoveryVariants.clarification
  )
  expect(result.stopReason).toBe('answer limit')
})

test('the terse style extends the shared participant instructions', () => {
  const turn: ParticipantTurn = {
    persona: findPersona('frontier-pacer'),
    style: 'terse',
    prompt: {
      id: 'p1',
      text: 'What do you think AI means for our future—and why?'
    },
    history: [],
    recoveryGuidance: null
  }
  const terse = participantTurnRequest(turn)
  const brief = participantTurnRequest({ ...turn, style: 'brief' })
  expect(terse.instructions).toContain('- terse: like a hurried person')
  expect(terse.instructions.replace(/- terse: [^\n]*\n/, '')).toBe(
    brief.instructions
  )
  expect(JSON.parse(terse.input).background.responseStyle).toBe('terse')
  expect(JSON.parse(brief.input).background.responseStyle).toBe('brief')
  expect(
    JSON.parse(participantTurnRequest({ ...turn, style: 'detailed' }).input)
      .background.responseStyle
  ).toBe('detailed')
})
