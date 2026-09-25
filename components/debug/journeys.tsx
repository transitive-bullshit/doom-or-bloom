'use client'

import { useEffect, useState } from 'react'
import { people } from '@/components/landing/people'
import { ResourceList } from '@/components/assessment/resource-list'
import type { ResultSubject } from '@/lib/sharing/result-subject'
import { ChevronDown } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@/components/ui/collapsible'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption
} from '@/components/ui/table'
import { Message, MessageContent, MessageHeader } from '@/components/ui/message'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { JsonViewer } from '@/components/debug/json-viewer'
import { ReviewHeader } from '@/components/debug/content/shared'
import {
  ExperimentalResults,
  JourneyResultExplorer
} from '@/components/assessment/experimental-results'
import type { DimensionDefinition } from '@/lib/debug/json-help'
import type { Persona } from '@/lib/journeys/catalog'
import { recordedBackgroundSchema } from '@/lib/journeys/schema'
import { questionSteps } from '@/lib/journeys/schema'
import type { Journey, JourneyStep, RunIndex } from '@/lib/journeys/schema'

const percent = (value: number) => `${value.toFixed(1)}%`

function Disclosure({
  label,
  children,
  wide = false
}: {
  label: string
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <Collapsible className='min-w-0'>
      <CollapsibleTrigger asChild>
        <Button variant='outline' size='sm'>
          <ChevronDown data-icon='inline-start' />
          {label}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent
        className={cn(
          'mt-4 flex min-w-0 flex-col gap-4',
          wide && 'result-breakout'
        )}
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

function Answer({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <Message align='end'>
      <MessageContent>
        <MessageHeader>Simulated participant</MessageHeader>
        <Bubble variant='secondary' className='max-w-full sm:max-w-[90%]'>
          <BubbleContent>
            <p
              className={cn(
                'whitespace-pre-wrap wrap-anywhere',
                !expanded && text.length > 650 && 'line-clamp-5'
              )}
            >
              {text}
            </p>
            {text.length > 650 && (
              <Button
                variant='link'
                size='sm'
                className='self-start px-0'
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Show less' : 'Read full answer'}
              </Button>
            )}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}

function Step({
  step,
  mode,
  dimensions,
  subject
}: {
  step: JourneyStep
  mode: RunIndex['mode']
  subject?: ResultSubject
  dimensions: DimensionDefinition[]
}) {
  const label = (id: string) => dimensions.find((d) => d.id === id)?.label ?? id
  const winner = step.rankings[0]
  const selected = step.nextPrompt
  return (
    <li className='min-w-0' data-slot='journey-step'>
      <Card>
        <CardHeader>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline'>Step {step.ordinal}</Badge>
            <Badge variant='secondary'>{step.operation}</Badge>
            <span className='text-xs text-muted-foreground'>
              {step.prompt.promptId} · {step.prompt.family}
            </span>
          </div>
          <CardTitle className='text-lg'>
            {step.operation === 'answer'
              ? step.prompt.text
              : step.operation === 'retry'
                ? 'Resume after paperclips'
                : step.operation === 'project'
                  ? 'Generate the provisional result'
                  : step.operation === 'clarify'
                    ? 'Clarify a result interpretation'
                    : 'Continue the interview'}
          </CardTitle>
          <CardDescription>
            {step.operation === 'answer'
              ? `${step.disposition ?? 'Unclassified'} · ${step.scriptKey ?? (mode === 'live' ? 'generated participant' : 'recovery phrase')} · ${step.status}`
              : step.status}
          </CardDescription>
        </CardHeader>
        <CardContent className='flex min-w-0 flex-col gap-5'>
          {step.answer && <Answer text={step.answer} />}

          <div className='flex flex-col gap-2'>
            <div className='flex flex-wrap justify-between gap-2 text-sm'>
              <span>
                Evidence readiness{' '}
                <span className='text-muted-foreground'>
                  {percent(step.readinessBefore.value)}
                </span>{' '}
                to{' '}
                <strong className='tabular-nums'>
                  {percent(step.readiness.value)}
                </strong>
              </span>
              <span className='text-xs text-muted-foreground'>
                {step.readiness.covered}/{step.readiness.total} supported
                dimensions · coverage guide {step.readiness.threshold}%
              </span>
            </div>
            <div
              role='meter'
              aria-label={`Step ${step.ordinal} evidence readiness`}
              aria-valuenow={Math.round(step.readiness.value)}
              aria-valuemin={0}
              aria-valuemax={100}
              className='relative h-2 rounded-full bg-muted'
            >
              <div
                className='h-full rounded-full bg-primary'
                style={{ width: `${step.readiness.value}%` }}
              />
              <span
                className='absolute -top-1 h-4 w-0.5 bg-foreground'
                style={{ left: `${step.readiness.threshold}%` }}
                aria-hidden='true'
              />
            </div>
            <p className='text-xs text-muted-foreground'>
              {Math.abs(step.readiness.value - step.readinessBefore.value) <
                0.05 && step.disposition === 'usable'
                ? 'No measurable coverage gain. Review whether this question elicited a new claim or repeated existing evidence; compare its result and routing decisions below.'
                : step.readiness.ready
                  ? 'A provisional result is available. Further questions depend on their expected value.'
                  : 'More supported coverage is needed. Uncertainty and missing positions remain explicit.'}
            </p>
          </div>
          {step.coverageAdded.length > 0 && (
            <p className='text-sm'>
              <span className='text-muted-foreground'>Newly covered: </span>
              {step.coverageAdded.map(label).join(', ')}.
            </p>
          )}
          {step.paperclips && (
            <Alert>
              <AlertTitle>Paperclips triggered</AlertTitle>
              <AlertDescription>
                Two clear misses pause the interview. These submissions add no
                profile evidence; the scripted visitor then retries.
              </AlertDescription>
            </Alert>
          )}
          {selected && (
            <div className='flex flex-col gap-2 text-sm'>
              <p className='flex items-center gap-2 font-medium'>
                Next: {selected.text}
              </p>
              <p className='text-muted-foreground'>
                {winner
                  ? `${winner.id} ranked first at ${winner.priority.toFixed(2)}. Coverage benefit ${winner.coverage.toFixed(2)}, ambiguity ${winner.ambiguity.toFixed(2)}, tension ${winner.tension.toFixed(2)}, projection ${winner.projection.toFixed(2)}; effort, repetition and a missing-basis bonus also affect priority. New-information eligibility is shown in Decision details.`
                  : 'The recorded workflow issued this question without a scored candidate ranking.'}{' '}
                {mode === 'synthetic'
                  ? 'Benefits are injected synthetic judgments; the app applies its real eligibility, weights and tie-break rules.'
                  : 'Benefits are typed Jev judgments; the app applies eligibility, weights and tie-break rules.'}
              </p>
            </div>
          )}
          <Disclosure label='Result after this answer' wide>
            <p className='text-sm text-muted-foreground'>
              Recorded result and evidence after answer {step.ordinal}, using
              only the information available at that point.
            </p>
            {step.result ? (
              <>
                <ExperimentalResults
                  excerpts
                  subject={subject}
                  result={step.result}
                />
                <JsonViewer
                  label={`Step ${step.ordinal} result`}
                  value={step.result}
                  dimensions={dimensions}
                />
              </>
            ) : (
              <p className='text-sm'>
                {step.resultUnavailable ??
                  'No projection is available for this answer. Inspect the evidence state below.'}
              </p>
            )}
            <JsonViewer
              label={`Step ${step.ordinal} projection input state`}
              value={step.resultState ?? { evidenceReadiness: step.readiness }}
              dimensions={dimensions}
            />
          </Disclosure>
          <Disclosure label='Decision details'>
            {step.rankings.length > 0 && (
              <Table>
                <TableCaption>
                  Only shortlisted eligible candidates were judged. IDs break
                  tied priorities.
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>New info</TableHead>
                    <TableHead>Minimum</TableHead>
                    <TableHead>Coverage</TableHead>
                    <TableHead>Ambiguity</TableHead>
                    <TableHead>Tension</TableHead>
                    <TableHead>Projection</TableHead>
                    <TableHead>Effort</TableHead>
                    <TableHead>Repeated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {step.rankings.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className='font-mono text-xs'>
                        {r.id}
                      </TableCell>
                      <TableCell>{r.priority.toFixed(2)}</TableCell>
                      <TableCell>{r.novelty?.toFixed(2) ?? '—'}</TableCell>
                      <TableCell>
                        {r.noveltyThreshold?.toFixed(2) ?? '—'}
                      </TableCell>
                      <TableCell>{r.coverage.toFixed(2)}</TableCell>
                      <TableCell>{r.ambiguity.toFixed(2)}</TableCell>
                      <TableCell>{r.tension.toFixed(2)}</TableCell>
                      <TableCell>{r.projection.toFixed(2)}</TableCell>
                      <TableCell>{r.effort}</TableCell>
                      <TableCell>{r.repetition ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <JsonViewer
              label={`Step ${step.ordinal} readiness contributions`}
              value={{ evidenceReadiness: step.readiness }}
              dimensions={dimensions}
            />
            {step.trace && (
              <JsonViewer
                label={`Step ${step.ordinal} local decisions`}
                value={step.trace.decisions}
                dimensions={dimensions}
              />
            )}
            <p className='text-xs text-muted-foreground'>
              {step.stages
                .map((s) => `${s.name}: ${s.questions} judgments (${s.model})`)
                .join(' · ') || 'No model stage; exact local recovery policy.'}
            </p>
          </Disclosure>
          <Disclosure label='Requests and responses'>
            {step.trace?.stages.length ? (
              step.trace.stages.map((stage, index) => (
                <section key={index} className='flex min-w-0 flex-col gap-3'>
                  <h3>
                    {stage.name} ·{' '}
                    {mode === 'live' ? 'recorded Jev' : 'synthetic'}
                  </h3>
                  <div className='grid min-w-0 gap-4 lg:grid-cols-2'>
                    <JsonViewer
                      label={`Step ${step.ordinal} ${stage.name} request`}
                      value={{ state: stage.state, questions: stage.questions }}
                      questions={stage.questions}
                      dimensions={dimensions}
                    />
                    <JsonViewer
                      label={`Step ${step.ordinal} ${stage.name} response`}
                      value={{
                        model: stage.model,
                        answers: stage.answers,
                        usage: stage.usage
                      }}
                      questions={stage.questions}
                      dimensions={dimensions}
                    />
                  </div>
                </section>
              ))
            ) : (
              <p className='text-sm text-muted-foreground'>
                {step.trace
                  ? 'This operation used local policy and made no inference requests.'
                  : mode === 'live'
                    ? 'The checked-in live suite keeps results and input states. Generate a local live run to inspect the full Jev requests and responses.'
                    : 'The checked-in baseline keeps salient decisions only. Run a mechanical test to save its mocked stage inputs and outputs.'}
              </p>
            )}
          </Disclosure>
        </CardContent>
      </Card>
    </li>
  )
}

export function JourneysInspector({
  personas,
  runs: initialRuns,
  dimensions,
  contentVersion
}: {
  personas: Persona[]
  runs: RunIndex[]
  dimensions: DimensionDefinition[]
  contentVersion: string
}) {
  const [personaId, setPersonaId] = useState(personas[0]!.id)
  const runId = initialRuns.find((run) => run.mode === 'live')?.id ?? 'baseline'
  const [loaded, setLoaded] = useState<{
    key: string
    current: { run: RunIndex; journey: Journey | null } | null
    error: string
  } | null>(null)
  const persona = personas.find((p) => p.id === personaId)!
  const resultSubject = people.find((person) => person.id === personaId)
  const viewKey = JSON.stringify([runId, personaId])
  const view = loaded?.key === viewKey ? loaded : null
  const current = view?.current ?? null
  const loading = view === null
  const recordedPersona = current?.journey?.personaSnapshot ?? persona
  useEffect(() => {
    const abort = new AbortController()
    async function read(id: string) {
      const response = await fetch(
        `/api/user-journeys?run=${encodeURIComponent(id)}&persona=${encodeURIComponent(personaId)}`,
        { signal: abort.signal }
      )
      if (!response.ok)
        throw new Error(
          'That saved run could not be read. Check its project artifact.'
        )
      return response.json() as Promise<{
        run: RunIndex
        journey: Journey | null
      }>
    }
    void read(runId)
      .then((next) => {
        if (!abort.signal.aborted) {
          setLoaded({ key: viewKey, current: next, error: '' })
        }
      })
      .catch(() => {
        if (!abort.signal.aborted)
          setLoaded({
            key: viewKey,
            current: null,
            error:
              'The selected run could not be loaded. Regenerate the current journey suite.'
          })
      })
    return () => abort.abort()
  }, [runId, personaId, viewKey])
  const journey = current?.journey
  return (
    <article className='mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-4 py-10 sm:px-8'>
      <ReviewHeader
        title='User Journeys'
        description={`${personas.length} test journeys include simulated users and an exact real-user transcript. Inspect questions, answers, routing decisions and evidence readiness; inspect the latest generated paths.`}
        contentVersion={contentVersion}
      />
      <Field className='lg:hidden [&>[data-slot=native-select-wrapper]]:w-full'>
        <FieldLabel htmlFor='journey-persona'>Test journey</FieldLabel>
        <NativeSelect
          id='journey-persona'
          value={personaId}
          onChange={(event) => setPersonaId(event.target.value)}
        >
          {personas.map((p) => (
            <NativeSelectOption key={p.id} value={p.id}>
              {p.name} — {p.proxy.split(' · ')[0]}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </Field>
      <section
        aria-label='Test journeys'
        className='hidden gap-2 lg:grid lg:grid-cols-5'
      >
        {personas.map((p) => (
          <Button
            key={p.id}
            variant={p.id === personaId ? 'secondary' : 'outline'}
            className='h-auto justify-start px-4 py-3 text-left whitespace-normal'
            aria-pressed={p.id === personaId}
            onClick={() => setPersonaId(p.id)}
          >
            <span className='flex flex-col gap-1'>
              <span>{p.name}</span>
              <span className='text-xs font-normal text-muted-foreground'>
                {p.proxy.split(' · ')[0]}
              </span>
            </span>
          </Button>
        ))}
      </section>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>{recordedPersona.name}</CardTitle>
          <CardDescription>{recordedPersona.proxy}</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3 text-sm'>
          <p>{recordedPersona.description}</p>
          <p>
            <strong>What this tests: </strong>
            {recordedPersona.concern}
          </p>
          {recordedPersona.sources.length > 0 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='sm'>
                  Sources used for this run
                  <ChevronDown className='size-4' />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className='pt-3'>
                <ResourceList resources={recordedPersona.sources} />
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
      {view?.error && (
        <Alert variant='destructive'>
          <AlertTitle>Run unavailable</AlertTitle>
          <AlertDescription>{view.error}</AlertDescription>
        </Alert>
      )}
      {loading && (
        <p role='status' className='text-sm text-muted-foreground'>
          Loading saved journey…
        </p>
      )}
      {!loading && current && !journey && (
        <Alert>
          <AlertTitle>This run did not include {persona.name}</AlertTitle>
          <AlertDescription>
            The latest saved run does not include this simulated user.
          </AlertDescription>
        </Alert>
      )}
      {journey && current && (
        <>
          <section aria-label='Run summary' className='flex flex-col gap-4'>
            <div className='flex flex-wrap gap-2'>
              <Badge>
                {current.run.mode === 'live'
                  ? current.run.participantModel
                    ? 'Live Jev + OpenAI participant'
                    : 'Recorded Jev run · scripted answers'
                  : 'Mocked mechanical-test judgments'}
              </Badge>
              <Badge variant='outline'>
                {journey.accepted} accepted answers
              </Badge>
              <Badge variant='outline'>
                {percent(journey.finalReadiness.value)} evidence readiness
              </Badge>
              <Badge variant='outline'>
                {journey.firstReadyAnswer === null
                  ? 'No eligible result yet'
                  : `First eligible after answer ${journey.firstReadyAnswer}`}
              </Badge>
            </div>
            <p className='text-sm text-muted-foreground'>
              {journey.stopped}. Algorithm {current.run.versions.assessment} ·
              content {current.run.versions.content} · model{' '}
              {current.run.versions.model}. Readiness measures supported
              interpretation coverage, not forecast correctness or reasoning
              quality.
            </p>
            {current.run.cost && (
              <p className='text-sm text-muted-foreground'>
                Participant: {current.run.participantModel} · whole-run
                estimated API cost ${current.run.cost.estimatedUsd.toFixed(4)} ·
                OpenAI requests {current.run.cost.usage.openai.requests} · Jev
                requests {current.run.cost.usage.jev.requests}.
                {current.run.cost.reservedUsd > 0 &&
                  ` Failed or pending usage reservation: $${current.run.cost.reservedUsd.toFixed(4)}.`}
              </p>
            )}
            {journey.error && (
              <Alert variant='destructive'>
                <AlertTitle>Partial run</AlertTitle>
                <AlertDescription>
                  {journey.failureStage &&
                    `Failed during ${journey.failureStage}. `}
                  {journey.error}
                </AlertDescription>
              </Alert>
            )}
            {journey.failedOperation && (
              <Disclosure label='Failed operation diagnostics'>
                <p className='text-sm'>
                  Saved before the unfinished operation:{' '}
                  {journey.failedOperation.assessment.answers.length} accepted
                  answers. Completed stages below are diagnostics; their changes
                  were not committed.
                </p>
                <JsonViewer
                  label='Pending operation'
                  value={journey.failedOperation.operation}
                  dimensions={dimensions}
                />
                <JsonViewer
                  label='Failed stage diagnostics'
                  value={{
                    stage: journey.failedOperation.stage,
                    error: journey.failedOperation.error,
                    elapsedMs: journey.failedOperation.elapsedMs,
                    attempts: journey.failedOperation.attempts,
                    requests: journey.failedOperation.requests
                  }}
                  dimensions={dimensions}
                />
                <JsonViewer
                  label='Completed stages before failure'
                  value={journey.failedOperation.completedStages}
                  dimensions={dimensions}
                />
                <JsonViewer
                  label='Last committed assessment'
                  value={journey.failedOperation.assessment}
                  dimensions={dimensions}
                />
              </Disclosure>
            )}
            <Disclosure label='Run provenance and simulated user'>
              <JsonViewer label='Run provenance' value={current.run} />
              <JsonViewer
                label={
                  journey.personaSnapshot
                    ? current.run.mode === 'live'
                      ? 'Recorded persona background · no expected scores'
                      : 'Recorded mechanical case and mocked judgments'
                    : 'Current persona background'
                }
                value={
                  current.run.mode === 'live'
                    ? recordedBackgroundSchema.parse(recordedPersona)
                    : recordedPersona
                }
                dimensions={dimensions}
              />
            </Disclosure>
            {journey.participantExchanges && (
              <Disclosure label='OpenAI participant requests and replies'>
                <JsonViewer
                  label='Recorded participant exchanges'
                  value={journey.participantExchanges}
                />
                {journey.pendingAnswer && (
                  <p className='text-sm'>
                    Generated answer preserved after an unfinished assessment
                    operation: {journey.pendingAnswer}
                  </p>
                )}
              </Disclosure>
            )}
          </section>
          {journey.result && !journey.finalReadiness.ready && (
            <Alert>
              <AlertTitle>Readiness changed during projection</AlertTitle>
              <AlertDescription>
                This run qualified before projection. Projection left some
                positions unplaced and recomputed coverage; the saved
                provisional result is retained. The meter shows the current
                state, while First eligible records the earlier threshold
                crossing.
              </AlertDescription>
            </Alert>
          )}
          <JourneyResultExplorer
            subject={resultSubject}
            key={`${current.run.id}:${personaId}`}
            snapshots={questionSteps(journey).flatMap((step) =>
              step.result
                ? [{ label: String(step.ordinal), result: step.result }]
                : []
            )}
          />
          <section
            aria-label='Journey timeline'
            className='flex flex-col gap-5'
          >
            <h2>The conversation and decisions</h2>
            <ol className='flex min-w-0 flex-col gap-5'>
              {questionSteps(journey).map((step) => (
                <Step
                  key={`${current.run.id}:${personaId}:${step.ordinal}`}
                  step={step}
                  subject={resultSubject}
                  mode={current.run.mode}
                  dimensions={dimensions}
                />
              ))}
            </ol>
          </section>
          <section aria-label='Journey result' className='flex flex-col gap-5'>
            <h2>Result of this run</h2>
            {journey.result ? (
              <>
                <ExperimentalResults
                  excerpts
                  subject={resultSubject}
                  result={journey.result}
                />
                <Disclosure label='Result dimensions and findings'>
                  <JsonViewer
                    label='Journey final assessment result'
                    value={journey.result}
                    dimensions={dimensions}
                  />
                </Disclosure>
              </>
            ) : (
              <Alert>
                <AlertTitle>No result generated within this run</AlertTitle>
                <AlertDescription>
                  No final result was saved. Inspect the readiness and operation
                  diagnostics above.
                </AlertDescription>
              </Alert>
            )}
          </section>
        </>
      )}
    </article>
  )
}
