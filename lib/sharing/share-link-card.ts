import 'server-only'
import { createHash } from 'node:crypto'
import { localizedPath, type Locale } from '@/i18n/config'
import { loadPersonaComparisons } from '@/components/landing/data'
import { shareCardRevision, type CardData } from './card'
import { shareLinkPath, type PublicShareLink } from './share-links'

/**
 * The stored card, keeping only thought leaders still in the catalog: the
 * link outlives catalog changes, and the renderer rejects unknown people.
 */
export async function shareLinkCard(link: PublicShareLink): Promise<CardData> {
  const known = new Set((await loadPersonaComparisons()).map(({ id }) => id))
  return {
    ...link.card,
    closestPersonaIds: link.card.closestPersonaIds.filter((id) => known.has(id))
  }
}

/**
 * The card image URL. Social networks cache previews by image URL, so the
 * version changes with the card design; the stored card itself never changes.
 */
export function shareLinkImagePath(link: PublicShareLink, locale: Locale) {
  const version = createHash('sha256')
    .update(JSON.stringify([shareCardRevision, link.card]))
    .digest('base64url')
    .slice(0, 12)
  return `${localizedPath(`${shareLinkPath(link.id)}/social-image.png`, locale)}?v=${version}`
}
