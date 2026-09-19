'use client'
import type { Assessment } from '@/lib/assessment/schema'
import { evidenceReadiness } from '@/lib/assessment/readiness'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

export function ReadinessMeter({
  state,
  debug
}: {
  state: Assessment
  debug: boolean
}) {
  const readiness = evidenceReadiness(state)
  const percentage = Math.round(readiness.value)
  return (
    <section
      className='rounded-xl border bg-card p-4'
      aria-label='Evidence readiness'
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='text-sm font-medium'>
          Evidence readiness{' '}
          <span className='ml-2 text-muted-foreground tabular-nums'>
            {percentage}%
          </span>
        </p>
        {readiness.ready && (
          <Badge variant='secondary'>Provisional result available</Badge>
        )}
      </div>
      <div
        className='relative mt-3 h-2.5 rounded-full bg-muted'
        role='meter'
        aria-label='Evidence readiness'
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={`${percentage}% evidence readiness; broad coverage guide ${readiness.threshold}%`}
      >
        <div
          className='h-full rounded-full bg-primary'
          style={{ width: `${readiness.value}%` }}
        />
        <span
          className='absolute -top-1 h-4.5 w-0.5 bg-foreground'
          style={{ left: `${readiness.threshold}%` }}
          aria-hidden='true'
        />
      </div>
      <p className='mt-3 text-xs leading-relaxed text-muted-foreground'>
        {readiness.ready
          ? 'You can view a first result now, or keep answering to refine it.'
          : `A first result is available once your central outlook and its basis are clear, or broad evidence coverage reaches ${readiness.threshold}%. One answer can be enough.`}
      </p>
      {debug && (
        <Collapsible className='mt-2'>
          <CollapsibleTrigger asChild>
            <Button variant='link' size='sm' className='h-auto px-0 text-xs'>
              How readiness is calculated · debug
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className='mt-2 text-xs leading-relaxed text-muted-foreground'>
            {readiness.covered} of {readiness.total} dimensions have supported
            evidence. Each contributes its probability of supported evidence;
            unresolved ambiguity or tension halves that contribution. All
            dimensions have equal weight. Missing evidence adds zero and
            repeated evidence adds no weight. A well-supported central outlook
            and its basis can qualify before the broad coverage guide. This is a
            draft coverage heuristic, not forecast accuracy, scientific
            certainty or reasoning quality. At 100%, all tracked dimensions have
            clear evidence with maximal interpretation confidence; further
            clarification may still change the result.
          </CollapsibleContent>
        </Collapsible>
      )}
    </section>
  )
}
