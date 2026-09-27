// Metric math for the regression benchmark and the feedback audit. Mirrors the
// 2026-09-27 interview audit's analysis scripts so results stay comparable.

/** Log-odds with the audit's clamp, so stated 0% and 100% stay finite. */
export function logit(p: number) {
  const q = Math.min(0.995, Math.max(0.005, p))
  return Math.log(q / (1 - q))
}

/** A P(doom) is "within about 2×" when its log-odds error is at most this. */
export const within2x = 0.7

const present = (values: Array<number | null | undefined>) =>
  values.filter(
    (value): value is number =>
      typeof value === 'number' && Number.isFinite(value)
  )

export function mean(values: Array<number | null | undefined>) {
  const xs = present(values)
  return xs.length ? xs.reduce((sum, x) => sum + x, 0) / xs.length : null
}

export function median(values: Array<number | null | undefined>) {
  const xs = present(values).sort((a, b) => a - b)
  if (!xs.length) return null
  const middle = Math.floor(xs.length / 2)
  return xs.length % 2 ? xs[middle]! : (xs[middle - 1]! + xs[middle]!) / 2
}

export type ErrorSummary = {
  n: number
  mae: number | null
  bias: number | null
}

/** Mean absolute and signed error over pairs where both values exist. */
export function errorSummary(
  pairs: Array<[estimate: number | null, reference: number | null]>
): ErrorSummary {
  const diffs = pairs.flatMap(([estimate, reference]) =>
    estimate === null || reference === null ? [] : [estimate - reference]
  )
  return {
    n: diffs.length,
    mae: mean(diffs.map(Math.abs)),
    bias: mean(diffs)
  }
}

/** Absolute P(doom) error in log-odds, or null when either side is missing. */
export function pdoomError(shown: number | null, reference: number | null) {
  return shown === null || reference === null
    ? null
    : Math.abs(logit(shown) - logit(reference))
}

/** Deterministic PRNG (mulberry32) so bootstrap intervals are reproducible. */
export function seededRandom(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296
  }
}

/** Percentile bootstrap 95% interval for the mean of paired differences. */
export function bootstrapCi(
  diffs: number[],
  { reps = 4000, seed = 7 }: { reps?: number; seed?: number } = {}
): [number, number] | null {
  if (!diffs.length) return null
  const random = seededRandom(seed)
  const resample = () =>
    diffs.reduce(
      (sum) => sum + diffs[Math.floor(random() * diffs.length)]!,
      0
    ) / diffs.length
  const means = Array.from({ length: reps }, resample).sort((a, b) => a - b)
  return [means[Math.floor(0.025 * reps)]!, means[Math.floor(0.975 * reps)]!]
}

/**
 * Retest variability across repeated interviews of the same persona: pooled
 * within-person SD and one-way ICC(1), as in the audit's retest analysis.
 */
export function retest(groups: number[][]) {
  const repeated = groups.filter((values) => values.length >= 2)
  if (repeated.length < 2) return null
  const size = mean(repeated.map((values) => values.length))!
  const grand = mean(repeated.flat())!
  const groupMean = (values: number[]) => mean(values)!
  const between =
    repeated.reduce(
      (sum, values) => sum + values.length * (groupMean(values) - grand) ** 2,
      0
    ) /
    (repeated.length - 1)
  const within =
    repeated.reduce(
      (sum, values) =>
        sum +
        values.reduce((inner, v) => inner + (v - groupMean(values)) ** 2, 0),
      0
    ) / repeated.reduce((sum, values) => sum + values.length - 1, 0)
  const denominator = between + (size - 1) * within
  return {
    personas: repeated.length,
    withinSd: Math.sqrt(within),
    icc: denominator > 0 ? (between - within) / denominator : null,
    maxRange: Math.max(
      ...repeated.map((values) => Math.max(...values) - Math.min(...values))
    )
  }
}
