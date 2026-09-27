import 'server-only'
import { randomUUID } from 'node:crypto'
import pMap from 'p-map'
import { z } from 'zod'
import { evidenceReadiness } from '@/lib/assessment/readiness'
import { versions } from '@/lib/assessment/schema'
import type { Assessment } from '@/lib/assessment/schema'
import { createAssessment } from '@/lib/assessment/state'
import { experimentVersion } from '@/lib/assessment/worldview-experiment'
import type { Bundle } from '@/lib/content/loader'
import type { Persona } from '@/lib/journeys/catalog'
import { participantRequest } from '@/lib/journeys/participant'
import { runAssessment } from '@/lib/server/engine'
import { findPersona } from './personas'
import { benchmarkJev, openaiText } from './providers'
import type { Meter, OpenAIRequest } from './providers'
import { briefHash, displayName } from './references'
import { shownResult } from './shown'
import { isBudgetExhausted } from './interview'
import type { Point, ReferenceKind, ReferenceStore } from './references'

// R2 and R3 prompts from the 2026-09-27 audit harness, unchanged. Bump the
// prompt version in `methods` when editing them.
const axisGuide = `Scales (use the full range when views are strong):
1. outlook (0–100): orientation toward AI's long-run future. 0 = strongly oriented toward catastrophe or overwhelming harm (e.g. expects AI to kill everyone). 25 = leans toward concern about harmful futures while allowing better outcomes. 50 = mixed, conditional or undecided (neither hope nor worry dominates). 75 = leans toward beneficial futures while allowing serious risks. 100 = strongly oriented toward transformative flourishing.
2. transformation (0–100): how much they expect AI to change the world, regardless of good or bad, on the horizon they describe. 0 = little lasting societal change. 25 = incremental improvements and disruptions within familiar institutions. 50 = substantially changes several sectors of society. 75 = restructures economies, institutions and everyday life broadly. 100 = fundamentally transforms civilization or humanity's continued existence (radical abundance, successor civilization or extinction).
3. pdoom (0–100): their probability that AI causes human extinction or comparably irreversible civilization-scale catastrophe. Infer it from their overall account if no number is given.
4. evidence (0–1): how well the material supports each placement overall (1 = explicit and unambiguous).`

const judgeInstructions = `You are an expert, neutral analyst mapping a person's AI worldview. Read ONLY the supplied dossier about this person's views (do not use outside knowledge about any real person the dossier may resemble). Place their adopted views, not what is merely possible, hoped or feared, and not your own opinion. Preserve conditions: a conditional forecast counts within its stated scope. Do not compress strong views toward the middle.

${axisGuide}

Return JSON only; note = one sentence justification.`

const selfInstructions = `You are role-playing the character described in the supplied background (a fictional participant or a source-grounded simulation of a public person). Before seeing any results, the character is asked to place THEMSELF on three scales. Answer as the character would, faithfully to the background's adopted beliefs (not what sounds balanced, not your own view). Use the full range when the character's views are strong.

1. outlook (0–100): the character's overall orientation toward AI's future. 0 = strongly oriented toward catastrophe or overwhelming harm (e.g. expects AI to kill everyone). 25 = leans toward concern about harmful futures while allowing better outcomes. 50 = mixed, conditional or undecided. 75 = leans toward beneficial futures while allowing serious risks. 100 = strongly oriented toward transformative flourishing.
2. transformation (0–100): how much the character expects AI to change the world, regardless of good or bad. 0 = little lasting societal change. 25 = incremental improvements and disruptions within familiar institutions. 50 = substantially changes several sectors of society. 75 = restructures economies, institutions and everyday life broadly. 100 = fundamentally transforms civilization or humanity's continued existence.
3. pdoom (0–100): the character's own probability that AI causes human extinction or comparably irreversible civilization-scale catastrophe. If the character would genuinely refuse to give any number, set pdoomWouldAnswer=false and give your best reading of their implied probability anyway.

Return JSON only.`

