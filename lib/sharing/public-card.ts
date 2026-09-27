import 'server-only'
import { createHash } from 'node:crypto'
import { loadPersonaComparisons } from '@/components/landing/data'
import type { loadPublished } from '@/lib/assessments/public-server'
import { shareCardRevision } from './card'
import { resultCardData } from './card-data'

export type PublicShareCard = Awaited<ReturnType<typeof publicShareCard>>

/** Everything that determines a published assessment's social card. */
export async function publicShareCard(
  saved: Awaited<ReturnType<typeof loadPublished>>
) {
  const result =
    saved.kind === 'simulation'
      ? saved.simulation.journey.result!
      : saved.assessment.result!
  return {
    data: resultCardData(result, await loadPersonaComparisons()),
    title:
      saved.kind === 'simulation'
        ? `${saved.profile.name}’s AI worldview`.slice(0, 64)
        : undefined,
    simulated: saved.kind === 'simulation'
  }
}

/**
 * Social networks cache previews by image URL, so any change to the rendered
 * card must produce a new URL. The image route itself ignores `v`.
 */
export function publicShareCardPath(id: string, card: PublicShareCard) {
  const version = createHash('sha256')
    .update(JSON.stringify([shareCardRevision, card]))
    .digest('base64url')
    .slice(0, 12)
  return `/public/assessments/${id}/social-image.png?v=${version}`
}
