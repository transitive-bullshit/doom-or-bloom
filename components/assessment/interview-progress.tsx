'use client'
// Prototype progress indicators for the interview, selected with
// `?progress=bar|steps|range|dock`. Exploration only: the copy is English and
// the default (`current`) leaves the shipped interview unchanged.
import { useEffect, useState } from 'react'
import { CheckIcon, FlagIcon } from 'lucide-react'
import type { Assessment } from '@/lib/assessment/schema'
import { autoStopFloor } from '@/lib/assessment/readiness'
import { eligible, promptLimit } from '@/lib/assessment/state'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'

const progressVariants = ['current', 'bar', 'steps', 'range', 'dock'] as const
type ProgressVariant = (typeof progressVariants)[number]

export function useProgressVariant(): ProgressVariant {
  const [variant, setVariant] = useState<ProgressVariant>('current')
  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get('progress')
    const match = progressVariants.find((item) => item === value)
    if (match) queueMicrotask(() => setVariant(match))
  }, [])
  return variant
}

// Most participants see results after 4–6 answers (production, Sept 28–Oct 4).
const usualResults = { from: autoStopFloor, to: 6 }

function progress(state: Assessment, busy: boolean) {
  const answered = state.answers.length
  // While an answer is being read, count it so the indicator moves on submit.
  const counted = answered + (busy ? 1 : 0)
  const core = autoStopFloor
  return {
    answered,
    counted,
    core,
    step: answered + 1,
    followUp: answered >= core,
    followUpNumber: answered - core + 1,
    remaining: Math.max(0, core - answered),
    ready: eligible(state),
    limit: promptLimit(state),
    ordinal: state.prompts.length
  }
}

type Props = {
  variant: Exclude<ProgressVariant, 'current'>
  state: Assessment
  busy: boolean
  onViewResults: () => void
}

/** The line above the question heading. */
export function InterviewProgressInline(props: Props) {
  const { variant } = props
  if (variant === 'steps') return <Steps {...props} />
  if (variant === 'range') return <Range {...props} />
  return <Label {...props} />
}

/** Viewport-fixed parts: the top hairline (`bar`) or bottom dock (`dock`). */
export function InterviewProgressFixed(props: Props) {
  if (props.variant === 'bar') return <TopBar {...props} />
  if (props.variant === 'dock') return <Dock {...props} />
  return null
}

function ResultsLink({
  onViewResults,
  busy,
  children
}: {
  onViewResults: () => void
  busy: boolean
  children: React.ReactNode
}) {
  return (
    <Button
      type='button'
      variant='link'
      className='h-auto p-0 text-xs font-medium underline'
      disabled={busy}
      onClick={onViewResults}
    >
      {children}
    </Button>
  )
}

function Label({ state, busy, onViewResults }: Props) {
  const p = progress(state, false)
  return (
    <p className='mb-5 text-xs text-muted-foreground'>
      {p.followUp ? (
        <>
          Follow-up question
          {p.ready && (
            <>
              {' · '}Your results are ready{' · '}
              <ResultsLink onViewResults={onViewResults} busy={busy}>
                See them now
              </ResultsLink>
            </>
          )}
        </>
      ) : (
        <>
          Question {p.step} of {p.core}
          {p.answered === 0 && ' · about 3 minutes'}
        </>
      )}
    </p>
  )
}

function TopBar({ state, busy }: Props) {
  const p = progress(state, busy)
  const value = Math.min(p.counted, p.core) / p.core
  return (
    <div
      role='progressbar'
      aria-label='Interview progress'
      aria-valuemin={0}
      aria-valuemax={p.core}
      aria-valuenow={Math.min(p.answered, p.core)}
      className='fixed inset-x-0 top-0 z-50 h-1 bg-border/70'
    >
      <div
        className='h-full bg-primary transition-[width] duration-500 ease-(--ease-out) motion-reduce:transition-none'
        style={{ width: `${Math.max(value * 100, 1.5)}%` }}
      />
    </div>
  )
}

