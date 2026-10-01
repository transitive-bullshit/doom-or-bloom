'use client'

import { useState, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { languageTag } from '@/i18n/config'
import { AnswerLink } from './answer-navigation'
import { ReasoningJudgments } from './reasoning-judgments'
import { ChevronDownIcon } from 'lucide-react'
import type { Result } from '@/lib/assessment/schema'
import { emptyComponent } from '@/lib/assessment/projections'
import { experimentalAxes } from '@/lib/assessment/worldview-experiment'
import {
  pdoomRangeLabel,
  pdoomTokenLabel,
  presentResult,
  unclearToken
} from '@/lib/assessment/present-result'
import {
  hingeLabel,
  hingeQuestion,
  milestoneLabel
} from '@/lib/assessment/display-text'
import type { MapPoint } from '@/lib/assessment/self-placement'
import { subjectArgs, type ResultSubject } from '@/lib/sharing/result-subject'
import { AxisRange } from './axis-range'
import { Map } from './worldview-map'
import { WorldviewDetails } from './worldview-details'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@/components/ui/collapsible'

// Horizons such as "Not specified" add nothing; long ones keep their lead clause.
const namedHorizon = (horizon: string) =>
  /^(no |not |unspecified)/iu.test(horizon.trim())
    ? null
    : horizon.split(/[;,]/u)[0]!.trim()
const monthYear = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(date))

