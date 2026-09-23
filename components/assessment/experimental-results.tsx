'use client'

import { useState, type ReactNode } from 'react'
import { AnswerLink } from './answer-navigation'
import { ReasoningJudgments } from './reasoning-judgments'
import { ChevronDownIcon } from 'lucide-react'
import type { Result } from '@/lib/assessment/schema'
import { emptyComponent } from '@/lib/assessment/projections'
import { experimentalAxes } from '@/lib/assessment/worldview-experiment'
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

export function ExperimentalResults({
  result,
  history = [],
  layout = 'contained',
  excerpts = false,
  reasoningDetails,
  riskCompanion,
  subject
}: {
  result: Result
  excerpts?: boolean
  history?: Array<{ label: string; result: Result }>
  layout?: 'contained' | 'breakout'
  reasoningDetails?: ReactNode
  riskCompanion?: ReactNode
  subject?: ResultSubject
}) {
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
        />
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
              {risk?.source === 'public-statement' ? 'stated' : 'estimated'}{' '}
              P(doom)
            </CardTitle>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <p className='text-4xl font-semibold tracking-tight tabular-nums'>
              {risk?.token ?? (experiment ? 'Not specified' : 'Not evaluated')}
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
            <p className='text-sm text-body-foreground'>
              {!experiment
                ? 'This assessment has not been evaluated for a numerical catastrophe estimate.'
                : risk
                  ? risk.source === 'public-statement'
                    ? `Public statement from ${risk.publicStatement?.publishedAt}. This source-backed value replaces the simulated assessment estimate.`
                    : risk.source === 'inferred'
                      ? `Inferred from ${risk.basis === 'contextual' ? `${framing.possessive} broader worldview and priorities` : `the likelihood described in ${framing.answers}`}. Approximate interpretation range: ${risk.bounds?.map((value) => Math.round(value * 100)).join('–')}%. Applies to the outcome and conditions in ${framing.answers}; this is an inferred percentage.`
                      : `Copied from ${framing.answers}. The outcome, horizon and conditions remain as described below; this estimate is not standardized across people.`
                  : `There is not enough relevant evidence yet to estimate ${framing.possessive} view of catastrophic risk.`}
            </p>
            {risk?.publicStatement && (
              <div className='space-y-2 text-sm text-body-foreground'>
                <p>{risk.publicStatement.outcome}</p>
                <p>{risk.publicStatement.conditions}</p>
                <p>Horizon: {risk.publicStatement.horizon}</p>
                {risk.estimate === undefined && (
                  <p>
                    The dot marks the midpoint of the stated range, not a
                    separate forecast.
                  </p>
                )}
                <a
                  className='underline underline-offset-4'
                  href={risk.publicStatement.url}
                  target='_blank'
                  rel='noreferrer'
                >
                  {risk.publicStatement.title}
                </a>
              </div>
            )}
            {excerpts && risk?.text && (
              <blockquote className='border-l-2 pl-3 text-sm whitespace-pre-wrap'>
                {risk.text}
              </blockquote>
            )}
          </CardContent>
        </Card>
        {riskCompanion}
        {excerpts && (
          <Card>
            <CardHeader>
              <CardTitle>{framing.owner} milestone timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {experiment?.milestones.length ? (
                <ol className='flex flex-col gap-5 border-l-2 pl-5'>
                  {experiment.milestones.map((milestone) => (
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
              ) : (
                <p className='text-sm text-body-foreground'>
                  {experiment
                    ? 'No milestone timing was established. Dates, “not sure,” “possibly never,” and dependencies can all appear here when expressed.'
                    : 'Milestone timing has not been evaluated for this assessment.'}
                </p>
              )}
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
        reasoning={result.vertical}
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
