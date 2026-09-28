import { expect, test } from 'vitest'
import { createHash } from 'node:crypto'
import { fixedUserAnswers, fixedUserPersona } from './fixed'
import { loadBundle } from '@/lib/content/loader'
import { runPersona } from './runner'
import { personas } from './catalog'
import { createFixtureProvider } from '@/lib/server/provider'

test('fixed original answers are never generated or matched to a different routed question', async () => {
  const fixture = createFixtureProvider()
  const journey = await runPersona(fixedUserPersona, loadBundle(), 1, {
    kind: 'live',
    async evaluate(...args) {
      return { ...(await fixture.evaluate(...args)), model: 'jev-1.13.0' }
    }
  })
  expect(journey.error).toBeNull()
  expect(journey.accepted).toBe(4)
  expect(journey.participantExchanges).toBeUndefined()
  expect(journey.steps.map((s) => s.answer)).toEqual(
    fixedUserAnswers.map((a) => a.answer)
  )
  expect(journey.steps.map((s) => s.prompt.text)).toEqual(
    fixedUserAnswers.map((a) => a.question)
  )
  expect(
    journey.steps.every(
      (s) =>
        s.result &&
        s.trace?.decisions.some((d) => d.action === 'fixed transcript replay')
    )
  ).toBe(true)
  expect(
    createHash('sha256')
      .update(fixedUserAnswers.map((a) => a.answer).join('\n'))
      .digest('hex')
  ).toBe('bfef53afc2d61f19e34b51fb6ffe84af80efb1c0a2a24c2effe18811fa9dc0e6')
})

test('a recorded transcript replays for any simulated user, without a recovery prelude', async () => {
  const fixture = createFixtureProvider()
  const persona = personas.find((p) => p.id === 'playful-recovery')!
  const transcript = fixedUserAnswers.slice(0, 2)
  const journey = await runPersona(
    persona,
    loadBundle(),
    transcript.length,
    {
      kind: 'live',
      async evaluate(...args) {
        return { ...(await fixture.evaluate(...args)), model: 'jev-1.13.0' }
      }
    },
    undefined,
    false,
    undefined,
    undefined,
    transcript
  )
  expect(journey.error).toBeNull()
  expect(journey.personaId).toBe(persona.id)
  // The persona's recovery prelude ("test", "test again") is not replayed.
  expect(journey.steps.map((s) => s.answer)).toEqual(
    transcript.map((a) => a.answer)
  )
  expect(journey.steps.map((s) => s.prompt.text)).toEqual(
    transcript.map((a) => a.question)
  )
})