export function ExperimentalResults({
  result: saved,
  history = [],
  layout = 'contained',
  excerpts = false,
  reasoningDetails,
  riskCompanion,
  subject,
  guess,
  others,
  mapNote,
  feedback,
  share
}: {
  result: Result
  excerpts?: boolean
  history?: Array<{ label: string; result: Result }>
  layout?: 'contained' | 'breakout'
  reasoningDetails?: ReactNode
  riskCompanion?: ReactNode
  subject?: ResultSubject
  guess?: MapPoint | null
  others?: Array<MapPoint & { label: string; avatar?: string }>
  mapNote?: ReactNode
  feedback?: ReactNode
  share?: ReactNode
}) {
  const root = useTranslations()
  const t = useTranslations('Results')
  const tag = languageTag(useLocale())
  const result = presentResult(saved)
  const experiment =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment
      : undefined
  const risk = experiment?.pdoom
  const who = subjectArgs(subject)
  const range = risk?.bounds
    ? ` ${t('pdoom.range', { range: pdoomRangeLabel(root, risk.bounds) })}`
    : ''
  return (
    <section
      aria-label={t('label', who)}
      className={
        layout === 'breakout'
          ? 'flex flex-col gap-5 lg:relative lg:left-1/2 lg:w-[min(80rem,calc(100vw-4rem))] lg:-translate-x-1/2'
          : 'flex min-w-0 flex-col gap-5'
      }
    >
      {!experiment && (
        <p className='text-sm text-body-foreground'>{t('notRecorded')}</p>
      )}
      <div className='flex min-w-0 flex-col gap-2'>
        <Map
          subject={subject}
          horizontal={result.horizontal}
          vertical={
            experiment?.transformation ??
            emptyComponent(
              'transformation',
              experimentalAxes.transformation.label
            )
          }
          axis='transformation'
          layout='contained'
          history={history.map((item) => ({
            x: item.result.horizontal.value,
            y: item.result.experiment?.transformation.value ?? null,
            label: item.label
          }))}
          guess={guess}
          others={others}
        />
        {mapNote}
      </div>
      <div
        className={
          excerpts || riskCompanion
            ? 'grid min-w-0 gap-5 lg:grid-cols-2'
            : 'grid min-w-0 gap-5'
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {risk?.source === 'public-statement'
                ? t('statedPdoomTitle', who)
                : t('pdoomTitle', who)}
              {risk?.source === 'inferred' && (
                <span className='font-normal text-muted-foreground'>
                  {' '}
                  {t('inferredTag')}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <p className='text-4xl font-semibold tracking-tight tabular-nums'>
              {risk?.token
                ? pdoomTokenLabel(root, risk.token)
                : experiment
                  ? t('notEstimated')
                  : t('notEvaluated')}
            </p>
            {risk?.bounds && (
              <div>
                <AxisRange
                  range={risk.bounds}
                  value={risk.estimate ?? (risk.bounds[0] + risk.bounds[1]) / 2}
                />
                <div className='mt-2 flex justify-between text-xs text-muted-foreground'>
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
            {risk?.publicStatement ? (
              <div className='flex flex-col gap-2 text-sm text-body-foreground'>
                {risk.publicStatement.quote && (
                  <blockquote className='border-l-2 pl-3'>
                    “{risk.publicStatement.quote}”
                  </blockquote>
                )}
                <p>
                  {[
                    risk.publicStatement.outcome,
                    namedHorizon(risk.publicStatement.horizon)
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                <p className='text-muted-foreground'>
                  <a
                    className='underline underline-offset-4'
                    href={risk.publicStatement.url}
                    target='_blank'
                    rel='noreferrer'
                  >
                    {risk.publicStatement.title}
                  </a>
                  {' · '}
                  {monthYear(risk.publicStatement.publishedAt, tag)}
                </p>
              </div>
            ) : (
              <p className='text-sm text-body-foreground'>
                {!experiment
                  ? t('pdoom.notEvaluated')
                  : risk
                    ? risk.source === 'inferred' && risk.token === unclearToken
                      ? `${t('pdoom.bothWays', who)}${range}${subject ? '' : ` ${t('pdoom.settle')}`}`
                      : risk.source === 'inferred'
                        ? `${t('pdoom.inferred', who)}${range}${!subject && risk.basis === 'contextual' ? ` ${t('pdoom.sharpen')}` : ''}`
                        : subject
                          ? t('pdoom.from', who)
                          : t('pdoom.stated', { token: risk.token ?? '' })
                    : `${t('pdoom.missing', who)}${subject ? '' : ` ${t('pdoom.addSentence')}`}`}
              </p>
            )}
            {excerpts && risk?.text && !risk.publicStatement && (
              <blockquote className='border-l-2 pl-3 text-sm whitespace-pre-wrap'>
                {risk.text}
              </blockquote>
            )}
          </CardContent>
        </Card>
        {riskCompanion}
        {feedback && <div className='lg:col-span-2'>{feedback}</div>}
        {share && <div className='lg:col-span-2'>{share}</div>}
        {excerpts && Boolean(experiment?.milestones.length) && (
          <Card>
            <CardHeader>
              <CardTitle>{t('milestoneTitle', who)}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className='flex flex-col gap-5 border-l-2 pl-5'>
                {experiment?.milestones.map((milestone) => (
                  <li
                    key={milestone.id}
                    className='relative flex flex-col gap-2'
                  >
                    <span
                      aria-hidden='true'
                      className='absolute top-1 -left-[1.7rem] size-3 rounded-full border-2 border-background bg-primary'
                    />
                    <p className='text-sm font-semibold'>
                      {milestoneLabel(root, milestone)}
                    </p>
                    <p className='text-sm whitespace-pre-wrap text-body-foreground'>
                      {milestone.evidence.text}
                    </p>
                    <AnswerLink number={milestone.evidence.answerNumber} />
                  </li>
                ))}
              </ol>
              <p className='mt-4 text-xs text-muted-foreground'>
                {t('milestoneNote', who)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      {excerpts && (
        <Card>
          <CardHeader>
            <CardTitle>{t('hingesTitle', who)}</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-x-5 gap-y-3 md:grid-cols-3'>
            {experiment?.hinges.length ? (
              experiment.hinges.map((hinge) => (
                <div
                  key={hinge.id}
                  className='row-span-4 grid grid-rows-subgrid gap-3'
                >
                  <p className='text-sm font-semibold'>
                    {hingeLabel(root, hinge)}
                  </p>
                  <blockquote className='border-l-2 pl-3 text-sm whitespace-pre-wrap text-body-foreground'>
                    {hinge.evidence.text}
                  </blockquote>
                  <AnswerLink number={hinge.evidence.answerNumber} />
                  <p className='text-sm font-medium'>
                    {hingeQuestion(root, hinge, subject)}
                  </p>
                </div>
              ))
            ) : (
              <p className='text-sm text-body-foreground'>
                {experiment ? t('noHinges') : t('hingesNotEvaluated')}
              </p>
            )}
          </CardContent>
        </Card>
      )}
      <WorldviewDetails
        subject={subject}
        transformationClaim={experiment?.transformation.claim}
        components={result.components}
        influence={
          experiment?.influence ??
          emptyComponent('influence', experimentalAxes.influence.label)
        }
      />
      {excerpts &&
        (reasoningDetails ??
          (result.components.some(
            (component) => component.reasoningEvidence
          ) && (
            <section
              aria-label={t('reasoningLabel')}
              className='flex flex-col gap-3'
            >
              <h3>{t('reasoningTitle')}</h3>
              <ReasoningJudgments components={result.components} />
            </section>
          )))}
    </section>
  )
}

export function JourneyResultExplorer({
  snapshots,
  subject
}: {
  snapshots: Array<{ label: string; result: Result }>
  subject?: ResultSubject
}) {
  const t = useTranslations('Results.explorer')
  const [selected, setSelected] = useState<number | null>(null)
  const index = Math.min(selected ?? snapshots.length - 1, snapshots.length - 1)
  const snapshot = snapshots[index]
  if (!snapshot) return null
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant='outline' className='group w-full justify-between'>
          {t('toggle')}
          <ChevronDownIcon
            data-icon='inline-end'
            className='group-data-[state=open]:rotate-180'
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <section aria-label={t('label')} className='flex flex-col gap-5 pt-5'>
          <div>
            <p className='mt-2 text-sm text-body-foreground'>
              {t('description')}
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <label
              htmlFor='journey-result-step'
              className='text-sm font-medium'
            >
              {t('step', { label: snapshot.label })}
            </label>
            <input
              id='journey-result-step'
              className='min-w-0 flex-1 accent-current'
              type='range'
              min={0}
              max={snapshots.length - 1}
              value={index}
              onChange={(event) => setSelected(Number(event.target.value))}
              aria-valuetext={t('step', { label: snapshot.label })}
            />
            <Button
              variant='outline'
              size='sm'
              disabled={index === 0}
              onClick={() => setSelected(index - 1)}
            >
              {t('previous')}
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={index === snapshots.length - 1}
              onClick={() => setSelected(index + 1)}
            >
              {t('next')}
            </Button>
          </div>
          <ExperimentalResults
            excerpts
            subject={subject}
            result={snapshot.result}
            history={snapshots.slice(0, index)}
          />
        </section>
      </CollapsibleContent>
    </Collapsible>
  )
}
