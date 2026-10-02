import type { Translator } from '@/i18n/translator'

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

// A difference this large on either axis offers one optional question about
// it: 27% of 219 self-placements on September 29
// (docs/research/engine-design-review-2026-09-29.md).
const placementQuestionGap = 0.25
// The authored prompts carry the same text (checked by content validation),
// so the display layer shows their translation by prompt ID.
export const placementQuestions = {
  'placement.more-hopeful':
    'You placed yourself as more hopeful than your answers suggest. What gives you hope that we missed?',
  'placement.more-worried':
    'You placed yourself as more worried than your answers suggest. What worries you that we missed?',
  'placement.more-change':
    'You expect more change than your answers showed. What’s the biggest change you see coming?',
  'placement.less-change':
    'Your answers suggest bigger changes than you expect. What do you think will stay the same?'
} as const
export type PlacementQuestionId = keyof typeof placementQuestions

/**
 * The one question offered when a self-placement and its placed result differ
 * by more than `placementQuestionGap` on an axis. The larger difference wins;
 * an unplaced result has nothing to compare.
 */
export function placementQuestion(
  guess: MapPoint,
  placed: { x: number | null; y: number | null }
) {
  if (placed.x === null || placed.y === null) return null
  const dx = guess.x - placed.x
  const dy = guess.y - placed.y
  if (Math.max(Math.abs(dx), Math.abs(dy)) <= placementQuestionGap) return null
  const id: PlacementQuestionId =
    Math.abs(dx) >= Math.abs(dy)
      ? dx > 0
        ? 'placement.more-hopeful'
        : 'placement.more-worried'
      : dy > 0
        ? 'placement.more-change'
        : 'placement.less-change'
  return { id, text: placementQuestions[id] }
}

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
  t: Translator,
  guess: MapPoint,
  placed: { x: number | null; y: number | null }
) {
  if (placed.x === null || placed.y === null)
    return t('Placement.comparison.unplaced')
  const dx = placed.x - guess.x
  const dy = placed.y - guess.y
  const outlook =
    Math.abs(dx) > tolerance ? (dx < 0 ? 'worried' : 'hopeful') : null
  const scale = Math.abs(dy) > tolerance ? (dy > 0 ? 'more' : 'less') : null
  if (outlook && scale)
    return t(
      `Placement.comparison.${outlook}${scale === 'more' ? 'More' : 'Less'}`
    )
  if (outlook ?? scale) return t(`Placement.comparison.${(outlook ?? scale)!}`)
  return t('Placement.comparison.close')
}
