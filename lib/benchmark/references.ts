import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { z } from 'zod'
import type { Persona } from '@/lib/journeys/catalog'
import { mean } from './metrics'

export const referencesPath = 'eval/benchmark/references.json'

// There is no validated ground truth. Each persona has up to four imperfect,
// partly independent references (interview audit 2026-09-27, "References"):
// R1 Jev with the product's questions reading the whole brief as one answer;
// R2 an independent model judge reading the source dossier; R3 the simulated
// person placing themself before seeing results; R4 a verified public
// P(doom) statement. The benchmark's consensus is the mean of R2 and R3.
export const referenceKinds = ['r1', 'r2', 'r3', 'r4'] as const
export type ReferenceKind = (typeof referenceKinds)[number]

const unit = z.number().min(0).max(1)
const placement = {
  x: unit.nullable(),
  y: unit.nullable(),
  pdoom: unit.nullable()
}
// Each reference records the brief it read (see briefHash), so a changed
// persona brief marks only the references built from the old one as stale.
const built = <T extends z.ZodType>(sample: T) =>
  z.strictObject({
    provenance: z.string(),
    briefHash: z.string(),
    samples: z.array(sample).min(1)
  })

export const referenceStoreSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    description: z.string(),
    provenance: z.record(
      z.string(),
      z.strictObject({
        reference: z.enum(referenceKinds),
        method: z.string(),
        createdAt: z.string(),
        versions: z.record(z.string(), z.string())
      })
    ),
    personas: z.record(
      z.string(),
      z.strictObject({
        name: z.string(),
        r1: built(z.strictObject(placement)).optional(),
        r2: built(z.strictObject({ ...placement, evidence: unit })).optional(),
        r3: built(
          z.strictObject({ ...placement, wouldAnswer: z.boolean() })
        ).optional(),
        r4: z
          .strictObject({
            provenance: z.string(),
            token: z.string(),
            low: unit,
            high: unit,
            outcome: z.string(),
            publishedAt: z.string(),
            url: z.url()
          })
          .optional()
      })
    )
  })
  .superRefine((store, ctx) => {
    for (const [id, entry] of Object.entries(store.personas))
      for (const kind of referenceKinds) {
        const key = entry[kind]?.provenance
        if (key !== undefined && store.provenance[key]?.reference !== kind)
          ctx.addIssue({
            code: 'custom',
            path: ['personas', id, kind, 'provenance'],
            message: `Unknown ${kind} provenance "${key}"`
          })
      }
  })
export type ReferenceStore = z.infer<typeof referenceStoreSchema>
export type PersonaReferences = ReferenceStore['personas'][string]
export type Point = { x: number | null; y: number | null; pdoom: number | null }

export function loadReferences(file = referencesPath): ReferenceStore {
  return referenceStoreSchema.parse(JSON.parse(readFileSync(file, 'utf8')))
}

// Committed data: keep every array non-primitive so this output is already in
// the repository's formatted JSON layout.
export function saveReferences(store: ReferenceStore, file = referencesPath) {
  writeFileSync(
    file,
    `${JSON.stringify(referenceStoreSchema.parse(store), null, 2)}\n`
  )
}

export function displayName(persona: Persona) {
  return persona.proxy.startsWith('Fictional')
    ? persona.name
    : persona.proxy.split('·')[0]!.trim()
}

/**
 * Identifies the brief a reference read. The benchmark overrides the answer
 * style, so responseStyle is excluded; statedPdoom is R4's own provenance.
 */
export function briefHash(persona: Persona) {
  const { description, familiarity, background, beliefs, voice, sources } =
    persona
  return createHash('sha256')
    .update(
      JSON.stringify({
        description,
        familiarity,
        background,
        beliefs,
        voice,
        sources
      })
    )
    .digest('hex')
    .slice(0, 16)
}

const average = (entry: { samples: Point[] } | undefined, axis: keyof Point) =>
  mean(entry?.samples.map((sample) => sample[axis]) ?? [])

/** One reference as a point; R4 only has P(doom), at its range midpoint. */
export function referencePoint(
  entry: PersonaReferences,
  kind: ReferenceKind | 'consensus'
): Point {
  if (kind === 'r4')
    return {
      x: null,
      y: null,
      pdoom: entry.r4 ? (entry.r4.low + entry.r4.high) / 2 : null
    }
  if (kind !== 'consensus')
    return {
      x: average(entry[kind], 'x'),
      y: average(entry[kind], 'y'),
      pdoom: average(entry[kind], 'pdoom')
    }
  const both = (axis: keyof Point) =>
    mean([average(entry.r2, axis), average(entry.r3, axis)])
  return { x: both('x'), y: both('y'), pdoom: both('pdoom') }
}
