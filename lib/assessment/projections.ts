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
export function baseResult(
  state: Assessment,
  components: Component[],
  rubric: Rubric,
  capped = false
): Result {
  const covered = Object.values(state.coverage).filter(
    (v) => v === 'assessed'
  ).length
  const insufficient = !eligible(state)
  const horizontal = composite(
    'outlook',
    'Doom–Bloom',
    components,
    rubric.horizontalWeights,
    ['risk_landscape']
  )
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
    provisional:
      covered < rubric.readinessCoverage ||
      state.unresolved.length > 0 ||
      components.some((c) => c.value === null),
    capped,
    insufficient,
    reason: insufficient
      ? 'There is not enough usable evidence to place this assessment.'
      : covered < rubric.readinessCoverage
        ? 'Some parts of your view are still unexplored.'
        : state.unresolved.length
          ? 'Some interpretations still need clarification.'
          : 'A projection of the evidence you supplied, with interpretation ranges.'
  }
}
