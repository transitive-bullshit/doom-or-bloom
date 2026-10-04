// Pure geometry shared by the blog charts (components/blog), kept here so the
// unit tests can check it. Positions are shares of a track, from 0 to 1.

/** Where a value sits on a linear scale, clamped to the track. */
export function linearShare(value: number, min: number, max: number) {
  return Math.min(1, Math.max(0, (value - min) / (max - min)))
}

/**
 * Where a probability sits on a log scale. Values below `min`, such as a
 * stated "≈0%", sit at the left edge and are flagged so a chart can mark them
 * as off the scale.
 */
export function logShare(value: number, min: number, max: number) {
  if (value <= min) return { share: 0, below: value < min }
  if (value >= max) return { share: 1, below: false }
  return { share: Math.log(value / min) / Math.log(max / min), below: false }
}

const time = (date: string) => Date.parse(`${date}T00:00:00Z`)

/** Where a YYYY-MM-DD date sits between two others. */
export function dateShare(date: string, from: string, to: string) {
  return linearShare(time(date), time(from), time(to))
}

/** January 1 of each year inside the axis, for year ticks. */
export function yearTicks(from: string, to: string) {
  const first = Number(from.slice(0, 4)) + (from.endsWith('-01-01') ? 0 : 1)
  const last = Number(to.slice(0, 4))
  return Array.from({ length: Math.max(0, last - first + 1) }, (_, index) => {
    const year = first + index
    return { year, date: `${year}-01-01` }
  })
}

/** Keeps every nth tick, always the first, so labels never crowd. */
export function thinTicks<Tick>(ticks: readonly Tick[], most: number) {
  if (ticks.length <= most) return [...ticks]
  const step = Math.ceil(ticks.length / most)
  return ticks.filter((_, index) => index % step === 0)
}

/** The index of the share nearest a target share. */
export function nearestIndex(shares: readonly number[], target: number) {
  let best = 0
  for (let index = 1; index < shares.length; index++)
    if (Math.abs(shares[index]! - target) < Math.abs(shares[best]! - target))
      best = index
  return best
}

/** Distinct dates across series, in order. */
export function unionDates(series: { points: { date: string }[] }[]) {
  return [
    ...new Set(series.flatMap((entry) => entry.points.map((p) => p.date)))
  ].toSorted()
}
