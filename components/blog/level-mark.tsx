import type { scorecardLevels } from '@/lib/blog/schema'

export type ScorecardLevel = (typeof scorecardLevels)[number]

/** A Harvey ball: full, half, empty, or a dash when the criterion doesn't apply. */
export function LevelMark({
  level,
  highlight
}: {
  level: ScorecardLevel
  highlight?: boolean
}) {
  const color = highlight ? 'var(--chart-coral)' : 'var(--foreground)'
  if (level === 'na')
    return (
      <svg aria-hidden viewBox='0 0 16 16' className='size-4 shrink-0'>
        <line
          x1='4'
          x2='12'
          y1='8'
          y2='8'
          stroke='var(--muted-foreground)'
          strokeWidth='2'
          strokeLinecap='round'
        />
      </svg>
    )
  return (
    <svg aria-hidden viewBox='0 0 16 16' className='size-4 shrink-0'>
      <circle
        cx='8'
        cy='8'
        r='6.5'
        fill={level === 'yes' ? color : 'var(--card)'}
        stroke={color}
        strokeWidth='1.5'
      />
      {level === 'partly' && (
        <path d='M8 1.5 A6.5 6.5 0 0 0 8 14.5 Z' fill={color} />
      )}
    </svg>
  )
}
