import { expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { loadBundle } from '@/lib/content/loader'
import { mechanicalCases as personas, replyForPrompt } from './cases'
import { runMechanicalCase as runPersona } from './runner'
import { compareJourneys, suiteSchema, journeySchema } from '../schema'
import { scriptedProvider } from './provider'
import { createFixtureProvider } from '@/lib/server/provider'
import type { Provider } from '@/lib/server/provider'
import { versions } from '@/lib/assessment/schema'

const bundle = loadBundle()
const baseline = suiteSchema.parse(
  JSON.parse(
    readFileSync('eval/development/mechanical-journey-baseline.json', 'utf8')
  )
)

test('result exercises record early projection, continuation, and an answered scoped correction', async () => {
  const journey = await runPersona(
    personas[0]!,
    bundle,
    5,
    undefined,
    undefined,
    true
  )
  expect(journey.error).toBeNull()
  expect(journey.accepted).toBe(5)
  expect(journey.steps.slice(0, 3).map((s) => s.operation)).toEqual([
    'answer',
    'project',
    'continue'
  ])
  const correctionIndex = journey.steps.findIndex(
    (s) => s.operation === 'clarify'
  )
  expect(correctionIndex).toBeGreaterThan(2)
  const answer = journey.steps[correctionIndex + 1]!
  expect(answer.operation).toBe('answer')
  expect(answer.prompt.family).toBe('clarification')
  expect(answer.prompt.target).toBeDefined()
  expect(answer.result?.evidenceRevision).toBe(journey.result?.evidenceRevision)
  expect(journey.steps[1]?.result?.evidenceRevision).toBeLessThan(
    journey.result!.evidenceRevision
  )
  expect(journey.steps.at(-1)?.operation).toBe('answer')
})
test('ten distinct personas have bounded question-specific scripts for every current prompt', () => {
  expect(personas).toHaveLength(10)
  expect(new Set(personas.map((p) => p.id)).size).toBe(10)
  expect(new Set(personas.map((p) => p.opening)).size).toBe(10)
  for (const persona of personas)
    for (const prompt of bundle.prompts) {
      const reply = replyForPrompt(persona, prompt)
      expect(reply.text.length).toBeGreaterThan(30)
      expect(reply.text.length).toBeLessThanOrEqual(20_000)
      expect(reply.disposition).toBe('usable')
    }
})

for (const persona of personas)
  test(`${persona.id} reruns deterministically through the real workflow`, async () => {
    const a = await runPersona(persona, bundle)
    const b = await runPersona(persona, bundle)
    expect(a.error).toBeNull()
    expect(a.personaSnapshot).toEqual(persona)
    expect(a.personaSnapshot).not.toBe(persona)
    expect(a.accepted).toBe(5)
    expect(compareJourneys(a, b)).toEqual([])
    expect(
      compareJourneys(
        baseline.journeys.find((j) => j.personaId === persona.id)!,
        a
      )
    ).toEqual([])
    expect(a.steps[0]!.prompt.promptId).toBe('root')
    for (const step of a.steps.filter((s) => s.rankings.length && s.nextPrompt))
      expect(step.nextPrompt!.promptId).toBe(step.rankings[0]!.id)
    for (const step of a.steps.filter(
      (s) => s.rankings.length && !s.nextPrompt
    ))
      expect(step.status).toBe('results')
    for (const step of a.steps) {
      expect(step.trace?.stages.every((s) => !s.name.startsWith('B'))).toBe(
        true
      )
    }
    for (const step of a.steps.filter(
      (s) => s.operation === 'answer' && s.disposition === 'usable'
    ))
      expect(step.trace?.stages[0]?.name).toBe('A: interpret')
    expect(a.result?.sources ?? []).toEqual([])
  })

test('dense first replies qualify without enforcing three answers; opposing views can reason well', async () => {
  const doom = await runPersona(
    personas.find((p) => p.id === 'control-alarmist')!,
    bundle,
    1
  )
  const bloom = await runPersona(
    personas.find((p) => p.id === 'cautious-builder')!,
    bundle,
    1
  )
  expect(doom.firstReadyAnswer).toBe(1)
  expect(bloom.firstReadyAnswer).toBe(1)
  expect(doom.result!.horizontal.value).toBeLessThan(
    bloom.result!.horizontal.value!
  )
  expect(doom.result!.vertical.value).toBeGreaterThan(0.7)
  expect(bloom.result!.vertical.value).toBeGreaterThan(0.7)
})

test('labor harms preserve unknown catastrophe and rigid optimism differs from careful optimism', async () => {
  const labor = await runPersona(
    personas.find((p) => p.id === 'labor-organizer')!,
    bundle
  )
  expect(
    labor.result?.components.find((c) => c.vector === 'catastrophic_risk')
      ?.value
  ).toBeNull()
  expect(
    labor.result?.components.find((c) => c.vector === 'risk_landscape')?.value
  ).toBeGreaterThan(0)
  const rigid = await runPersona(
    personas.find((p) => p.id === 'dogmatic-utopian')!,
    bundle
  )
  const careful = await runPersona(
    personas.find((p) => p.id === 'abundance-advocate')!,
    bundle
  )
  expect(rigid.result?.vertical.value).toBeLessThan(
    careful.result!.vertical.value!
  )
  expect(rigid.steps.filter((s) => s.disposition === 'non_answer')).toEqual([])
})

test('uncertainty does not bypass readiness or become non-answer recovery', async () => {
  for (const id of ['worried-novice', 'open-uncertainty']) {
    const first = await runPersona(
      personas.find((p) => p.id === id)!,
      bundle,
      1
    )
    expect(first.result).toBeNull()
    expect(first.finalReadiness.ready).toBe(false)
    const j = await runPersona(
      personas.find((p) => p.id === id)!,
      bundle
    )
    expect(j.accepted).toBe(5)
    expect(j.steps.some((s) => s.paperclips)).toBe(false)
    expect(
      j.result?.components.find((c) => c.vector === 'catastrophic_risk')?.value
    ).toBeNull()
  }
  const unknown = await runPersona(
    personas.find((p) => p.id === 'open-uncertainty')!,
    bundle
  )
  expect(unknown.result).not.toBeNull()
  expect(unknown.result?.horizontal.value).toBeNull()
})

test('exact non-answer prelude adds no coverage and triggers paperclips before a real retry', async () => {
  const j = await runPersona(
    personas.find((p) => p.id === 'playful-recovery')!,
    bundle
  )
  expect(j.steps.slice(0, 2).map((s) => s.disposition)).toEqual([
    'non_answer',
    'non_answer'
  ])
  expect(
    j.steps
      .slice(0, 2)
      .every((s) => s.readiness.value === 0 && s.stages.length === 0)
  ).toBe(true)
  expect(j.steps[1]!.paperclips).toBe(true)
  expect(j.steps[2]!.operation).toBe('retry')
  expect(j.steps[3]!.answer).toContain('Seriously:')
  expect(j.steps[3]!.disposition).toBe('usable')
})

test('live mode receives only normal participant context, never expected persona judgments', async () => {
  const fixture = createFixtureProvider()
  const seen: unknown[] = []
  const live: Provider = {
    kind: 'live',
    evaluate: async (...args) => {
      seen.push(args[0])
      return { ...(await fixture.evaluate(...args)), model: versions.model }
    }
  }
  const j = await runPersona(personas[0]!, bundle, 1, live)
  expect(j.error).toBeNull()
  expect(seen.length).toBeGreaterThan(0)
  for (const input of seen) {
    expect(JSON.stringify(input)).not.toContain('control-alarmist')
    expect(input).not.toHaveProperty('levels')
    expect(input).not.toHaveProperty('persona')
  }
})

test('budget/provider failure is saved as a partial run without a manufactured result or raw error', async () => {
  const provider: Provider = {
    kind: 'live',
    evaluate: async () => {
      throw new Error('sensitive transport detail')
    }
  }
  const j = await runPersona(personas[0]!, bundle, 1, provider)
  expect(j.error).not.toBeNull()
  expect(JSON.stringify(j)).not.toContain('sensitive transport detail')
  expect(j.accepted).toBe(0)
  expect(j.failureStage).toBe('interpret')
  expect(j.result).toBeNull()
})

test('unsupported fixture options fail clearly rather than silently picking a supported default', async () => {
  const script = scriptedProvider(personas[0]!, bundle)
  script.setReply(replyForPrompt(personas[0]!, bundle.prompts[0]!))
  await expect(
    script.provider.evaluate(
      { current: {} },
      {
        disposition: {
          type: 'choice',
          instructions: 'changed',
          criteria: { changed: 'new option' }
        }
      }
    )
  ).rejects.toThrow('no longer exists')
})

for (const failureStage of ['interpret', 'route', 'project'] as const)
  test(`failed ${failureStage} resumes the exact operation once from committed state`, async () => {
    const fixture = createFixtureProvider()
    const healthy: Provider = {
      kind: 'live',
      async evaluate(...args) {
        return { ...(await fixture.evaluate(...args)), model: versions.model }
      }
    }
    const failing: Provider = {
      kind: 'live',
      async evaluate(...args) {
        const stage = args[1].disposition
          ? 'interpret'
          : Object.keys(args[1]).some((id) => id.endsWith(':score'))
            ? 'project'
            : 'route'
        if (stage === failureStage) throw new Error('private transport body')
        return healthy.evaluate(...args)
      }
    }
    const failed = journeySchema.parse(
      await runPersona(personas[0]!, bundle, 1, failing)
    )
    expect(failed.failureStage).toBe(failureStage)
    expect(failed.failedOperation).toBeDefined()
    expect(JSON.stringify(failed)).not.toContain('private transport body')
    const checkpoint = failed.failedOperation!
    expect(checkpoint.assessment.answers).toHaveLength(
      failureStage === 'project' ? 1 : 0
    )
    expect(checkpoint.completedStages.map((s) => s.name)).toEqual(
      failureStage === 'route' ? ['A: interpret'] : []
    )
    expect(checkpoint.operation).toEqual(
      failureStage === 'project'
        ? { type: 'project' }
        : { type: 'answer', text: personas[0]!.opening }
    )
    const original = structuredClone(failed)
    const failedAgain = journeySchema.parse(
      await runPersona(
        personas[0]!,
        bundle,
        1,
        failing,
        undefined,
        false,
        failed
      )
    )
    expect(failedAgain.accepted).toBe(failed.accepted)
    expect(failedAgain.steps).toEqual(failed.steps)
    expect(failedAgain.failedOperation?.assessment).toEqual(
      checkpoint.assessment
    )
    const changedPersona = {
      ...personas[0]!,
      description: 'Changed after original run'
    }
    const resumed = journeySchema.parse(
      await runPersona(
        changedPersona,
        bundle,
        1,
        healthy,
        undefined,
        false,
        failedAgain
      )
    )
    expect(resumed.error).toBeNull()
    expect(resumed.failedOperation).toBeUndefined()
    expect(resumed.accepted).toBe(1)
    expect(resumed.steps).toHaveLength(failed.steps.length + 1)
    expect(resumed.steps.slice(0, -1)).toEqual(failed.steps)
    expect(resumed.personaSnapshot).toEqual(failed.personaSnapshot)
    expect(failed).toEqual(original)
    await expect(
      runPersona(personas[0]!, bundle, 1, healthy, undefined, false, resumed)
    ).rejects.toThrow('saved failed operation')
  })

test('failure refreshing a result preserves the previous result through retry', async () => {
  const fixture = createFixtureProvider()
  let projections = 0
  const healthy: Provider = {
    kind: 'live',
    async evaluate(...args) {
      return { ...(await fixture.evaluate(...args)), model: versions.model }
    }
  }
  const failing: Provider = {
    kind: 'live',
    async evaluate(...args) {
      if (
        Object.keys(args[1]).some((id) => id.endsWith(':score')) &&
        ++projections === 2
      )
        throw new Error('Failed result refresh')
      return healthy.evaluate(...args)
    }
  }
  const failed = await runPersona(
    personas[0]!,
    bundle,
    5,
    failing,
    undefined,
    true
  )
  expect(failed.failureStage).toBe('project')
  expect(failed.result).not.toBeNull()
  expect(failed.failedOperation?.assessment.result).toEqual(failed.result)
  const previous = structuredClone(failed)
  const resumed = await runPersona(
    personas[0]!,
    bundle,
    5,
    healthy,
    undefined,
    true,
    failed
  )
  expect(resumed.error).toBeNull()
  expect(resumed.accepted).toBe(failed.accepted)
  expect(resumed.result?.evidenceRevision).toBe(
    failed.failedOperation?.assessment.evidenceRevision
  )
  expect(resumed.steps.slice(0, -1)).toEqual(failed.steps)
  expect(failed).toEqual(previous)
})
