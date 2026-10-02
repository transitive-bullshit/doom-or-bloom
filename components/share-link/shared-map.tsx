'use client'
import { Map } from '@/components/assessment/worldview-map'
import { emptyComponent } from '@/lib/assessment/projections'
import type { CardData } from '@/lib/sharing/card'

/**
 * A share link's map: the card's point and ranges, nothing else. The page's
 * heading names the sharer; a shared point is labeled “Their view”.
 */
export function SharedMap({ card }: { card: CardData }) {
  return (
    <Map
      axis='transformation'
      layout='contained'
      subject={{ name: '', possessivePronoun: 'their', kind: 'shared' }}
      horizontal={{
        ...emptyComponent('outlook', 'Doom–Bloom'),
        value: card.horizontal,
        range: card.horizontalRange
      }}
      vertical={{
        ...emptyComponent('transformation', 'Scale of transformation'),
        value: card.transformation ?? null,
        range: card.transformationRange ?? [0, 1],
        interpretation: card.transformationInterpretation
      }}
    />
  )
}
