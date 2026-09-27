import type { Component, Result } from './schema'
import { inferPdoom, pdoomToken, statedBounds } from './pdoom'
import { resultReason } from './projections'

// Saved snapshots are immutable. Display improvements that need no new
// evidence or inference are applied here, at render time, to every saved
// result, so older assessments gain them without reprocessing. Improvements
// that need a new evaluation (new questions, definitions or judgments) apply
// only to assessments evaluated after them.

// Retests of the same simulated worldview moved the outlook by about ±0.05
// (interview audit, 2026-09-27), so no map range is narrower than this.
const minimumHalfWidth = 0.05

type Pdoom = NonNullable<NonNullable<Result['experiment']>['pdoom']>

function widen(component: Component): Component {
  if (component.value === null) return component
  const range: [number, number] = [
    Math.max(
      0,
      Math.min(component.range[0], component.value - minimumHalfWidth)
    ),
    Math.min(
      1,
      Math.max(component.range[1], component.value + minimumHalfWidth)
    )
  ]
  return range[0] === component.range[0] && range[1] === component.range[1]
    ? component
    : { ...component, range }
}

const percent = (value: number) =>
  value < 0.01 ? '<1' : value > 0.99 ? '>99' : String(Math.round(value * 100))

/** A range label for an inferred P(doom), e.g. "under 5%" or "10–30%". */
export function pdoomRangeLabel([low, high]: [number, number]) {
  if (high < 0.01) return '<1%'
  if (low > 0.99) return '>99%'
  if (low < 0.01) return `under ${percent(high)}%`
  if (high > 0.99) return `over ${percent(low)}%`
  return percent(low) === percent(high)
    ? `≈${percent(low)}%`
    : `${percent(low)}–${percent(high)}%`
}

// A plausible range wider than about 50× in odds has no meaningful point, as
// when answers read both as dismissing and as expecting catastrophe.
const unclearWidth = 4
const logit = (p: number) =>
  Math.log(Math.max(p, 0.0001) / Math.max(1 - p, 0.0001))

/**
 * The displayed P(doom). Inferred values are recomputed from their stored band
 * interpretation with the current estimator and headlined by their point
 * estimate, or "Unclear" when the plausible range spans both extremes; the
 * range is shown separately. Stated values keep their qualifiers ("less than
 * 1%" is 0–1%).
 */
export function presentPdoom(pdoom: Pdoom | null | undefined) {
  if (!pdoom || pdoom.source === 'public-statement') return pdoom ?? null
  const source = pdoom.source ?? (pdoom.adjustment ? 'inferred' : 'stated')
  if (source === 'stated') {
    const bounds = pdoom.token ? statedBounds(pdoom.token) : undefined
    return bounds
      ? { ...pdoom, bounds, estimate: (bounds[0] + bounds[1]) / 2 }
      : pdoom
  }
  let next: Pdoom = pdoom
  const inferred =
    pdoom.adjustment && pdoom.adjustment.method !== 'logodds-v1'
      ? inferPdoom(pdoom.adjustment.bandProbabilities)
      : null
  if (inferred && pdoom.adjustment)
    next = {
      ...pdoom,
      estimate: inferred.estimate,
      bounds: inferred.bounds,
      adjustment: {
        ...pdoom.adjustment,
        method: 'logodds-v1',
        rawEstimate: inferred.rawEstimate,
        rawBounds: inferred.bounds
      }
    }
  if (next.estimate === undefined || !next.bounds) return next
  return {
    ...next,
    token:
      logit(next.bounds[1]) - logit(next.bounds[0]) > unclearWidth
        ? 'Unclear'
        : pdoomToken(next.estimate)
  }
}

/** The participant-facing version of a saved result. Idempotent. */
export function presentResult(result: Result): Result {
  const presented: Result = {
    ...result,
    horizontal: widen(result.horizontal)
  }
  if (result.experiment)
    presented.experiment = {
      ...result.experiment,
      transformation: widen(result.experiment.transformation),
      pdoom: presentPdoom(result.experiment.pdoom)
    }
  return { ...presented, reason: resultReason(presented) }
}
