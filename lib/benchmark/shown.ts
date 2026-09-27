import { presentPdoom } from '@/lib/assessment/present-result'
import type { Result } from '@/lib/assessment/schema'
import { resultPlacement } from '@/lib/assessments/feedback'

/** What a participant is shown for a result: the map point and P(doom). */
export type Shown = {
  x: number | null
  y: number | null
  pdoom: number | null
  pdoomToken: string | null
  pdoomSource: string | null
  insufficient: boolean
}

// Like the results page, an experiment from an earlier evidence revision is
// not shown, so its axis and P(doom) are unplaced.
export function shownResult(result: Result): Shown {
  const pdoom =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? presentPdoom(result.experiment.pdoom)
      : null
  return {
    ...resultPlacement(result),
    pdoom: pdoom?.estimate ?? null,
    pdoomToken: pdoom?.token ?? null,
    pdoomSource: pdoom?.source ?? null,
    insufficient: result.insufficient
  }
}
