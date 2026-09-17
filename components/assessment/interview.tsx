'use client'
import { useEffect, useRef, useState } from 'react'
import type {
  Assessment,
  AssessmentResponse,
  DebugTrace,
  Operation
} from '@/lib/assessment/schema'
import { assessmentSchema, limits } from '@/lib/assessment/schema'
import {
  canSubmit,
  createAssessment,
  currentPrompt,
  eligible,
  matchesResponse
} from '@/lib/assessment/state'
import {
  loadAssessment,
  saveAssessment,
  StorageConflict,
  storageKey
} from '@/lib/persistence/storage'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription
} from '@/components/ui/field'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog'
import { DebugPanel } from '@/components/debug/panel'
import { ResultView } from './result-view'
import { Paperclips } from './paperclips'
import { downloadBlob } from '@/lib/sharing/report'
import { configureAnalytics, emitEvent } from '@/lib/analytics/client'
import { makeEvent, transitionEvents } from '@/lib/analytics/events'
import type { Catalog } from '@/lib/analytics/events'

export function Interview({
  model,
  debugDefault,
  debugAvailable,
  recoveryCopy,
  analyticsEnabled,
  analyticsCatalog,
  fixtureMode
}: {
  model: string
  debugDefault: boolean
  debugAvailable: boolean
  analyticsEnabled: boolean
  analyticsCatalog: Catalog
  fixtureMode: boolean
  recoveryCopy: Record<
    string,
    { reask: string; clarification: string; exhausted: string }
  >
}) {
  const [state, setState] = useState<Assessment | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [conflict, setConflict] = useState(false)
  const [debugMode, setDebugMode] = useState(debugDefault)
  const [trace, setTrace] = useState<DebugTrace>()
  const [rawBackup, setRawBackup] = useState<string>()
  const [fixture, setFixture] = useState(fixtureMode)
  const current = useRef<Assessment | null>(null)
  const token = useRef<string | null>(null)
  const writable = useRef(true)
  const pending = useRef<{ id: string; controller: AbortController } | null>(
    null
  )
  const setCurrent = (value: Assessment) => {
    current.current = value
    setState(value)
  }
  const persist = (value: Assessment) => {
    if (writable.current) {
      try {
        token.current = saveAssessment(
          localStorage,
          value,
          token.current,
          crypto.randomUUID()
        )
      } catch (err) {
        if (err instanceof StorageConflict) {
          setConflict(true)
          pending.current?.controller.abort()
          throw err
        }
        writable.current = false
        setNotice(
          'Browser storage is unavailable. Keep this tab open; progress cannot resume after closing it.'
        )
      }
    }
    setCurrent(value)
  }
  useEffect(() => {
    configureAnalytics(analyticsCatalog, analyticsEnabled)
  }, [analyticsCatalog, analyticsEnabled])
  useEffect(() => {
    let disposed = false
    queueMicrotask(() => {
      if (disposed) return
      let loaded
      try {
        loaded = loadAssessment(localStorage)
      } catch {
        loaded = { kind: 'unavailable' as const }
      }
      if (loaded.kind === 'valid') {
        token.current = loaded.token
        current.current = loaded.assessment
        setState(loaded.assessment)
      } else {
        if (loaded.kind === 'invalid') {
          setRawBackup(loaded.raw)
          writable.current = false
          setNotice(
            'The saved assessment could not be read. Download a backup or restart to clear it.'
          )
        }
        if (loaded.kind === 'unavailable') {
          writable.current = false
          setNotice(
            'Browser storage is unavailable. Keep this tab open to preserve progress.'
          )
        }
        const initial = createAssessment(crypto.randomUUID(), model)
        persist(initial)
      }
    })
    const changed = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      const latest = loadAssessment(localStorage)
      if (latest.kind === 'valid' && latest.token === token.current) return
      setConflict(true)
      pending.current?.controller.abort()
      pending.current = null
      setBusy(false)
    }
    window.addEventListener('storage', changed)
    return () => {
      disposed = true
      window.removeEventListener('storage', changed)
      pending.current?.controller.abort()
    }
  }, [model])
  useEffect(() => {
    if (!busy)
      document.querySelector<HTMLElement>('[data-focus-target]')?.focus()
  }, [state?.prompts.length, state?.status, busy])
  async function act(operation: Operation) {
    if (!current.current || pending.current || conflict || rawBackup) return
    const snapshot = current.current
    const id = crypto.randomUUID()
    const controller = new AbortController()
    pending.current = { id, controller }
    setBusy(true)
    setError('')
    try {
      persist(snapshot)
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          requestId: id,
          assessment: snapshot,
          operation,
          debug: debugMode
        })
      })
      const body = (await response.json()) as AssessmentResponse & {
        error?: string
      }
      if (!response.ok)
        throw new Error(
          body.error || 'The evaluator is unavailable. Your answer is saved.'
        )
      if (
        !current.current ||
        !matchesResponse(current.current, body, pending.current?.id ?? '')
      )
        return
      const next = assessmentSchema.parse(body.assessment)
      const events = transitionEvents(snapshot, next, operation, id)
      persist(next)
      events.forEach(emitEvent)
      setTrace(body.debug)
      setFixture(body.provider === 'fixture')
    } catch (err) {
      if (!controller.signal.aborted)
        setError(
          err instanceof Error
            ? err.message
            : 'Something went wrong. Your answer is saved.'
        )
    } finally {
      if (pending.current?.id === id) {
        pending.current = null
        setBusy(false)
      }
    }
  }
  function restart() {
    if (current.current)
      emitEvent(makeEvent(current.current, 'assessment_restarted'))
    pending.current?.controller.abort()
    pending.current = null
    setBusy(false)
    setTrace(undefined)
    setError('')
    setRawBackup(undefined)
    setConflict(false)
    try {
      localStorage.removeItem(storageKey)
      token.current = null
      writable.current = true
    } catch {
      writable.current = false
    }
    persist(createAssessment(crypto.randomUUID(), model))
  }
  if (!state)
    return (
      <section className='mx-auto w-full max-w-2xl px-6 py-20' role='status'>
        Opening your assessment…
      </section>
    )
  const p = currentPrompt(state)
  const showResult =
    state.result && ['results', 'completed', 'capped'].includes(state.status)
  const guidance = recoveryCopy[p.promptId] ?? recoveryCopy.root!
  const paused = state.status === 'paused'
  const allowed = canSubmit(state) && !busy && !conflict && !rawBackup
  return (
    <section className='relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-12'>
      {state.recovery.paperclipActive && (
        <Paperclips dismiss={() => void act({ type: 'dismiss' })} />
      )}
      <div className='relative flex flex-col gap-6'>
        {notice && (
          <Alert>
            <AlertTitle>Local progress</AlertTitle>
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        )}
        {rawBackup && (
          <Button
            variant='outline'
            onClick={() =>
              downloadBlob(
                new Blob([rawBackup], { type: 'application/json' }),
                'doom-or-bloom-backup.json'
              )
            }
          >
            Download saved backup
          </Button>
        )}
        {conflict && (
          <Alert>
            <AlertTitle>This assessment changed in another tab</AlertTitle>
            <AlertDescription>
              Reload the latest version before continuing.
              <Button
                variant='outline'
                onClick={() => window.location.reload()}
              >
                Reload latest version
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {fixture && (
          <Badge variant='outline'>Fixture mode · synthetic judgments</Badge>
        )}
        <Badge variant='outline' className='self-start'>
          Local authoring draft · review pending
        </Badge>
        {showResult ? (
          <ResultView
            state={state}
            act={(op) => void act(op)}
            busy={busy || conflict}
            onError={setError}
          />
        ) : (
          <>
            <div>
              <p className='mb-5 text-xs text-muted-foreground'>
                {state.answers.length === 0
                  ? 'Map your AI worldview in three questions.'
                  : `${state.answers.length} substantive ${state.answers.length === 1 ? 'answer' : 'answers'} · prompt ${p.ordinal}${p.ordinal >= 45 ? ' of 50' : ''}`}
              </p>
              <h1
                tabIndex={-1}
                data-focus-target
                className='text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl'
              >
                {p.text}
              </h1>
            </div>
            {p.ordinal >= 45 && (
              <Alert>
                <AlertTitle>Approaching the limit</AlertTitle>
                <AlertDescription>
                  This assessment ends at 50 prompts. You can restart afterward.
                </AlertDescription>
              </Alert>
            )}
            {(state.status === 'recovery' || paused) && (
              <Alert>
                <AlertTitle>
                  {state.recovery.paperclipActive
                    ? 'We’ve made some paperclips.'
                    : paused
                      ? 'Let’s pause here'
                      : 'Another try?'}
                </AlertTitle>
                <AlertDescription>
                  {state.recovery.paperclipActive
                    ? 'Want to give the question another go?'
                    : state.recovery.reason === 'exhausted'
                      ? guidance.exhausted
                      : state.recovery.reason === 'needs_clarification'
                        ? guidance.clarification
                        : state.recovery.reason === 'stopped'
                          ? 'Your progress is here whenever you want to return.'
                          : state.recovery.reason === 'navigation'
                            ? 'Use the actions below to choose what happens next.'
                            : guidance.reask}
                </AlertDescription>
              </Alert>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (allowed && state.draft.trim())
                  void act({ type: 'answer', text: state.draft.trim() })
              }}
            >
              <FieldGroup>
                <Field data-invalid={Boolean(error)} data-disabled={!allowed}>
                  <FieldLabel htmlFor='answer' className='sr-only'>
                    Your answer
                  </FieldLabel>
                  <Textarea
                    id='answer'
                    value={state.draft}
                    placeholder='A few sentences is plenty. Uncertainty is welcome.'
                    maxLength={limits.answerChars}
                    disabled={!allowed}
                    aria-invalid={Boolean(error)}
                    aria-describedby='answer-help'
                    className='min-h-36'
                    onChange={(event) => {
                      try {
                        persist({ ...state, draft: event.target.value })
                      } catch {
                        /* Conflict UI preserves the saved record. */
                      }
                    }}
                  />
                  <FieldDescription id='answer-help'>
                    {state.draft.length > 1700
                      ? `${limits.answerChars - state.draft.length} characters remaining`
                      : 'No specialist knowledge needed. Tell us what you think.'}
                  </FieldDescription>
                </Field>
                <Field>
                  <div className='flex flex-wrap gap-3'>
                    {paused && state.recovery.evaluated < limits.recovery && (
                      <Button
                        type='button'
                        disabled={busy || conflict}
                        onClick={() => void act({ type: 'retry' })}
                      >
                        Try again
                      </Button>
                    )}
                    {!paused && (
                      <Button
                        type='submit'
                        disabled={!allowed || !state.draft.trim()}
                      >
                        {busy ? 'Reading your answer…' : 'Continue'}{' '}
                        <span aria-hidden='true'>→</span>
                      </Button>
                    )}
                    {eligible(state) && (
                      <Button
                        type='button'
                        disabled={busy || conflict}
                        variant='outline'
                        onClick={() => void act({ type: 'project' })}
                      >
                        View my result
                      </Button>
                    )}
                    {state.prompts.length < 50 &&
                      (paused || state.status === 'recovery') && (
                        <Button
                          type='button'
                          disabled={busy || conflict}
                          variant='outline'
                          onClick={() => void act({ type: 'skip' })}
                        >
                          Try a different question
                        </Button>
                      )}
                    {(!paused || state.recovery.reason !== 'stopped') && (
                      <Button
                        type='button'
                        disabled={busy || conflict}
                        variant='ghost'
                        onClick={() => void act({ type: 'stop' })}
                      >
                        Stop for now
                      </Button>
                    )}
                  </div>
                </Field>
              </FieldGroup>
            </form>
            {busy && (
              <p className='text-sm text-muted-foreground' role='status'>
                Reading the evidence and choosing a useful next step…
              </p>
            )}
            {state.answers.length >= 6 && (
              <p className='text-sm text-muted-foreground'>
                You can see your result now, or keep exploring.
              </p>
            )}
          </>
        )}
        {error && (
          <Alert variant='destructive'>
            <AlertTitle>Could not complete that step</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className='flex items-center justify-between gap-4'>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='ghost' size='sm'>
                Restart
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a new assessment?</DialogTitle>
                <DialogDescription>
                  This clears the current local assessment. Download your report
                  first if you want to keep it.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant='outline'>Keep this assessment</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={restart}>Restart & clear</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {debugAvailable && (
            <Button
              variant='ghost'
              size='sm'
              aria-pressed={debugMode}
              onClick={() => setDebugMode((value) => !value)}
            >
              Debug {debugMode ? 'on' : 'off'}
            </Button>
          )}
        </div>
        {debugMode && <DebugPanel trace={trace} assessment={state} />}
      </div>
    </section>
  )
}
