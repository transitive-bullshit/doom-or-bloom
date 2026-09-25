// Executed in a server-condition subprocess by the browser tests. Never saved
// into work/journeys and never backed by a network evaluator or participant.
import assert from 'node:assert/strict'
import { loadBundle } from '../../lib/content/loader'
import { createFixtureProvider, fixtureAnswer } from '../../lib/server/provider'
import { versions } from '../../lib/assessment/schema'
import { personas } from '../../lib/journeys/catalog'
import { fixedUserPersona } from '../../lib/journeys/fixed'
import { runPersona } from '../../lib/journeys/runner'
import { suiteSchema } from '../../lib/journeys/schema'
import type { Participant } from '../../lib/journeys/participant'

globalThis.fetch = async () => {
  throw new Error('Journey browser fixtures must not access the network')
}
const bundle = loadBundle()
const fixture = createFixtureProvider()
// Exercise the answer-snapshot path, using only the in-process mocked evaluator.
const evaluator = {
  kind: 'live' as const,
  async evaluate(...args: Parameters<typeof fixture.evaluate>) {
    const result = await fixture.evaluate(...args)
    for (const [id, question] of Object.entries(args[1])) {
      if (id === 'facet:outlook_orientation')
        result.answers[id] = fixtureAnswer(question, '2')
      if (id === 'facet:overall_outlook')
        result.answers[id] = fixtureAnswer(question, 'explicitly_unknown')
    }
    return { ...result, model: versions.model }
  }
}
const participant: Participant = {
  model: 'browser-fixture',
  async generate({ prompt }) {
    return {
      promptInstanceId: prompt.id,
      request: {
        model: 'browser-fixture',
        store: false,
        reasoning: { effort: 'none' },
        max_output_tokens: 100,
        instructions: 'Synthetic browser fixture; no provider request.',
        input: prompt.text
      },
      response: {
        id: `fixture-${prompt.id}`,
        model: 'browser-fixture',
        text: 'AI could help people, but its impacts depend on how it is used. I am uncertain about the balance.',
        usage: { input_tokens: 0, output_tokens: 0 }
      },
      elapsedMs: 0
    }
  }
}
const ids = [
  'control-alarmist',
  'worried-novice',
  'brief-job-worrier',
  'open-uncertainty',
  'playful-recovery'
]
const journeys = []
for (const id of ids) {
  const persona = personas.find((item) => item.id === id)!
  assert.ok(persona, `Missing browser persona ${id}`)
  journeys.push(await runPersona(persona, bundle, 2, evaluator, participant))
}
journeys.push(await runPersona(fixedUserPersona, bundle, 4, evaluator))
for (const journey of journeys) {
  assert.equal(journey.error, null, journey.personaId)
  assert.ok(journey.result, journey.personaId)
}
process.stdout.write(
  JSON.stringify(
    suiteSchema.parse({
      schemaVersion: 1,
      id: 'baseline',
      createdAt: '2026-09-26T00:00:00.000Z',
      mode: 'synthetic',
      authoring: 'Codex-authored fictional answer scripts',
      answerSnapshots: true,
      versions,
      inputHash: 'browser-fixture',
      engineHash: 'browser-fixture',
      contentHash: bundle.manifest.contentVersion,
      turns: 4,
      requestBudget: null,
      journeys
    })
  )
)
