'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Map } from './worldview-map'
import { emptyComponent } from '@/lib/assessment/projections'
import { experimentalAxes } from '@/lib/assessment/worldview-experiment'
import type { MapPoint } from '@/lib/assessment/self-placement'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

/** Asks where participants expect to land before their result is revealed. */
export function SelfPlacement({
  busy,
  onSubmit,
  onSkip
}: {
  busy: boolean
  onSubmit: (guess: MapPoint) => void
  onSkip: () => void
}) {
  const t = useTranslations('Placement')
  const map = useTranslations('Map')
  const [guess, setGuess] = useState<MapPoint | null>(null)
  const current = guess ?? { x: 0.5, y: 0.5 }
  const slider = (
    key: keyof MapPoint,
    label: string,
    low: string,
    high: string
  ) => (
    <label className='flex flex-col gap-2 text-sm'>
      <span className='font-medium'>{label}</span>
      <input
        type='range'
        min={0}
        max={100}
        value={Math.round(current[key] * 100)}
        onChange={(event) =>
          setGuess({ ...current, [key]: Number(event.target.value) / 100 })
        }
        aria-valuetext={t('sliderValue', {
          value: Math.round(current[key] * 100),
          low,
          high
        })}
        className='accent-current'
      />
      <span className='flex justify-between text-xs text-muted-foreground'>
        <span>{low}</span>
        <span>{high}</span>
      </span>
    </label>
  )
  return (
    <section aria-label={t('label')} className='flex flex-col gap-5'>
      <div>
        <h2>{t('title')}</h2>
        <p className='mt-2 text-pretty text-body-foreground'>{t('intro')}</p>
      </div>
      <Map
        horizontal={emptyComponent('outlook', 'Doom–Bloom')}
        vertical={emptyComponent(
          'transformation',
          experimentalAxes.transformation.label
        )}
        axis='transformation'
        layout='contained'
        pick={setGuess}
        guess={guess}
      />
      <div className='grid gap-5 sm:grid-cols-2'>
        {slider('x', t('outlook'), t('outlookLow'), t('outlookHigh'))}
        {slider(
          'y',
          t('scale'),
          map('low', { axis: 'transformation' }),
          map('high', { axis: 'transformation' })
        )}
      </div>
      <div className='flex flex-wrap items-center gap-3'>
        <Button
          disabled={!guess || busy}
          onClick={() => guess && onSubmit(guess)}
        >
          {busy && <Spinner data-icon='inline-start' aria-hidden='true' />}
          {t('show')}
        </Button>
        <Button variant='ghost' disabled={busy} onClick={onSkip}>
          {t('skip')}
        </Button>
      </div>
      <p className='text-xs text-muted-foreground'>{t('privacy')}</p>
    </section>
  )
}
