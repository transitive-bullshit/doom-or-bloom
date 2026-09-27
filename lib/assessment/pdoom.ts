// Authored event-probability bands. Jev weights interpretations of the
// participant’s belief; its category confidence is never itself a P(doom).
export const doomBands = {
  virtually_impossible: {
    bounds: [0, 0.001],
    label:
      'Catastrophe is virtually impossible: at most a one-in-a-thousand chance (0–0.1%).'
  },
  negligible: {
    bounds: [0.001, 0.01],
    label:
      'Negligible catastrophe risk, but more than virtually impossible (0.1–1%).'
  },
  remote: {
    bounds: [0.01, 0.03],
    label:
      'A remote but real catastrophe risk, around one to three chances in a hundred (1–3%).'
  },
  very_unlikely: {
    bounds: [0.03, 0.1],
    label: 'Very unlikely catastrophe, a small but nonzero chance (3–10%).'
  },
  unlikely: {
    bounds: [0.1, 0.3],
    label: 'Unlikely catastrophe, but a substantial minority chance (10–30%).'
  },
  plausible: {
    bounds: [0.3, 0.5],
    label:
      'Catastrophe is a roughly even or somewhat less likely outcome (30–50%).'
  },
  likely: {
    bounds: [0.5, 0.7],
    label: 'Catastrophe is more likely than not (50–70%).'
  },
  very_likely: {
    bounds: [0.7, 0.9],
    label: 'Catastrophe is very likely, but not almost inevitable (70–90%).'
  },
  near_certain: {
    bounds: [0.9, 0.97],
    label:
      'Catastrophe is the emphatically expected default, but a meaningful small chance of avoiding it remains (90–97%).'
  },
  almost_certain: {
    bounds: [0.97, 0.99],
    label:
      'Catastrophe is almost inevitable; avoiding it would require an exceptional escape (97–99%).'
  },
  virtually_certain: {
    bounds: [0.99, 1],
    label:
      'Catastrophe is treated as a practical certainty, with essentially no credible chance of avoiding it (99–100%).'
  }
} satisfies Record<string, { bounds: [number, number]; label: string }>

// Band edges of 0 and 1 are clamped so every band has a finite log-odds span.
const edge = 0.0002
const logit = (p: number) => {
  const q = Math.min(1 - edge, Math.max(edge, p))
  return Math.log(q / (1 - q))
}
const expit = (z: number) => 1 / (1 + Math.exp(-z))
// Simulated retakes of the same worldview moved P(doom) by roughly 0.3–0.5
// log-odds, so no displayed range is narrower than this half-width.
const minimumHalfWidth = 0.5

/**
 * Infers a P(doom) estimate from a band distribution by averaging in log-odds.
 * Averaging band midpoints on the probability scale let diffuse distributions
 * inflate low estimates, and the former sharpening correction then squashed
 * the 5–40% range. Returns null when no band carries probability mass.
 */
export function inferPdoom(distribution: Record<string, number>) {
  const bands = Object.values(doomBands).map((band, index) => ({
    low: logit(band.bounds[0]),
    high: logit(band.bounds[1]),
    bounds: band.bounds,
    mass: distribution[Object.keys(doomBands)[index]!] ?? 0
  }))
  const mass = bands.reduce((sum, band) => sum + band.mass, 0)
  if (mass <= 0) return null
  const center =
    bands.reduce(
      (sum, band) => sum + (band.mass * (band.low + band.high)) / 2,
      0
    ) / mass
  // Uniform interpolation within a band is an authored display approximation.
  const quantile = (target: number) => {
    let cumulative = 0
    for (const band of bands) {
      const weight = band.mass / mass
      if (weight > 0 && cumulative + weight >= target)
        return (
          band.low + ((target - cumulative) / weight) * (band.high - band.low)
        )
      cumulative += weight
    }
    return bands.at(-1)!.high
  }
  const padding = 2 * Math.max(0, 1 - mass)
  const rawEstimate =
    bands.reduce(
      (sum, band) => sum + (band.mass * (band.bounds[0] + band.bounds[1])) / 2,
      0
    ) / mass
  return {
    estimate: expit(center),
    bounds: [
      expit(Math.min(center - minimumHalfWidth, quantile(0.25) - padding)),
      expit(Math.max(center + minimumHalfWidth, quantile(0.75) + padding))
    ] as [number, number],
    rawEstimate,
    mass
  }
}

export function pdoomToken(estimate: number) {
  if (estimate < 0.01) return '<1%'
  if (estimate > 0.99) return '>99%'
  return `≈${Math.round(estimate * 100)}%`
}

/**
 * Bounds for a percentage the participant wrote. Qualifiers keep their
 * meaning ("less than 1%" is [0, 1%]); a margin of error is not a range.
 */
export function statedBounds(token: string): [number, number] | undefined {
  if (/±|\+\/-/u.test(token)) return undefined
  const values = token.match(/\d+(?:\.\d+)?/gu)?.map(Number) ?? []
  if (!values.length || values.some((value) => value > 100)) return undefined
  const low = Math.min(...values) / 100
  const high = Math.max(...values) / 100
  if (/^(?:less than|under|below|at most|<)/iu.test(token)) return [0, high]
  if (/^(?:more than|over|above|at least|>)/iu.test(token)) return [low, 1]
  return [low, high]
}