function Steps({ state, busy, onViewResults }: Props) {
  const p = progress(state, busy)
  const followUps = Math.max(0, p.answered - p.core + 1)
  return (
    <div className='mb-5 flex flex-col gap-2'>
      <div
        className='flex items-center gap-1.5'
        role='progressbar'
        aria-label='Interview progress'
        aria-valuemin={0}
        aria-valuemax={p.core}
        aria-valuenow={Math.min(p.answered, p.core)}
      >
        {Array.from({ length: p.core }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full bg-border transition-colors duration-300',
              i < p.answered && 'bg-primary',
              i === p.answered && busy && 'animate-pulse bg-primary/50',
              i === p.answered && !busy && 'bg-primary/25'
            )}
          />
        ))}
        <span
          className={cn(
            'ml-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-none',
            p.followUp && p.ready
              ? 'border-primary bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          )}
        >
          {p.followUp && p.ready ? (
            <CheckIcon className='size-3' aria-hidden='true' />
          ) : (
            <FlagIcon className='size-3' aria-hidden='true' />
          )}
          Results
        </span>
        {followUps > 0 &&
          Array.from({ length: followUps }, (_, i) => (
            <span
              key={`f${i}`}
              className={cn(
                'size-1.5 shrink-0 rounded-full',
                i < followUps - 1 ? 'bg-primary' : 'bg-primary/25'
              )}
            />
          ))}
      </div>
      <p className='text-xs text-muted-foreground'>
        {p.followUp ? (
          <>
            Follow-up {p.followUpNumber}
            {p.ready && (
              <>
                {' · '}Optional, your results are ready{' · '}
                <ResultsLink onViewResults={onViewResults} busy={busy}>
                  See them now
                </ResultsLink>
              </>
            )}
          </>
        ) : (
          <>
            Question {p.step} of {p.core}
            {p.answered === 0 && ' · about 3 minutes'}
          </>
        )}
      </p>
    </div>
  )
}

function Range({ state, busy, onViewResults }: Props) {
  const p = progress(state, false)
  const ticks = Array.from({ length: p.limit }, (_, i) => i + 1)
  const inZone = (n: number) => n >= usualResults.from && n <= usualResults.to
  return (
    <div className='mb-5 flex flex-col gap-2'>
      <div
        className='relative flex items-center justify-between gap-1 py-2'
        role='progressbar'
        aria-label='Interview progress'
        aria-valuemin={1}
        aria-valuemax={p.limit}
        aria-valuenow={p.ordinal}
        aria-valuetext={`Question ${p.ordinal} of up to ${p.limit}`}
      >
        <span
          aria-hidden='true'
          className='absolute inset-y-0 rounded-md bg-primary/8'
          style={{
            left: `calc(${((usualResults.from - 1) / (p.limit - 1)) * 100}% - 0.5rem)`,
            width: `calc(${((usualResults.to - usualResults.from) / (p.limit - 1)) * 100}% + 1rem)`
          }}
        />
        {ticks.map((n) => (
          <span
            key={n}
            className={cn(
              'relative z-10 rounded-full transition-colors',
              n === p.ordinal
                ? 'size-3 bg-primary ring-4 ring-primary/15'
                : n < p.ordinal
                  ? 'size-1.5 bg-primary'
                  : inZone(n)
                    ? 'size-1.5 bg-primary/35'
                    : 'size-1.5 bg-border'
            )}
          />
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>
        {p.followUp && p.ready ? (
          <>
            Question {p.ordinal} · Your results are ready{' · '}
            <ResultsLink onViewResults={onViewResults} busy={busy}>
              See them now
            </ResultsLink>
          </>
        ) : (
          <>
            Question {p.ordinal} · most people see results after{' '}
            {usualResults.from}–{usualResults.to}
          </>
        )}
      </p>
    </div>
  )
}

function Dock({ state, busy, onViewResults }: Props) {
  const p = progress(state, busy)
  return (
    <div className='fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75'>
      <div className='content-column flex min-h-14 items-center justify-between gap-4 py-2'>
        <div className='flex min-w-0 items-center gap-3'>
          <div
            className='flex w-20 shrink-0 gap-1'
            role='progressbar'
            aria-label='Interview progress'
            aria-valuemin={0}
            aria-valuemax={p.core}
            aria-valuenow={Math.min(p.answered, p.core)}
          >
            {Array.from({ length: p.core }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full bg-border',
                  i < p.counted && 'bg-primary',
                  i === p.answered && busy && 'animate-pulse'
                )}
              />
            ))}
          </div>
          <p className='truncate text-xs text-muted-foreground'>
            {p.followUp ? (
              p.ready ? (
                <>
                  Results ready
                  <span className='hidden sm:inline'>
                    {' · '}follow-ups are optional
                  </span>
                </>
              ) : (
                `Follow-up ${p.followUpNumber}`
              )
            ) : p.remaining === 1 ? (
              'Last question before your results'
            ) : (
              `${p.remaining} questions to your results`
            )}
          </p>
        </div>
        {p.followUp && p.ready && (
          <Button
            type='button'
            size='sm'
            disabled={busy}
            onClick={onViewResults}
          >
            See my results
          </Button>
        )}
      </div>
    </div>
  )
}
