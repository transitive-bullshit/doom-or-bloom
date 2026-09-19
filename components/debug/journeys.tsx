'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, ChevronDown, RefreshCw } from 'lucide-react'
import { cn } from 'cn'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Field, FieldLabel } from '@/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
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
import { Map } from '@/components/assessment/worldview-map'
import type { DimensionDefinition } from '@/lib/debug/json-help'
import type { Persona } from '@/lib/journeys/catalog'
import { recordedBackgroundSchema } from '@/lib/journeys/schema'
import { questionSteps } from '@/lib/journeys/schema'
import type { Journey, JourneyStep, RunIndex } from '@/lib/journeys/schema'

const percent = (value: number) => `${value.toFixed(1)}%`

function Disclosure({
  label,
  children
}: {
  label: string
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
      <CollapsibleContent className='mt-4 flex min-w-0 flex-col gap-4'>
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
  dimensions
}: {
  step: JourneyStep
  mode: RunIndex['mode']
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
                →{' '}
                <strong className='tabular-nums'>
                  {percent(step.readiness.value)}
                </strong>
              </span>
              <span className='text-xs text-muted-foreground'>
                {step.readiness.covered}/{step.readiness.total} supported
                dimensions · threshold {step.readiness.threshold}%
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
                  ? 'A provisional result is available; this run continues follow-ups to expose the path.'
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
                <ArrowRight data-icon='inline-start' aria-hidden='true' />
                Next: {selected.text}
              </p>
              <p className='text-muted-foreground'>
                {winner
                  ? `${winner.id} ranked first at ${winner.priority.toFixed(2)}. Coverage benefit ${winner.coverage.toFixed(2)}, ambiguity ${winner.ambiguity.toFixed(2)}, tension ${winner.tension.toFixed(2)}, projection ${winner.projection.toFixed(2)}; effort and repetition also affect the weighted priority.`
                  : 'The recorded workflow issued this question without a scored candidate ranking.'}{' '}
                {mode === 'synthetic'
                  ? 'Benefits are injected synthetic judgments; the app applies its real eligibility, weights and tie-break rules.'
                  : 'Benefits are typed Jev judgments; the app applies eligibility, weights and tie-break rules.'}
              </p>
            </div>
          )}
          <Disclosure label='Result after this answer'>
            <p className='text-sm text-muted-foreground'>
              Recorded result and evidence after answer {step.ordinal}, using
              only the information available at that point.
            </p>
            {step.result ? (
              <>
                <Map
                  horizontal={step.result.horizontal}
                  vertical={step.result.vertical}
                  layout='contained'
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
                  <h3 className='font-medium'>
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
  const [runs, setRuns] = useState(initialRuns)
  const [runId, setRunId] = useState(
    initialRuns.find((run) => run.mode === 'live')?.id ?? 'baseline'
  )
  const [runMode, setRunMode] = useState<'live' | 'synthetic'>('live')
  const [loaded, setLoaded] = useState<{
    key: string
    current: { run: RunIndex; journey: Journey | null } | null
    error: string
  } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const persona = personas.find((p) => p.id === personaId)!
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
  async function rerun(all: boolean) {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/user-journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: all ? undefined : personaId,
          mode: runMode,
          allowPaid: runMode === 'live' ? true : undefined
        })
      })
      if (!response.ok) throw new Error('Rerun failed')
      const result = (await response.json()) as {
        run: RunIndex
        runs: RunIndex[]
      }
      setRunId(result.run.id)
      setRuns(result.runs)
    } catch {
      setError(
        'The rerun could not be saved. Your prior run is unchanged; check local artifacts and try again.'
      )
    } finally {
      setBusy(false)
    }
  }
  const journey = current?.journey
  return (
    <article className='mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8 px-4 py-10 sm:px-8'>
      <ReviewHeader
        title='User Journeys'
        description={`${personas.length} fictional personas exercise the same assessment workflow. Inspect questions, answers, routing decisions and evidence readiness; inspect the latest generated paths.`}
        contentVersion={contentVersion}
      />
      <Alert>
        <AlertTitle>
          Fictional stress-test personas, loosely grounded in public positions
        </AlertTitle>
        <AlertDescription>
          Live journeys use an OpenAI participant answering the actual questions
          and Jev inside the real assessment engine. Public-figure proxies use
          dated sources to stress-test sharply different positions, not to
          provide balanced portraits. Generated answers are not authentic
          quotations. Separate mechanical tests inject mocked judgments for free
          control-flow checks. Paid inference runs only when you explicitly
          start a live run.
        </AlertDescription>
      </Alert>
      <section
        aria-label='Fictional personas'
        className='grid gap-2 sm:grid-cols-2 lg:grid-cols-5'
      >
        {personas.map((p) => (
          <Button
            key={p.id}
            variant={p.id === personaId ? 'secondary' : 'outline'}
            className='h-auto justify-start px-4 py-3 text-left whitespace-normal'
            aria-pressed={p.id === personaId}
            disabled={busy}
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
            <p className='text-muted-foreground'>
              Source grounding:{' '}
              {recordedPersona.sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target='_blank'
                  rel='noreferrer'
                  className='underline underline-offset-4'
                >
                  {s.title}
                </a>
              ))}
            </p>
          )}
        </CardContent>
      </Card>
      <Field className='max-w-sm'>
        <FieldLabel htmlFor='journey-mode'>Rerun mode</FieldLabel>
        <NativeSelect
          id='journey-mode'
          value={runMode}
          disabled={busy}
          onChange={(event) => {
            const mode = event.target.value as 'live' | 'synthetic'
            setRunMode(mode)
            setRunId(
              mode === 'synthetic'
                ? 'baseline'
                : (runs.find((run) => run.mode === 'live')?.id ?? 'baseline')
            )
          }}
        >
          <NativeSelectOption value='live'>
            Live Jev + OpenAI participant · paid
          </NativeSelectOption>
          <NativeSelectOption value='synthetic'>
            Mechanical engine test · no API calls
          </NativeSelectOption>
        </NativeSelect>
      </Field>
      <div className='flex flex-wrap items-center gap-3'>
        <Button
          variant='outline'
          disabled={
            busy ||
            loading ||
            (runMode === 'synthetic' &&
              !runs.some(
                (run) =>
                  run.mode === 'synthetic' && run.personaIds.includes(personaId)
              ))
          }
          onClick={() => void rerun(false)}
        >
          <RefreshCw data-icon='inline-start' />
          {busy
            ? 'Running and saving…'
            : `Rerun this persona · ${runMode === 'live' ? 'live' : 'mechanical'}`}
        </Button>
        <Button
          variant='outline'
          disabled={busy || loading}
          onClick={() => void rerun(true)}
        >
          Rerun all · {runMode === 'live' ? 'live' : 'mechanical'}
        </Button>
        <p className='text-xs text-muted-foreground'>
          Five answer opportunities, with a saved result after each eligible
          answer.{' '}
          {runMode === 'live'
            ? 'GPT-5.6 Sol + Jev; $2 cost budget, at most 24 Jev requests for a single-persona run or 240 shared by all personas. Runs may take several minutes.'
            : 'No paid requests.'}
        </p>
      </div>
      {(error || view?.error) && (
        <Alert variant='destructive'>
          <AlertTitle>Run unavailable</AlertTitle>
          <AlertDescription>{error || view?.error}</AlertDescription>
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
            Select a run containing this persona or start a new run.
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
              <Disclosure label='Failed operation and recovery'>
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
                {current.run.mode === 'live' && (
                  <>
                    <p className='text-sm text-muted-foreground'>
                      Retry this saved operation with live Jev using the command
                      below. It uses a fresh budget, may repeat completed
                      stages, and saves a new run. It reuses the saved answer
                      and does not generate another participant reply or finish
                      the interview.
                    </p>
                    <pre className='overflow-x-auto text-xs'>
                      <code>{`pnpm journeys:live --resume=${current.run.id} --persona=${journey.personaId} --max-requests=24 --max-cost=0.5`}</code>
                    </pre>
                  </>
                )}
              </Disclosure>
            )}
            <Disclosure label='Run provenance and persona'>
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
          <section
            aria-label='Journey timeline'
            className='flex flex-col gap-5'
          >
            <h2 className='text-xl font-semibold'>
              The conversation and decisions
            </h2>
            <ol className='flex min-w-0 flex-col gap-5'>
              {questionSteps(journey).map((step) => (
                <Step
                  key={`${current.run.id}:${personaId}:${step.ordinal}`}
                  step={step}
                  mode={current.run.mode}
                  dimensions={dimensions}
                />
              ))}
            </ol>
          </section>
          <section aria-label='Journey result' className='flex flex-col gap-5'>
            <h2 className='text-xl font-semibold'>Result of this run</h2>
            {journey.result ? (
              <>
                <div className='mx-auto w-full max-w-2xl'>
                  <Map
                    horizontal={journey.result.horizontal}
                    vertical={journey.result.vertical}
                  />
                </div>
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
                  The runner preserves the real readiness gate. Continue with a
                  larger bounded turn count through the CLI or inspect the
                  missing coverage; it does not invent a result.
                </AlertDescription>
              </Alert>
            )}
          </section>
        </>
      )}
      <Disclosure label='Live journeys and mechanical tests'>
        <div className='flex flex-col gap-3 text-sm text-muted-foreground'>
          <p>
            <code>pnpm journeys:generate</code> generates real OpenAI replies
            and Jev judgments for all personas. Add{' '}
            <code>--persona=control-alarmist</code> to select one. These runs
            incur API costs.
          </p>
          <p>
            For live participant generation and Jev semantics, run{' '}
            <code>pnpm journeys:live --persona=control-alarmist --turns=5</code>
            . Omit the persona flag for all personas. Credentials stay
            server-side in the environment or <code>.env.local</code>. Live runs
            incur API charges within request and cost budgets.
          </p>
          <p>
            Run artifacts are saved under <code>eval/runs/journeys/</code>;
            earlier runs remain intact. Separate free engine checks use{' '}
            <code>pnpm journeys:mechanical:check</code>. Updating that mocked
            baseline uses <code>pnpm journeys:mechanical --write-baseline</code>{' '}
            and a reviewed Git diff. These are mechanical regressions, not
            evidence that Jev understood the answers.
          </p>
        </div>
      </Disclosure>
    </article>
  )
}
