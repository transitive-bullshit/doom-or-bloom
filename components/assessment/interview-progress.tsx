'use client'
import { ChevronRightIcon, FlagIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from 'cn'
import type { Assessment } from '@/lib/assessment/schema'
import { autoStopFloor } from '@/lib/assessment/readiness'
import { eligible, promptLimit } from '@/lib/assessment/state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Both flag states share these overrides, so the pill keeps one size.
const flagClass =
  'inline-grid h-auto shrink-0 rounded-full border px-2 py-0.5 text-[11px] leading-none font-medium *:col-start-1 *:row-start-1 *:inline-flex *:items-center *:justify-center *:gap-1'

/**
 * Interview progress: one segment per answer up to the automatic-results
 * floor, ending in a Results flag. The engine decides follow-ups one at a time,
 * so their number is unknown; each one fills half of what remains of the last
 * segment, which stays short of full while questions keep coming.
 */
export function InterviewProgress({
  state,
  busy,
  onViewResults
}: {
  state: Assessment
  busy: boolean
  onViewResults: () => void
}) {
  const t = useTranslations('Interview')
  const answered = state.answers.length
  const core = autoStopFloor
  const followUp = answered >= core
  const ready = followUp && eligible(state)
  const ordinal = state.prompts.length
  const limit = promptLimit(state)
  const fills = Array.from({ length: core }, (_, i) =>
    i < core - 1
      ? Number(i < answered)
      : followUp
        ? 1 - 0.5 ** (answered - core + 1)
        : 0
  )
  // The segment the current question will fill.
  const active = Math.min(answered, core - 1)
  const label =
    ordinal >= limit - 2
      ? t('questionOf', { ordinal, limit })
      : followUp
        ? t('progress.followUp')
        : answered === 0
          ? t('progress.start', { total: core })
          : t('progress.question', { step: answered + 1, total: core })
  // Both labels share one grid cell, so the flag keeps its width and the
  // segments don't shrink when it turns into a button.
  const flag = (isReady: boolean) => (
    <>
      <FlagIcon className='size-3' aria-hidden='true' />
      {isReady ? t('progress.resultsReady') : t('progress.results')}
      {isReady && (
        <ChevronRightIcon className='-mr-0.5 size-3' aria-hidden='true' />
      )}
    </>
  )
  const percent = Math.round(
    (fills.reduce((sum, fill) => sum + fill, 0) / core) * 100
  )
  return (
    <div className='mb-5 flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <div
          role='progressbar'
          aria-label={t('progress.label')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={label}
          className='flex flex-1 gap-1.5'
        >
          {fills.map((fill, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 flex-1 overflow-hidden rounded-full bg-border',
                i === active && 'bg-primary/20',
                i === active && busy && 'animate-pulse bg-primary/40'
              )}
            >
              <span
                className='block h-full rounded-full bg-primary transition-[width] duration-500 ease-(--ease-out) motion-reduce:transition-none'
                style={{ width: `${fill * 100}%` }}
              />
            </span>
          ))}
        </div>
        {ready ? (
          <Button
            type='button'
            variant='ghost'
            size='xs'
            disabled={busy}
            onClick={onViewResults}
            className={cn(
              flagClass,
              'border-primary/40 text-foreground hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary'
            )}
          >
            <span>{flag(true)}</span>
            <span className='invisible' aria-hidden='true'>
              {flag(false)}
            </span>
          </Button>
        ) : (
          <Badge
            variant='outline'
            className={cn(flagClass, 'text-muted-foreground')}
          >
            <span>{flag(false)}</span>
            <span className='invisible' aria-hidden='true'>
              {flag(true)}
            </span>
          </Badge>
        )}
      </div>
      <p className='text-xs text-muted-foreground'>{label}</p>
    </div>
  )
}
