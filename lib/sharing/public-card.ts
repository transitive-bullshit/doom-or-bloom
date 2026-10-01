import 'server-only'
import { createHash } from 'node:crypto'
import { localizedPath, type Locale } from '@/i18n/config'
import type { Translator } from '@/i18n/translator'
import { loadPersonaComparisons } from '@/components/landing/data'
import type { loadPublished } from '@/lib/assessments/public-server'
import { shareCardRevision } from './card'
import { resultCardData } from './card-data'

export type PublicShareCard = Awaited<ReturnType<typeof publicShareCard>>

/** Everything that determines a published assessment's social card. */
export async function publicShareCard(
  saved: Awaited<ReturnType<typeof loadPublished>>,
  t: Translator
) {
  const result =
    saved.kind === 'simulation'
      ? saved.simulation.journey.result!
      : saved.assessment.result!
  return {
    data: resultCardData(result, await loadPersonaComparisons()),
    title:
      saved.kind === 'simulation'
        ? t('Cards.personTitle', { name: saved.profile.name }).slice(0, 64)
        : undefined,
    simulated: saved.kind === 'simulation'
  }
}

/**
 * Social networks cache previews by image URL, so any change to the rendered
 * card must produce a new URL. The image route itself ignores `v`. English
 * cards keep the unprefixed URL; other languages render under their prefix.
 */
export function publicShareCardPath(
  id: string,
  card: PublicShareCard,
  locale: Locale
) {
  const version = createHash('sha256')
    .update(JSON.stringify([shareCardRevision, card]))
    .digest('base64url')
    .slice(0, 12)
  return `${localizedPath(`/public/assessments/${id}/social-image.png`, locale)}?v=${version}`
}