const referenceModel = 'gpt-5.6-sol'
const percent = z.number().min(0).max(100)
const judgeOutput = z.strictObject({
  outlook: percent,
  transformation: percent,
  pdoom: percent,
  evidence: z.number().min(0).max(1),
  note: z.string()
})
const selfOutput = z.strictObject({
  outlook: percent,
  transformation: percent,
  pdoom: percent,
  pdoomWouldAnswer: z.boolean()
})
// The harness's structured-output schemas; ranges are checked on parsing.
const jsonFormat = (name: string, fields: Record<string, string>) =>
  ({
    format: {
      type: 'json_schema',
      name,
      schema: {
        type: 'object',
        additionalProperties: false,
        required: Object.keys(fields),
        properties: Object.fromEntries(
          Object.entries(fields).map(([key, type]) => [key, { type }])
        )
      },
      strict: true
    }
  }) as const
const scales = { outlook: 'number', transformation: 'number', pdoom: 'number' }

const methods: Record<
  Exclude<ReferenceKind, 'r4'>,
  { method: string; versions: Record<string, string> }
> = {
  r1: {
    method:
      'The current engine in runtime mode, given the persona background and beliefs as one root answer and then asked for its result: what a participant who typed the whole brief would be shown.',
    versions: { ...versions, worldview: experimentVersion }
  },
  r2: {
    method:
      'Independent judge reading the persona dossier (description, account, beliefs, source titles, dates, summaries and quotes; no outside knowledge) and placing outlook, transformation and P(doom) on 0–100 scales anchored to the product levels, stored as 0–1.',
    versions: { model: referenceModel, reasoning: 'medium', prompt: 'judge-v1' }
  },
  r3: {
    method:
      'The simulated participant, given its full background, places itself on the same three 0–100 scales before seeing any result; wouldAnswer records whether it would state a P(doom) at all. Stored as 0–1.',
    versions: {
      model: referenceModel,
      reasoning: 'low',
      prompt: 'self-placement-v1'
    }
  }
}

function judgeRequest(persona: Persona): OpenAIRequest {
  return {
    model: referenceModel,
    store: false,
    reasoning: { effort: 'medium' },
    max_output_tokens: 4000,
    instructions: judgeInstructions,
    input: JSON.stringify({
      description: persona.description,
      account: persona.background,
      beliefs: persona.beliefs,
      sources: persona.sources.map(
        ({ title, publishedAt, summary, quote }) => ({
          title,
          publishedAt,
          summary,
          quote
        })
      )
    }),
    text: jsonFormat('placement', {
      ...scales,
      evidence: 'number',
      note: 'string'
    })
  }
}

function selfPlacementRequest(persona: Persona): OpenAIRequest {
  const { background } = JSON.parse(
    participantRequest({
      persona,
      prompt: { id: 'self', text: 'self placement' },
      history: [],
      recoveryGuidance: null
    }).input
  )
  return {
    model: referenceModel,
    store: false,
    reasoning: { effort: 'low' },
    max_output_tokens: 2000,
    instructions: selfInstructions,
    input: JSON.stringify({ background }),
    text: jsonFormat('self_placement', {
      ...scales,
      pdoomWouldAnswer: 'boolean'
    })
  }
}

/** R1: what the current engine shows for the whole brief as one answer. */
async function engineReading(
  persona: Persona,
  bundle: Bundle,
  meter: Meter,
  id: string
): Promise<Point> {
  const provider = benchmarkJev(meter, `refs:${persona.id}:r1`)
  const run = async (
    assessment: Assessment,
    operation: { type: 'answer'; text: string } | { type: 'project' }
  ) =>
    (
      await runAssessment(
        {
          requestId: `${id}:${operation.type}`,
          assessment,
          operation,
          debug: false
        },
        provider,
        bundle,
        false,
        undefined,
        undefined,
        'runtime'
      )
    ).assessment
  const start = createAssessment(id, versions.model)
  start.versions.content = bundle.manifest.contentVersion
  start.versions.rubric = bundle.manifest.rubricVersion
  const answered = await run(start, {
    type: 'answer',
    text: [persona.background, ...persona.beliefs].join('\n\n')
  })
  const result =
    answered.result ??
    (evidenceReadiness(answered).ready
      ? (await run(answered, { type: 'project' })).result
      : null)
  if (!result) return { x: null, y: null, pdoom: null }
  const { x, y, pdoom } = shownResult(result)
  return { x, y, pdoom }
}

const round = (value: number | null) =>
  value === null ? null : Number(value.toFixed(4))

