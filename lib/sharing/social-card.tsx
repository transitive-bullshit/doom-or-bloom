import type { Result } from '@/lib/assessment/schema'
import { Plot, type CardData } from './card'

export const socialImageOptions = {
  width: 1200,
  height: 630,
  format: 'webp',
  quality: 90,
  emoji: 'from-font'
} as const

export function socialCardData(result: Result): CardData {
  return {
    closestPersonaIds: [],
    horizontal: result.horizontal.value,
    horizontalRange: result.horizontal.range,
    vertical: result.vertical.value,
    verticalRange: result.vertical.range,
    transformation: result.experiment?.transformation.value ?? null,
    transformationRange: result.experiment?.transformation.range ?? [0, 1],
    transformationInterpretation:
      result.experiment?.transformation.interpretation,
    provisional: result.provisional
  }
}

export function SocialCard({
  person,
  assessment,
  points
}: {
  assessment?: { title: string; result: Result }
  person?: {
    name: string
    description: string
    result: Result
    portrait: string
  }
  points?: { x: number; y: number; portrait: string }[]
}) {
  const title = person
    ? `${person.name}’s AI worldview`
    : (assessment?.title ?? 'How will AI change our future?')
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
          {person
            ? 'SIMULATED AI WORLDVIEW'
            : assessment
              ? 'AI WORLDVIEW ASSESSMENT'
              : 'THE AI WORLDVIEW MAP'}
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
          data={
            person
              ? socialCardData(person.result)
              : assessment
                ? socialCardData(assessment.result)
                : undefined
          }
          pointLabel={
            person ? 'Simulated' : assessment ? 'Assessment' : undefined
          }
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
            {person
              ? person.description
              : assessment
                ? 'One perspective on our AI future'
                : 'Where do you land?'}
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.45, color: '#b5bbc5' }}>
            {person
              ? 'Based on public sources. A simulation, not their own assessment.'
              : assessment
                ? 'A participant’s answers and inferred results. An experimental interpretation, not a prediction.'
                : 'Explore the map. Then map your AI worldview, one question at a time.'}
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
              ? 'No placement yet · Dashed area: interpretation range'
              : person.result.experiment.transformation.interpretation ===
                  'unsettled'
                ? 'Point: center of unresolved range · Dashed area: interpretation range'
                : 'Point: estimated placement · Dashed area: interpretation range'
            : assessment
              ? 'Dashed area: interpretation range'
              : 'Public perspectives. Many possible futures.'}
        </span>
        <span>doom-or-bloom.com</span>
      </div>
    </div>
  )
}
