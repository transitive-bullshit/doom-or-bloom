import type { Assessment, Component, Result } from './schema'
import { epistemicIds } from './schema'
import type { Rubric } from '@/lib/content/schema'
import { eligible } from './state'
export function quantile(
  distribution: Record<string, number>,
  q: number,
  maximum: number
) {
  let cumulative = 0
  for (const [level, p] of Object.entries(distribution).sort(
    ([a], [b]) => Number(a) - Number(b)
  )) {
    cumulative += p
    if (cumulative >= q) return Number(level) / maximum
  }
  return 1
}
export function composite(
  vector: string,
  label: string,
  components: Component[],
  weights: Record<string, number>,
  reverse: string[] = []
): Component {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0)
  let observed = 0,
    observedWeight = 0,
    low = 0,
    high = 0
  const ids = new Set<string>()
  for (const [id, weight] of Object.entries(weights)) {
    const c = components.find((item) => item.vector === id)
    const reversed = reverse.includes(id)
    if (c?.value !== null && c?.value !== undefined) {
      observed += weight * (reversed ? 1 - c.value : c.value)
      observedWeight += weight
    }
    low += weight * (c ? (reversed ? 1 - c.range[1] : c.range[0]) : 0)
    high += weight * (c ? (reversed ? 1 - c.range[0] : c.range[1]) : 1)
    for (const evidenceId of c?.evidenceIds ?? []) ids.add(evidenceId)
  }
  return {
    vector,
    label,
    value: observedWeight ? observed / observedWeight : null,
    range: [low / totalWeight, high / totalWeight],
    distribution: {},
    confidence: null,
    evidenceIds: [...ids],
    claim: null
  }
}
export function emptyComponent(vector: string, label: string): Component {
  return {
    vector,
    label,
    value: null,
    range: [0, 1],
    distribution: {},
    confidence: null,
    evidenceIds: [],
    claim: null
  }
}

// Claims are stored as canonical English and validated by exact match; the
// display layer maps them to the active locale (lib/assessment/display-text.ts).
export const uncertainClaim =
  'You expressed uncertainty here rather than a directional expectation.'
export const unestablishedClaim =
  'A directional position is not yet established by these answers.'
export const unresolvedClaim =
  'The interpretation of these answers still needs clarification.'
const readingsPrefix = 'Several readings remain plausible: '

const unplacedScopes = {
  capability_trajectory: 'whether or when transformative AI arrives',
  transition_dynamics: 'how quickly AI-driven change unfolds',
  beneficial_potential: 'the positive impact you expect from AI',
  risk_landscape: 'the harm you expect from AI',
  technical_controllability:
    'whether technical control of powerful AI will work',
  institutional_competence: 'how effectively institutions will respond',
  human_agency: 'what happens to the forms of agency you value',
  action_posture: 'which development or policy response you prefer',
  catastrophic_risk: 'the prospect of catastrophic or irreversible harm'
}

export function unplacedClaim(vector: string, explicitlyUnknown: boolean) {
  const scope = Object.hasOwn(unplacedScopes, vector)
    ? unplacedScopes[vector as keyof typeof unplacedScopes]
    : undefined
  if (!scope) return explicitlyUnknown ? uncertainClaim : unestablishedClaim
  return explicitlyUnknown
    ? `You expressed uncertainty about ${scope}.`
    : `These answers do not yet establish ${scope}.`
}

export function isAuthoredClaim(
  claim: string,
  levels: string[],
  vector?: string
) {
  if (
    [
      ...levels,
      uncertainClaim,
      unestablishedClaim,
      unresolvedClaim,
      ...(vector
        ? [unplacedClaim(vector, true), unplacedClaim(vector, false)]
        : [])
    ].includes(claim)
  )
    return true
  const readings = claimReadings(claim)
  return (
    readings !== null &&
    readings.length >= 2 &&
    new Set(readings).size === readings.length &&
    readings.every((reading) => levels.includes(reading))
  )
}

/** The level texts of a "Several readings remain plausible" claim, or null. */
export function claimReadings(claim: string) {
  return claim.startsWith(readingsPrefix)
    ? claim.slice(readingsPrefix.length).split(' / ')
    : null
}