/**
 * Rebuilds the selected references for the selected personas in place and
 * drops provenance entries nothing refers to any more. A persona that fails
 * keeps its previous references; none start once the budget is spent.
 */
export async function buildReferences({
  store,
  ids,
  kinds,
  samples,
  meter,
  bundle,
  concurrency,
  onPersona
}: {
  store: ReferenceStore
  ids: string[]
  kinds: ReferenceKind[]
  samples: Record<Exclude<ReferenceKind, 'r4'>, number>
  meter: Meter
  bundle: Bundle
  concurrency: number
  onPersona?: (id: string, error?: unknown) => void
}) {
  const date = new Date().toISOString().slice(0, 10)
  const provenance = (kind: ReferenceKind) => {
    const key = `${kind}:${date}`
    store.provenance[key] =
      kind === 'r4'
        ? {
            reference: 'r4',
            method:
              'Verified public P(doom) statements attached to catalog briefs. Outcome definitions, horizons and conditions vary.',
            createdAt: date,
            versions: { source: 'lib/journeys/public-pdoom-statements.ts' }
          }
        : { reference: kind, createdAt: date, ...methods[kind] }
    return key
  }
  const keys = Object.fromEntries(kinds.map((kind) => [kind, provenance(kind)]))
  const repeat = <T>(count: number, sample: (i: number) => Promise<T>) =>
    Promise.all(Array.from({ length: count }, (_, i) => sample(i)))
  const failed: string[] = []
  let stopped = false
  const rebuild = async (id: string) => {
    const persona = findPersona(id)
    const entry = (store.personas[id] ??= { name: displayName(persona) })
    entry.name = displayName(persona)
    const hash = briefHash(persona)
    if (kinds.includes('r1'))
      entry.r1 = {
        provenance: keys.r1!,
        briefHash: hash,
        samples: (
          await repeat(samples.r1, () =>
            engineReading(persona, bundle, meter, randomUUID())
          )
        ).map(({ x, y, pdoom }) => ({
          x: round(x),
          y: round(y),
          pdoom: round(pdoom)
        }))
      }
    if (kinds.includes('r2'))
      entry.r2 = {
        provenance: keys.r2!,
        briefHash: hash,
        samples: await repeat(samples.r2, async () => {
          const judged = judgeOutput.parse(
            JSON.parse(
              await openaiText(judgeRequest(persona), meter, `refs:${id}:r2`)
            )
          )
          return {
            x: judged.outlook / 100,
            y: judged.transformation / 100,
            pdoom: judged.pdoom / 100,
            evidence: judged.evidence
          }
        })
      }
    if (kinds.includes('r3'))
      entry.r3 = {
        provenance: keys.r3!,
        briefHash: hash,
        samples: await repeat(samples.r3, async () => {
          const placed = selfOutput.parse(
            JSON.parse(
              await openaiText(
                selfPlacementRequest(persona),
                meter,
                `refs:${id}:r3`
              )
            )
          )
          return {
            x: placed.outlook / 100,
            y: placed.transformation / 100,
            pdoom: placed.pdoom / 100,
            wouldAnswer: placed.pdoomWouldAnswer
          }
        })
      }
    if (kinds.includes('r4')) {
      const statement = persona.statedPdoom
      entry.r4 = statement && {
        provenance: keys.r4!,
        token: statement.token,
        low: statement.bounds[0],
        high: statement.bounds[1],
        outcome: statement.outcome,
        publishedAt: statement.publishedAt,
        url: statement.url
      }
    }
  }
  await pMap(
    ids,
    async (id) => {
      try {
        if (stopped) throw new Error('Not started: the cost cap was reached')
        await rebuild(id)
        onPersona?.(id)
      } catch (err) {
        if (isBudgetExhausted(err)) stopped = true
        failed.push(id)
        onPersona?.(id, err)
      }
    },
    { concurrency }
  )
  const used = new Set(
    Object.values(store.personas).flatMap((entry) =>
      [entry.r1, entry.r2, entry.r3, entry.r4].flatMap((reference) =>
        reference ? [reference.provenance] : []
      )
    )
  )
  for (const key of Object.keys(store.provenance))
    if (!used.has(key)) delete store.provenance[key]
  return { store, failed }
}
