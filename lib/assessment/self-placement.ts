export type MapPoint = { x: number; y: number }

/**
 * The map point shown for a result. Like the results map, an experiment from
 * an earlier evidence revision is not shown, so that axis is unplaced.
 */
export function resultPoint(result: {
  evidenceRevision: number
  horizontal: { value: number | null }
  experiment?: {
    evidenceRevision: number
    transformation: { value: number | null }
  }
}): { x: number | null; y: number | null } {
  const experiment =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment
      : undefined
  return {
    x: result.horizontal.value,
    y: experiment?.transformation.value ?? null
  }
}

// Differences below this are within retest variation and read as agreement.
const tolerance = 0.1

/** Coarse distance for analytics; never the coordinates themselves. */
export function placementGap(guess: MapPoint, placed: MapPoint) {
  const distance = Math.hypot(placed.x - guess.x, placed.y - guess.y)
  return distance <= tolerance ? 'close' : distance <= 0.25 ? 'moderate' : 'far'
}

/**
 * Compares where participants placed themselves with where their answers
 * placed them, framed as something to inspect rather than a correction.
 */
export function placementComparison(
  guess: MapPoint,
  placed: { x: number | null; y: number | null }
) {
  if (placed.x === null || placed.y === null)
    return 'Your answers don’t place you on the map yet, so there’s nothing to compare with your guess.'
  const dx = placed.x - guess.x
  const dy = placed.y - guess.y
  const outlook =
    Math.abs(dx) > tolerance
      ? `read as more ${dx < 0 ? 'worried' : 'hopeful'} than you placed yourself`
      : null
  const scale =
    Math.abs(dy) > tolerance
      ? `suggest you expect ${dy > 0 ? 'more' : 'less'} change than you placed yourself`
      : null
  if (!outlook && !scale) return 'Close to where you placed yourself.'
  const difference =
    outlook && scale
      ? `${outlook}, and ${scale.replace(' than you placed yourself', '')}`
      : (outlook ?? scale)
  return `Your answers ${difference}. Both can be true: the dot reflects what you wrote, not a verdict.`
}
