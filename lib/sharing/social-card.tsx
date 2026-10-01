import type { Translator } from '@/i18n/translator'
import { resultCardData } from './card-data'
import type { Result } from '@/lib/assessment/schema'
import { Plot, type CardData } from './card'

export const socialImageOptions = {
  width: 1200,
  height: 630,
  format: 'png',
  emoji: 'from-font'
} as const

export function socialCardData(result: Result): CardData {
  return resultCardData(result)
}

export function SocialCard({
  t,
  person,
  points
}: {
  t: Translator
  person?: {
    name: string
    description: string
    result: Result
    portrait: string
  }
  points?: { x: number; y: number; portrait: string }[]
}) {
  const title = person
    ? t('Cards.personTitle', { name: person.name })
    : t('Cards.siteTitle')
  const displayTitle = title.length > 64 ? `${title.slice(0, 61)}…` : title
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#161613',
        color: '#f6f5f1',
        padding: 42,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'sans-serif'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: '#b5bbc5',
          fontSize: 18
        }}
      >
        <span>DOOM OR BLOOM</span>
        <span>
          {person ? t('Cards.simulatedKicker') : t('Cards.mapKicker')}
        </span>
      </div>
      <div
        style={{
          fontSize: title.length > 44 ? 32 : 48,
          fontWeight: 700,
          letterSpacing: -1.5,
          marginTop: 20,
          lineClamp: 1,
          height: 58,
          flexShrink: 0,
          overflow: 'hidden'
        }}
      >
        {displayTitle}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 34,
          marginTop: 14
        }}
      >
        <Plot
          t={t}
          data={person ? socialCardData(person.result) : undefined}
          pointLabel={person ? t('Cards.simulated') : undefined}
          points={points}
          portrait={person?.portrait}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: 340,
            gap: 26
          }}
        >
          <div style={{ fontSize: 27, lineHeight: 1.3, fontWeight: 600 }}>
            {person ? person.description : t('Cards.whereLand')}
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.45, color: '#b5bbc5' }}>
            {person ? t('Cards.personNote') : t('Cards.siteNote')}
          </div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 15,
          color: '#b5bbc5',
          marginTop: 'auto'
        }}
      >
        <span>
          {person
            ? person.result.horizontal.value == null ||
              person.result.experiment?.transformation.value == null
              ? t('Cards.noPlacement')
              : person.result.experiment.transformation.interpretation ===
                  'unsettled'
                ? t('Cards.centerUnresolved')
                : t('Cards.estimatedPlacement')
            : t('Cards.siteFooter')}
        </span>
        <span>doom-or-bloom.com</span>
      </div>
    </div>
  )
}
