'use client'

import { useState, type ReactNode } from 'react'
import { AnswerLink } from './answer-navigation'
import { ReasoningJudgments } from './reasoning-judgments'
import { ChevronDownIcon } from 'lucide-react'
import type { Result } from '@/lib/assessment/schema'
import { emptyComponent } from '@/lib/assessment/projections'
import { experimentalAxes } from '@/lib/assessment/worldview-experiment'
import { pdoomRangeLabel, presentResult } from '@/lib/assessment/present-result'
import type { MapPoint } from '@/lib/assessment/self-placement'
import { resultFraming, type ResultSubject } from '@/lib/sharing/result-subject'
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
const monthYear = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
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
  mapNote,
  feedback
}: {
  result: Result
  excerpts?: boolean
  history?: Array<{ label: string; result: Result }>
  layout?: 'contained' | 'breakout'
  reasoningDetails?: ReactNode
  riskCompanion?: ReactNode
  subject?: ResultSubject
  guess?: MapPoint | null
  mapNote?: ReactNode
  feedback?: ReactNode
}) {
  const result = presentResult(saved)
  const experiment =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment
      : undefined
  const risk = experiment?.pdoom
  const framing = resultFraming(subject)
  return (
    <section
      aria-label={framing.resultsLabel}
      className={
        layout === 'breakout'
          ? 'flex flex-col gap-5 lg:relative lg:left-1/2 lg:w-[min(80rem,calc(100vw-4rem))] lg:-translate-x-1/2'
          : 'flex min-w-0 flex-col gap-5'
      }
    >
      {!experiment && (
        <p className='text-sm text-body-foreground'>
          These experimental interpretations were not recorded for this
          snapshot. The map remains unplaced until new evidence is evaluated;
          older reasoning scores are not reused.
        </p>
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
              {framing.owner}{' '}
              {risk?.source === 'public-statement'
                ? 'stated P(doom)'
                : 'P(doom)'}
              {risk?.source === 'inferred' && (
                <span className='font-normal text-muted-foreground'>
                  {' '}
                  · inferred
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <p className='text-4xl font-semibold tracking-tight tabular-nums'>
              {risk?.token ??
                (experiment ? 'Not estimated yet' : 'Not evaluated')}
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
                  {monthYear(risk.publicStatement.publishedAt)}
                </p>
              </div>
            ) : (
              <p className='text-sm text-body-foreground'>
                {!experiment
                  ? 'Not evaluated for this assessment.'
                  : risk
                    ? risk.source === 'inferred' && risk.token === 'Unclear'
                      ? `${subject ? 'These answers' : 'Your answers'} read both ways, so there is no single number.${risk.bounds ? ` Plausible range: ${pdoomRangeLabel(risk.bounds)}.` : ''}${subject ? '' : ' A rough number in your own words would settle it.'}`
                      : risk.source === 'inferred'
                        ? `Inferred from ${framing.answers}, not a number ${subject ? 'they' : 'you'} gave.${risk.bounds ? ` Plausible range: ${pdoomRangeLabel(risk.bounds)}.` : ''}${!subject && risk.basis === 'contextual' ? ' A rough number in your own words would sharpen it.' : ''}`
                        : subject
                          ? `From ${framing.answers}.`
                          : `You said ${risk.token}.`
                    : `Not enough about catastrophic risk in ${framing.answers} to estimate it.${subject ? '' : ' A sentence about how likely you think it is would add one.'}`}
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
        {excerpts && Boolean(experiment?.milestones.length) && (
          <Card>
            <CardHeader>
              <CardTitle>{framing.owner} milestone timeline</CardTitle>
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
                    <p className='text-sm font-semibold'>{milestone.label}</p>
                    <p className='text-sm whitespace-pre-wrap text-body-foreground'>
                      {milestone.evidence.text}
                    </p>
                    <AnswerLink number={milestone.evidence.answerNumber} />
                  </li>
                ))}
              </ol>
              <p className='mt-4 text-xs text-muted-foreground'>
                Grouped by milestone, not spaced or ordered by inferred dates.
                AGI and superhuman AI retain {framing.possessive} definitions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      {excerpts && (
        <Card>
          <CardHeader>
            <CardTitle>What {framing.possessive} outlook hinges on</CardTitle>
          </CardHeader>
          <CardContent className='grid gap-x-5 gap-y-3 md:grid-cols-3'>
            {experiment?.hinges.length ? (
              experiment.hinges.map((hinge) => (
                <div
                  key={hinge.id}
                  className='row-span-4 grid grid-rows-subgrid gap-3'
                >
                  <p className='text-sm font-semibold'>{hinge.label}</p>
                  <blockquote className='border-l-2 pl-3 text-sm whitespace-pre-wrap text-body-foreground'>
                    {hinge.evidence.text}
                  </blockquote>
                  <AnswerLink number={hinge.evidence.answerNumber} />
                  <p className='text-sm font-medium'>
                    {framing.hingeQuestion(hinge)}
                  </p>
                </div>
              ))
            ) : (
              <p className='text-sm text-body-foreground'>
                {experiment
                  ? 'No specific assumption, unresolved question or update condition was selected yet. Missing discussion is not a reasoning weakness.'
                  : 'Assumptions and update conditions have not been evaluated for this assessment.'}
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
          emptyComponent('influence', 'Human influence')
        }
      />
      {excerpts &&
        (reasoningDetails ??
          (result.components.some(
            (component) => component.reasoningEvidence
          ) && (
            <section
              aria-label='Reasoning judgments'
              className='flex flex-col gap-3'
            >
              <h3>Reasoning judgments to inspect</h3>
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
  const [selected, setSelected] = useState<number | null>(null)
  const index = Math.min(selected ?? snapshots.length - 1, snapshots.length - 1)
  const snapshot = snapshots[index]
  if (!snapshot) return null
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant='outline' className='group w-full justify-between'>
          Watch the worldview develop
          <ChevronDownIcon
            data-icon='inline-end'
            className='group-data-[state=open]:rotate-180'
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <section
          aria-label='Worldview progression'
          className='flex flex-col gap-5 pt-5'
        >
          <div>
            <p className='mt-2 text-sm text-body-foreground'>
              Choose an answer to see the map and supporting results at that
              point. Numbered dots show earlier placed answers.
            </p>
          </div>
          <div className='flex flex-wrap items-center gap-3'>
            <label
              htmlFor='journey-result-step'
              className='text-sm font-medium'
            >
              After answer {snapshot.label}
            </label>
            <input
              id='journey-result-step'
              className='min-w-0 flex-1 accent-current'
              type='range'
              min={0}
              max={snapshots.length - 1}
              value={index}
              onChange={(event) => setSelected(Number(event.target.value))}
              aria-valuetext={`After answer ${snapshot.label}`}
            />
            <Button
              variant='outline'
              size='sm'
              disabled={index === 0}
              onClick={() => setSelected(index - 1)}
            >
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={index === snapshots.length - 1}
              onClick={() => setSelected(index + 1)}
            >
              Next
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
