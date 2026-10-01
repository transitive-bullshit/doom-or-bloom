'use client'
import { CheckCircle2Icon, CircleIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Assessment } from '@/lib/assessment/schema'
import { autoStopFloor, evidenceReadiness } from '@/lib/assessment/readiness'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

export function ReadinessMeter({
  state,
  debug,
  disabled,
  onViewResults
}: {
  state: Assessment
  debug: boolean
  disabled: boolean
  onViewResults: () => void
}) {
  const t = useTranslations('Interview.readiness')
  const readiness = evidenceReadiness(state)
  const { map } = readiness
  // Saved assessments without map judgments show what the earlier rule knew.
  const items = [
    {
      label: t('outlook'),
      done: map.known ? map.outlook : readiness.hasOutlook
    },
    { label: t('scale'), done: map.scale },
    { label: t('risk'), done: map.risk }
  ]
  return (
    <section className='rounded-xl border bg-card p-4' aria-label={t('title')}>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='text-sm font-medium'>{t('title')}</p>
        {readiness.ready && <Badge variant='secondary'>{t('available')}</Badge>}
      </div>
      <ul className='mt-3 flex flex-col gap-2 text-sm'>
        {items.map((item) => (
          <li key={item.label} className='flex items-center gap-2'>
            {item.done ? (
              <CheckCircle2Icon
                className='size-4 shrink-0 text-primary'
                aria-hidden='true'
              />
            ) : (
              <CircleIcon
                className='size-4 shrink-0 text-muted-foreground'
                aria-hidden='true'
              />
            )}
            <span
              className={
                item.done ? 'text-foreground' : 'text-muted-foreground'
              }
            >
              {item.label}
              <span className='sr-only'>
                {item.done ? t('clear') : t('pending')}
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className='mt-3 text-xs leading-relaxed text-muted-foreground'>
        {readiness.ready ? (
          <>
            {t.rich('ready', {
              link: (chunks) => (
                <Button
                  type='button'
                  variant='link'
                  className='h-auto p-0 text-xs underline'
                  disabled={disabled}
                  onClick={onViewResults}
                >
                  {chunks}
                </Button>
              )
            })}
            {state.answers.length < autoStopFloor &&
              ` ${t('autoStop', { count: autoStopFloor })}`}
          </>
        ) : (
          t('waiting')
        )}
      </p>
      {debug && (
        <Collapsible className='mt-2'>
          <CollapsibleTrigger asChild>
            <Button variant='link' size='sm' className='h-auto px-0 text-xs'>
              How readiness is calculated · debug
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className='mt-2 text-xs leading-relaxed text-muted-foreground'>
            Results unlock when the latest routing or result judgments place the
            outlook (level mass at least 0.7) and the scale of change (level or
            explicit-unknown mass at least 0.5); P(doom) is best effort.
            Automatic results also wait for {autoStopFloor} accepted answers.
            Assessments saved before these judgments existed use the earlier
            coverage rule. Evidence coverage is {Math.round(readiness.value)}%:{' '}
            {readiness.covered} of {readiness.total} dimensions have supported
            evidence. Coverage guides follow-up questions; it is not forecast
            accuracy or reasoning quality.
          </CollapsibleContent>
        </Collapsible>
      )}
    </section>
  )
}
