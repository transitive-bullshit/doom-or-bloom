'use client'
import { useState } from 'react'
import { Map } from './worldview-map'
import { emptyComponent } from '@/lib/assessment/projections'
import { experimentalAxes } from '@/lib/assessment/worldview-experiment'
import type { MapPoint } from '@/lib/assessment/self-placement'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

const axis = experimentalAxes.transformation

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
        aria-valuetext={`${Math.round(current[key] * 100)} out of 100, from ${low} to ${high}`}
        className='accent-current'
      />
      <span className='flex justify-between text-xs text-muted-foreground'>
        <span>{low}</span>
        <span>{high}</span>
      </span>
    </label>
  )
  return (
    <section aria-label='Self-placement' className='flex flex-col gap-5'>
      <div>
        <h2>Your results are ready</h2>
        <p className='mt-2 text-pretty text-body-foreground'>
          Before you see them: where do you think you’ll land? Tap the map where
          you’d place yourself, or use the sliders.
        </p>
      </div>
      <Map
        horizontal={emptyComponent('outlook', 'Doom–Bloom')}
        vertical={emptyComponent('transformation', axis.label)}
        axis='transformation'
        layout='contained'
        pick={setGuess}
        guess={guess}
      />
      <div className='grid gap-5 sm:grid-cols-2'>
        {slider('x', 'Your outlook', 'Doom · worried', 'Bloom · hopeful')}
        {slider('y', 'How much AI will change the world', axis.low, axis.high)}
      </div>
      <div className='flex flex-wrap items-center gap-3'>
        <Button
          disabled={!guess || busy}
          onClick={() => guess && onSubmit(guess)}
        >
          {busy && <Spinner data-icon='inline-start' aria-hidden='true' />}
          Show where I landed
        </Button>
        <Button variant='ghost' disabled={busy} onClick={onSkip}>
          Skip
        </Button>
      </div>
      <p className='text-xs text-muted-foreground'>
        Your guess stays private with your assessment. Comparing guesses with
        results helps us check whether the map reads people fairly.
      </p>
    </section>
  )
}
