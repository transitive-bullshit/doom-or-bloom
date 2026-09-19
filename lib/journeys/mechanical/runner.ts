import { loadBundle } from '@/lib/content/loader'
import type { Bundle } from '@/lib/content/loader'
import type { Provider } from '@/lib/server/provider'
import { versions } from '@/lib/assessment/schema'
import type { Persona } from '../catalog'
import { journeyHashes, runPersona } from '../runner'
import { suiteSchema } from '../schema'
import type { Journey } from '../schema'
import type { Participant } from '../participant'
import { mechanicalCases, replyForPrompt } from './cases'
import type { MechanicalCase } from './schema'
import { scriptedProvider } from './provider'

export async function runMechanicalCase(
  testCase: MechanicalCase,
  bundle: Bundle,
  turns = 5,
  evaluator?: Provider,
  participant?: Participant,
  exerciseResults = false,
  resume?: Journey
) {
  const persona: Persona = {
    id: testCase.id,
    name: testCase.name,
    proxy: testCase.proxy,
    description: testCase.description,
    concern: testCase.concern,
    sources: testCase.sources,
    familiarity: testCase.familiarity,
    background: testCase.opening,
    beliefs: Object.values(testCase.claims)
  }
  const scripted = scriptedProvider(testCase, bundle)
  return runPersona(
    persona,
    bundle,
    turns,
    evaluator,
    participant,
    exerciseResults,
    resume,
    {
      provider: scripted.provider,
      snapshot: testCase,
      prelude: testCase.recoveryPrelude,
      reply(prompt) {
        const reply = replyForPrompt(testCase, prompt)
        scripted.setReply(reply)
        return reply
      }
    }
  )
}

export async function runMechanicalSuite({
  id,
  personaId,
  turns = 5
}: {
  id: string
  personaId?: string
  turns?: number
}) {
  const bundle = loadBundle()
  const selected = personaId
    ? mechanicalCases.filter((c) => c.id === personaId)
    : mechanicalCases
  if (!selected.length) throw new Error('Unknown mechanical case')
  const journeys = []
  for (const testCase of selected)
    journeys.push(await runMechanicalCase(testCase, bundle, turns))
  return suiteSchema.parse({
    schemaVersion: 1,
    id,
    createdAt: new Date().toISOString(),
    mode: 'synthetic',
    authoring: 'Codex-authored fictional answer scripts',
    versions: { ...versions, model: 'persona-script-v1' },
    ...journeyHashes(bundle, mechanicalCases, true),
    turns,
    requestBudget: null,
    journeys
  })
}
