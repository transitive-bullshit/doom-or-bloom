import { z } from 'zod'
import type { Result } from '@/lib/assessment/schema'
import { presentResult, unclearToken } from '@/lib/assessment/present-result'
import {
  closestPersonas,
  type PersonaComparison,
  type WorldviewValues
} from '@/lib/assessment/persona-matches'
import { resultPoint } from '@/lib/assessment/self-placement'
import { shareLinkIdSchema } from './share-links'

// "Compare with me": a participant's result beside a thought leader's or a
// friend's shared card. Everything here runs in the participant's browser from
// public data; nothing links the two assessments on the server.

const personaSlug = z.string().regex(/^[a-z0-9_-]{1,80}$/)

export type CompareTarget =
  | { kind: 'persona'; slug: string }
  | { kind: 'snapshot'; id: string }

/** Reads `?compare=persona:<slug>` or `?compare=<share link id>`. */
export function parseCompareTarget(
  value: string | null | undefined
): CompareTarget | null {
  if (!value) return null
  if (value.startsWith('persona:')) {
    const slug = personaSlug.safeParse(value.slice('persona:'.length))
    return slug.success ? { kind: 'persona', slug: slug.data } : null
  }
  return shareLinkIdSchema.safeParse(value).success
    ? { kind: 'snapshot', id: value }
    : null
}

export function compareParam(target: CompareTarget) {
  return target.kind === 'persona' ? `persona:${target.slug}` : target.id
}

/** The other side of a comparison, from a persona or a public share link. */
export const comparedWorldviewSchema = z.strictObject({
  kind: z.enum(['persona', 'snapshot']),
  // A persona's name or the sharer's first name; null reads “a friend”.
  name: z.string().max(120).nullable(),
  slug: z.string().max(80).optional(),
  avatar: z.string().max(500).optional(),
  values: z.partialRecord(z.string(), z.number().finite().min(0).max(1)),
  map: z.strictObject({
    x: z.number().finite().min(0).max(1).nullable(),
    y: z.number().finite().min(0).max(1).nullable()
  }),
  pdoom: z
    .strictObject({
      token: z.string().max(120),
      source: z.enum(['stated', 'inferred', 'public-statement']).nullable()
    })
    .nullable(),
  closestPersonaIds: z.array(z.string().max(100)).max(3)
})
export type ComparedWorldview = z.infer<typeof comparedWorldviewSchema>

export const alignmentBuckets = [
  'very_aligned',
  'mostly_aligned',
  'some_distance',
  'worlds_apart'
] as const
export type AlignmentBucket = (typeof alignmentBuckets)[number]

// Upper bounds of the weighted distance from closestPersonas for each bucket:
// about the 10th, 35th and 70th percentiles of 19,838 ordered pairs of the 144
// selected simulated users on October 1, 2026 (0.148, 0.214 and 0.294). The
// simulated catalog is a proxy for participants; revisit with real
// comparisons (docs/MEASUREMENT.md).
export const alignmentThresholds = {
  very_aligned: 0.15,
  mostly_aligned: 0.21,
  some_distance: 0.29
} as const

export function alignmentBucket(distance: number): AlignmentBucket {
  if (distance <= alignmentThresholds.very_aligned) return 'very_aligned'
  if (distance <= alignmentThresholds.mostly_aligned) return 'mostly_aligned'
  if (distance <= alignmentThresholds.some_distance) return 'some_distance'
  return 'worlds_apart'
}

// Differences on one map axis below this read as the same place, like the
// self-placement comparison's retest tolerance.
const sameAxis = 0.1

export type Comparison = {
  /** Null when the two share too few placed dimensions to compare honestly. */
  bucket: AlignmentBucket | null
  distance: number | null
  you: { x: number | null; y: number | null }
  them: { x: number | null; y: number | null }
  outlook: 'same' | 'more_hopeful' | 'more_worried' | null
  change: 'same' | 'more' | 'less' | null
  yourPdoom: { token: string; source: string | null } | null
  /** A thought leader in both top-three lists, yours first. */
  sharedClosest: PersonaComparison | null
}

export function compareWorldviews(
  saved: Result,
  other: ComparedWorldview,
  personas: PersonaComparison[]
): Comparison {
  const result = presentResult(saved)
  const you = resultPoint(result)
  // The same weighted distance that ranks closest thought leaders, with the
  // other person in a persona's place: unknown values cost disagreement.
  const [match] = closestPersonas(result, [
    {
      id: 'compared',
      name: '',
      slug: '',
      avatar: '',
      values: other.values as WorldviewValues,
      map: other.map
    }
  ])
  const axis = (mine: number | null, theirs: number | null) =>
    mine === null || theirs === null
      ? null
      : Math.abs(mine - theirs) <= sameAxis
        ? 0
        : Math.sign(mine - theirs)
  const dx = axis(you.x, other.map.x)
  const dy = axis(you.y, other.map.y)
  const experiment =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment
      : undefined
  const pdoom = experiment?.pdoom
  const theirs = new Set(other.closestPersonaIds)
  return {
    bucket: match ? alignmentBucket(match.distance) : null,
    distance: match?.distance ?? null,
    you,
    them: other.map,
    outlook:
      dx === null
        ? null
        : dx === 0
          ? 'same'
          : dx > 0
            ? 'more_hopeful'
            : 'more_worried',
    change: dy === null ? null : dy === 0 ? 'same' : dy > 0 ? 'more' : 'less',
    yourPdoom:
      pdoom?.token && pdoom.token !== unclearToken
        ? { token: pdoom.token, source: pdoom.source ?? null }
        : null,
    sharedClosest:
      other.kind === 'snapshot'
        ? (closestPersonas(result, personas).find(({ id }) => theirs.has(id)) ??
          null)
        : null
  }
}

// The compare target rides from the start link into the new draft. It lives in
// this browser only, keyed by assessment, like unsubmitted drafts.
const storageKey = (assessmentId: string) =>
  `doom-or-bloom:compare:${assessmentId}`

export function writeCompareTarget(
  assessmentId: string,
  target: CompareTarget
) {
  try {
    localStorage.setItem(storageKey(assessmentId), compareParam(target))
  } catch {
    /* Storage is optional; the result simply shows no comparison. */
  }
}

export function readCompareTarget(assessmentId: string) {
  try {
    return parseCompareTarget(localStorage.getItem(storageKey(assessmentId)))
  } catch {
    return null
  }
}
