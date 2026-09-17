'use client'

import { memo, useMemo, useState } from 'react'
import type {
  Assessment,
  DebugStage,
  DebugTrace
} from '@/lib/assessment/schema'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JsonViewer } from './json-viewer'

const stagePurposes = {
  A: 'Interpret the current answer and check relevance before proceeding.',
  B1: 'Identify which shortlisted references the participant actually invokes.',
  B2: 'Check those references against their canonical source summaries.',
  C: 'Judge the benefits of eligible authored follow-up questions. Code chooses the next question.',
  D: 'Assess result dimensions. Code calculates coordinates, ranges and findings.'
} as const

const StageView = memo(function StageView({
  stage,
  fixture
}: {
  stage: DebugStage
  fixture: boolean
}) {
  const [open, setOpen] = useState(true)
  const exchanges = useMemo(
    () =>
      stage.requests?.map((request) => ({
        ...request,
        body: {
          state: stage.state,
          model: request.model,
          questions: Object.fromEntries(
            request.questionIds.map((id) => [id, stage.questions[id]])
          )
        }
      })),
    [stage]
  )
  const stageRequest = useMemo(
    () => ({
      state: stage.state,
      model: stage.model,
      questions: stage.questions
    }),
    [stage]
  )
  const stageResponse = useMemo(
    () => ({ model: stage.model, answers: stage.answers, usage: stage.usage }),
    [stage]
  )
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='min-w-0 rounded-xl border bg-background p-4 sm:p-6'
    >
      <CollapsibleTrigger asChild>
        <Button
          variant='ghost'
          className='h-auto w-full justify-between gap-3 px-0 text-left whitespace-normal'
        >
          <span className='font-medium'>{stage.name}</span>
          <span className='text-xs text-muted-foreground'>
            {open ? 'Hide stage' : 'Show stage'}
          </span>
        </Button>
      </CollapsibleTrigger>
      <p className='mt-2 text-sm text-muted-foreground'>
        {
          Object.entries(stagePurposes).find(
            ([id]) => id === stage.name.split(':')[0]
          )?.[1]
        }
      </p>
      <p className='mt-2 text-xs text-muted-foreground'>
        {Object.keys(stage.questions).length} independent judgments ·{' '}
        {stage.elapsedMs.toLocaleString('en-US')} ms ·{' '}
        {fixture
          ? 'Fixture; no Jev request'
          : `${stage.attempts} physical request${stage.attempts === 1 ? '' : 's'}`}{' '}
        · {stage.usage.input_tokens.toLocaleString('en-US')} input /{' '}
        {stage.usage.output_tokens.toLocaleString('en-US')} output tokens
      </p>
      <CollapsibleContent>
        {open && (
          <div className='mt-5 flex min-w-0 flex-col gap-6'>
            {!fixture && exchanges ? (
              exchanges.map((exchange) => (
                <section
                  key={exchange.attempt}
                  className='flex min-w-0 flex-col gap-3'
                >
                  <h4 className='text-sm font-medium'>
                    Physical request {exchange.attempt} ·{' '}
                    {exchange.status === null
                      ? 'No HTTP response'
                      : `HTTP ${exchange.status}`}{' '}
                    · {exchange.elapsedMs} ms
                  </h4>
                  <p className='text-xs text-muted-foreground'>
                    Request body sent to Jev. Shared state plus this batch’s
                    questions; authentication headers are excluded.
                  </p>
                  <JsonViewer
                    value={exchange.body}
                    label={`${stage.name} request ${exchange.attempt}`}
                  />
                  <h5 className='text-sm font-medium'>
                    Validated Jev response
                  </h5>
                  {exchange.response ? (
                    <JsonViewer
                      value={exchange.response}
                      label={`${stage.name} response ${exchange.attempt}`}
                    />
                  ) : (
                    <p className='text-sm text-muted-foreground'>
                      No validated response for this attempt. Error bodies are
                      omitted; retries appear as separate requests.
                    </p>
                  )}
                </section>
              ))
            ) : (
              <>
                <h4 className='text-sm font-medium'>
                  {fixture
                    ? 'Fixture input'
                    : 'Stage input before SDK batching'}
                </h4>
                <p className='text-xs text-muted-foreground'>
                  {fixture
                    ? 'Synthetic local evaluation; this body was not sent to Jev.'
                    : 'This older trace has no per-request records. The adapter may split these questions across physical requests.'}
                </p>
                <JsonViewer
                  value={stageRequest}
                  label={`${stage.name} stage input`}
                />
                <h4 className='text-sm font-medium'>
                  {fixture
                    ? 'Synthetic fixture response'
                    : 'Merged validated stage response'}
                </h4>
                <JsonViewer
                  value={stageResponse}
                  label={`${stage.name} stage response`}
                />
              </>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
})

export function DebugPanel({
  trace,
  assessment,
  provider
}: {
  trace?: DebugTrace
  assessment: Assessment
  provider: 'live' | 'fixture'
}) {
  const [open, setOpen] = useState(false)
  const localState = useMemo(
    () => ({
      counters: {
        prompts: assessment.prompts.length,
        substantive: assessment.answers.length,
        recovery: assessment.recovery
      },
      versions: assessment.versions,
      coverage: assessment.coverage,
      support: assessment.evidence,
      judgments: assessment.judgments
    }),
    [
      assessment.prompts.length,
      assessment.answers.length,
      assessment.recovery,
      assessment.versions,
      assessment.coverage,
      assessment.evidence,
      assessment.judgments
    ]
  )
  return (
    <section className='mt-8 border-t pt-6'>
      <Badge variant='outline'>Debug mode</Badge>
      <Collapsible open={open} onOpenChange={setOpen} className='mt-3'>
        <CollapsibleTrigger asChild>
          <Button variant='outline'>Jev / assessment debugging details</Button>
        </CollapsibleTrigger>
        <CollapsibleContent
          className='relative left-1/2 mt-4 w-[calc(100vw-3rem)] max-w-[1440px] -translate-x-1/2'
          data-slot='debug-content'
        >
          {open && (
            <div className='flex min-w-0 flex-col gap-6'>
              <div className='space-y-2 text-sm text-muted-foreground'>
                <p>
                  Additional debugging details. These may include your answers.
                </p>
                <p>
                  The app uses several stages, rather than one all-purpose
                  request. Questions within a stage are independent; later
                  stages can use earlier results. Large stages may be batched
                  into multiple physical requests.
                </p>
                <p>
                  Request <code>state</code> holds shared context.{' '}
                  <code>questions</code> refer to that context by ID or field
                  name. Responses contain typed judgments, rather than generated
                  explanations. Support now links whole answers; no passage
                  candidates are selected or repeated in criteria.
                </p>
              </div>
              <section className='flex min-w-0 flex-col gap-4'>
                <h3 className='font-medium'>
                  Latest operation: inputs and responses
                </h3>
                {trace ? (
                  <>
                    <p className='text-xs text-muted-foreground'>
                      {trace.requestId} · revision {trace.baseRevision} ·{' '}
                      {trace.elapsedMs.toLocaleString('en-US')} ms
                    </p>
                    {trace.stages.length === 0 && (
                      <p className='text-sm text-muted-foreground'>
                        This operation made no inference requests.
                      </p>
                    )}
                    {trace.stages.map((stage, index) => (
                      <StageView
                        key={`${trace.requestId}:${index}`}
                        stage={stage}
                        fixture={provider === 'fixture'}
                      />
                    ))}
                  </>
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    No transient request/response trace is available. Traces are
                    not saved across reloads; saved judgments remain below.
                  </p>
                )}
              </section>
              {trace && (
                <section className='space-y-3'>
                  <h3 className='font-medium'>Local control-flow decisions</h3>
                  <p className='text-sm text-muted-foreground'>
                    Calculated by application code after interpreting the
                    responses. This is not a Jev response.
                  </p>
                  <JsonViewer
                    value={trace.decisions}
                    label='Local control-flow decisions JSON'
                  />
                </section>
              )}
              <section className='space-y-3'>
                <h3 className='font-medium'>Saved assessment state</h3>
                <p className='text-sm text-muted-foreground'>
                  Local counters, coverage, answer-level support and stored
                  judgments. This object is not sent wholesale to Jev.
                </p>
                <JsonViewer
                  value={localState}
                  label='Saved assessment state JSON'
                />
              </section>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