export function supportedClaim(
  levels: string[],
  probabilities: Record<string, number>,
  unresolved: boolean,
  threshold: number
) {
  if (unresolved) return unresolvedClaim
  const ordered = Object.entries(probabilities).sort((a, b) => b[1] - a[1])
  const best = ordered[0]
  if (best && best[1] >= threshold) return levels[Number(best[0])]!
  const readings = ordered
    .filter(([, p]) => p >= 0.1)
    .map(([level]) => levels[Number(level)])
  return `${readingsPrefix}${readings.join(' / ')}`
}
export function baseResult(
  state: Assessment,
  components: Component[],
  rubric: Rubric,
  capped = false
): Result {
  const covered = Object.values(state.coverage).filter(
    (v) => v === 'assessed'
  ).length
  // Provisional until the projection places the map; see resultReason.
  const insufficient = !eligible(state)
  const horizontal = {
    ...(components.find(
      (component) => component.vector === 'outlook_orientation'
    ) ?? emptyComponent('outlook_orientation', 'Expressed outlook')),
    vector: 'outlook',
    label: 'Doom–Bloom'
  }
  const outlookEstablished = horizontal.value !== null
  const vertical = composite(
    'epistemic',
    'Demonstrated reasoning',
    components,
    Object.fromEntries(epistemicIds.map((id) => [id, 1]))
  )
  // Ensure the displayed interpretation range includes the observed-only point when evidence is missing.
  for (const axis of [horizontal, vertical])
    if (axis.value !== null) {
      axis.range[0] = Math.min(axis.range[0], axis.value)
      axis.range[1] = Math.max(axis.range[1], axis.value)
    }
  return {
    evidenceRevision: state.evidenceRevision,
    versions: state.versions,
    horizontal,
    vertical,
    components,
    findings: [],
    resources: [],
    fingerprint: [],
    sources: [],
    provisional:
      covered < rubric.readinessCoverage ||
      state.unresolved.length > 0 ||
      components.some((c) => c.value === null),
    capped,
    insufficient,
    reason: insufficient
      ? 'Some parts of your view are still unexplored; these are provisional interpretations.'
      : !outlookEstablished
        ? 'Your expressed outlook is still unclear; the views you did express remain below.'
        : covered < rubric.readinessCoverage
          ? 'Some parts of your view are still unexplored.'
          : state.unresolved.length
            ? 'Some interpretations still need clarification.'
            : 'A projection of the evidence you supplied, with interpretation ranges.'
  }
}

/**
 * Why the participant is seeing this result, derived from what it places.
 * Recomputed at render time for saved results, so older snapshots gain the
 * current explanation without reprocessing. Its copy is
 * `Results.reason.<kind>` in messages/<locale>.json.
 */
export function resultReasonKind(
  result: Pick<Result, 'capped' | 'horizontal' | 'experiment'>
) {
  const placed =
    result.horizontal.value !== null &&
    (result.experiment?.transformation.value ?? null) !== null
  if (!placed) return result.capped ? 'unplacedCapped' : 'unplaced'
  const risk = Boolean(result.experiment?.pdoom)
  return result.capped
    ? risk
      ? 'capped'
      : 'cappedNoRisk'
    : risk
      ? 'placed'
      : 'placedNoRisk'
}

// The English reason saved with a result; the display uses the message above.
const savedReasons = {
  unplacedCapped:
    'You reached the question limit before your answers placed you on the map. Here’s what we could read from them.',
  unplaced:
    'Your answers don’t place you on the map yet. Here’s what we could read so far; another answer or two can place you.',
  capped:
    'You reached the question limit, so this reflects the answers you gave.',
  cappedNoRisk:
    'You reached the question limit, so this reflects the answers you gave. There wasn’t enough to estimate your P(doom); a sentence about how likely you think catastrophe is would add it.',
  placed:
    'Your answers place your outlook and the scale of change you expect, which is what the map needs. More answers can sharpen it.',
  placedNoRisk:
    'Your answers place your outlook and the scale of change you expect, which is what the map needs. There wasn’t enough to estimate your P(doom); a sentence about how likely you think catastrophe is would add it. More answers can sharpen it.'
} satisfies Record<ReturnType<typeof resultReasonKind>, string>

export function resultReason(
  result: Pick<Result, 'capped' | 'horizontal' | 'experiment'>
) {
  return savedReasons[resultReasonKind(result)]
}
