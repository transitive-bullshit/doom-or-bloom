import type { Result } from '@/lib/assessment/schema'
import { presentResult, unclearToken } from '@/lib/assessment/present-result'
import { worldviewValues } from '@/lib/assessment/persona-matches'
import { resultPoint } from '@/lib/assessment/self-placement'
import type { ComparedWorldview } from './compare'
import type { PublicShareLink } from './share-links'

/** A share link's public comparison data: no answers, no assessment ID. */
export function shareLinkComparison(link: PublicShareLink): ComparedWorldview {
  const token = link.card.pdoomToken
  return {
    kind: 'snapshot',
    name: link.name,
    values: link.comparison.values,
    map: link.comparison.map,
    pdoom:
      token && token !== unclearToken
        ? { token, source: link.comparison.pdoomSource }
        : null,
    closestPersonaIds: link.card.closestPersonaIds
  }
}

/** A simulated user's displayed point, values and P(doom). */
export function personaComparison(person: {
  name: string
  slug: string
  avatar: string
  result: Result
}): ComparedWorldview {
  const result = presentResult(person.result)
  const pdoom =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment.pdoom
      : null
  return {
    kind: 'persona',
    name: person.name,
    slug: person.slug,
    avatar: person.avatar,
    values: worldviewValues(result),
    map: resultPoint(result),
    pdoom:
      pdoom?.token && pdoom.token !== unclearToken
        ? { token: pdoom.token, source: pdoom.source ?? null }
        : null,
    closestPersonaIds: []
  }
}
