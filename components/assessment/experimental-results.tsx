'use client'

import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import type { ExperimentQuote, Result } from '@/lib/assessment/schema'
import { emptyComponent } from '@/lib/assessment/projections'
import { experimentalAxes } from '@/lib/assessment/worldview-experiment'
import { Map } from './worldview-map'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@/components/ui/collapsible'

function Source({ quote }: { quote: ExperimentQuote }) {
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <Button variant='link' size='sm' className='px-0'>
          Answer {quote.answerNumber} · exact wording
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <blockquote className='border-l-2 pl-3 text-sm whitespace-pre-wrap text-muted-foreground'>
          {quote.text}
        </blockquote>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function ExperimentalResults({
  result,
  history = [],
  layout = 'contained'
}: {
  result: Result
  history?: Array<{ label: string; result: Result }>
  layout?: 'contained' | 'breakout'
}) {
  const experiment =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment
      : undefined
  const risk = experiment?.pdoom
  return (
    <section
      aria-label='Experimental worldview visualizations'
      className={
        layout === 'breakout'
          ? 'flex flex-col gap-5 lg:relative lg:left-1/2 lg:w-[min(80rem,calc(100vw-4rem))] lg:-translate-x-1/2'
          : 'flex min-w-0 flex-col gap-5'
      }
    >
      <div className='flex flex-wrap items-center gap-2'>
        <Badge variant='outline'>Worldview experiments</Badge>
        <span className='text-xs text-muted-foreground'>
          Two ways to read the same outlook
        </span>
      </div>
      {!experiment && (
        <p className='text-sm text-muted-foreground'>
          These experimental interpretations were not recorded for this
          snapshot. The maps remain unplaced until new evidence is evaluated;
          older reasoning scores are not reused.
        </p>
      )}
      <div className='grid min-w-0 gap-5 xl:grid-cols-2'>
        {(['influence', 'transformation'] as const).map((axis) => (
          <div key={axis} className='flex min-w-0 flex-col gap-2'>
            <Map
              horizontal={result.horizontal}
              vertical={
                experiment?.[axis] ??
                emptyComponent(axis, experimentalAxes[axis].label)
              }
              axis={axis}
              layout='contained'
              history={history.map((item) => ({
                x: item.result.horizontal.value,
                y: item.result.experiment?.[axis].value ?? null,
                label: item.label
              }))}
            />
            {experiment?.axisEvidence[axis] && (
              <Source quote={experiment.axisEvidence[axis]} />
            )}
          </div>
        ))}
      </div>
      <div className='grid min-w-0 gap-5 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Your estimated P(doom)</CardTitle>
            <CardDescription>
              Catastrophic risk, separate from overall outlook
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <p className='text-4xl font-semibold tracking-tight tabular-nums'>
              {risk?.token ?? (experiment ? 'Not specified' : 'Not evaluated')}
            </p>
            {risk?.bounds && (
              <div>
                <div
                  aria-hidden='true'
                  className='relative h-3 rounded-full bg-muted'
                >
                  <div
                    className='absolute h-3 min-w-0.5 rounded-full bg-primary'
                    style={{
                      left: `${risk.bounds[0] * 100}%`,
                      width: `${(risk.bounds[1] - risk.bounds[0]) * 100}%`
                    }}
                  />
                </div>
                <div className='mt-2 flex justify-between text-xs text-muted-foreground'>
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
            <p className='text-sm text-muted-foreground'>
              {!experiment
                ? 'This saved snapshot has not been evaluated for a numerical catastrophe estimate.'
                : risk
                  ? risk.source === 'inferred'
                    ? `Inferred from ${risk.basis === 'contextual' ? 'your broader worldview and priorities' : 'the likelihood you described'}. Approximate interpretation range: ${risk.bounds?.map((value) => Math.round(value * 100)).join('–')}%. Applies to the outcome and conditions in your answers; this is not a percentage you stated.`
                    : 'Copied from your answer. The outcome, horizon and conditions remain as you described them below; this estimate is not standardized across people.'
                  : 'There is not enough relevant evidence yet to estimate your view of catastrophic risk.'}
            </p>
            {risk?.text && (
              <blockquote className='border-l-2 pl-3 text-sm whitespace-pre-wrap'>
                {risk.text}
              </blockquote>
            )}
            {risk && (
              <p className='text-xs text-muted-foreground'>
                {risk.answerNumber
                  ? `Answer ${risk.answerNumber}`
                  : 'Based on your answer history'}{' '}
                ·{' '}
                {risk.source === 'inferred'
                  ? 'Inferred estimate · interpretation range, not a statistical confidence interval.'
                  : 'Stated estimate · a stated range is not an evaluator margin of error.'}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your milestone timeline</CardTitle>
            <CardDescription>
              Timing, dependencies and unknowns in your own words
            </CardDescription>
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
                    <p className='text-sm whitespace-pre-wrap text-muted-foreground'>
                      {milestone.evidence.text}
                    </p>
                    <span className='text-xs text-muted-foreground'>
                      Answer {milestone.evidence.answerNumber}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className='text-sm text-muted-foreground'>
                {experiment
                  ? 'No milestone timing was established. Dates, “not sure,” “possibly never,” and dependencies can all appear here when expressed.'
                  : 'Milestone timing has not been evaluated for this saved snapshot.'}
              </p>
            )}
            <p className='mt-4 text-xs text-muted-foreground'>
              Grouped by milestone, not spaced or ordered by inferred dates. AGI
              and superhuman AI retain your definitions.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>What your outlook hinges on</CardTitle>
          <CardDescription>
            Statements worth exploring next · reflection prompts, not a
            reasoning grade
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-5 md:grid-cols-3'>
          {experiment?.hinges.length ? (
            experiment.hinges.map((hinge) => (
              <div key={hinge.id} className='flex flex-col gap-3'>
                <p className='text-sm font-semibold'>{hinge.label}</p>
                <blockquote className='border-l-2 pl-3 text-sm whitespace-pre-wrap text-muted-foreground'>
                  {hinge.evidence.text}
                </blockquote>
                <p className='text-xs text-muted-foreground'>
                  Answer {hinge.evidence.answerNumber}
                </p>
                <p className='text-sm font-medium'>{hinge.question}</p>
              </div>
            ))
          ) : (
            <p className='text-sm text-muted-foreground'>
              {experiment
                ? 'No specific assumption, unresolved question or update condition was selected yet. Missing discussion is not a reasoning weakness.'
                : 'Assumptions and update conditions have not been evaluated for this saved snapshot.'}
            </p>
          )}
        </CardContent>
      </Card>
      {experiment && (
        <p className='text-xs text-muted-foreground'>
          Experimental interpretation · {experiment.version} ·{' '}
          {experiment.model}. Exact excerpts preserve participant wording;
          selections and map ranges remain provisional interpretations.
        </p>
      )}
    </section>
  )
}

export function JourneyResultExplorer({
  snapshots
}: {
  snapshots: Array<{ label: string; result: Result }>
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
            <p className='mt-2 text-sm text-muted-foreground'>
              Choose an answer to compare both maps and all three experiments at
              that point. Numbered dots show earlier placed answers.
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
            result={snapshot.result}
            history={snapshots.slice(0, index)}
          />
        </section>
      </CollapsibleContent>
    </Collapsible>
  )
}
