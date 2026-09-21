'use client'
import { useEffect, useRef, useState } from 'react'
import {
  clearDebugOperations,
  loadDebugOperations,
  saveDebugOperation
} from '@/lib/debug/trace-storage'
import type { SavedDebugOperation } from '@/lib/debug/trace-storage'
import type {
  Assessment,
  AssessmentResponse,
  DebugTrace,
  Operation
} from '@/lib/assessment/schema'
import {
  assessmentSchema,
  limits,
  supportedContentVersions,
  versions
} from '@/lib/assessment/schema'
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
  FieldDescription,
  FieldError
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
import type { DimensionDefinition } from '@/lib/debug/json-help'
import { ReadinessMeter } from './readiness-meter'
import { DebugPanel } from '@/components/debug/panel'
import { ResultView } from './result-view'
import { Paperclips } from './paperclips'
import { ConversationHistory, ConversationReplies } from './conversation'
import { conversationTurns } from '@/lib/assessment/conversation'
import { downloadBlob } from '@/lib/sharing/report'
import { configureAnalytics, emitEvent } from '@/lib/analytics/client'
import { makeEvent, transitionEvents } from '@/lib/analytics/events'
import type { Catalog } from '@/lib/analytics/events'
import {
  restoreLocalInteraction,
  serverSnapshot
} from '@/lib/assessment/transport'

export function Interview({
  model,
  debugDefault,
  debugAvailable,
  recoveryCopy,
  analyticsEnabled,
  analyticsCatalog,
  fixtureMode,
  dimensions
}: {
  model: string
  debugDefault: boolean
  debugAvailable: boolean
  analyticsEnabled: boolean
  analyticsCatalog: Catalog
  fixtureMode: boolean
  dimensions: DimensionDefinition[]
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
  const [debugMode, setDebugMode] = useState(false)
  useEffect(() => {
    let disposed = false
    queueMicrotask(() => {
      if (disposed) return
      try {
        const saved = localStorage.getItem('doom-or-bloom:debug-mode')
        setDebugMode(
          debugAvailable && (saved === null ? debugDefault : saved === 'on')
        )
      } catch {
        setDebugMode(debugAvailable && debugDefault)
      }
    })
    return () => {
      disposed = true
    }
  }, [debugAvailable, debugDefault])
  const toggleDebug = () => {
    const next = !debugMode
    setDebugMode(next)
    try {
      localStorage.setItem('doom-or-bloom:debug-mode', next ? 'on' : 'off')
    } catch {
      // The toggle still works when browser storage is unavailable.
    }
  }
  const [trace, setTrace] = useState<DebugTrace>()
  const [debugOperations, setDebugOperations] = useState<SavedDebugOperation[]>(
    []
  )
  const [debugStorageNotice, setDebugStorageNotice] = useState('')
  const [rawBackup, setRawBackup] = useState<string>()
  const [fixture, setFixture] = useState(fixtureMode)
  const current = useRef<Assessment | null>(null)
  const token = useRef<string | null>(null)
  const writable = useRef(true)
  const pending = useRef<{ id: string; controller: AbortController } | null>(
    null
  )
  const uncertain = useRef<{ id: string; key: string; body: string } | null>(
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
    if (!state?.id) return
    let disposed = false
    const assessmentId = state.id
    void loadDebugOperations(assessmentId)
      .then((saved) => {
        if (disposed) return
        setDebugOperations((present) =>
          Array.from(
            new Map(
              [...saved, ...present].map((entry) => [
                entry.trace.requestId,
                entry
              ])
            ).values()
          ).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        )
        setTrace((present) => present ?? saved.at(-1)?.trace)
      })
      .catch(() => {
        if (!disposed)
          setDebugStorageNotice(
            'Saved debug details could not be loaded. Your assessment progress is separate.'
          )
      })
    return () => {
      disposed = true
    }
  }, [state?.id])
  async function act(operation: Operation) {
    if (!current.current || pending.current || conflict || rawBackup) return
    const snapshot = current.current
    const payload = {
      assessment: serverSnapshot(snapshot),
      operation,
      debug: true
    }
    const key = JSON.stringify(payload)
    const id =
      uncertain.current?.key === key
        ? uncertain.current.id
        : crypto.randomUUID()
    const requestBody =
      uncertain.current?.key === key
        ? uncertain.current.body
        : JSON.stringify({ requestId: id, ...payload })
    uncertain.current = { id, key, body: requestBody }
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
        body: requestBody
      })
      if (!response.ok) uncertain.current = null
      const body = (await response.json()) as AssessmentResponse & {
        error?: string
      }
      if (!response.ok) {
        const failed: SavedDebugOperation = {
          trace: body.debug ?? {
            requestId: id,
            baseRevision: snapshot.revision,
            stages: [],
            decisions: [
              {
                action:
                  'request rejected before a diagnostic trace was returned',
                detail: { status: response.status }
              }
            ],
            elapsedMs: 0
          },
          provider: fixture ? 'fixture' : 'live',
          createdAt: new Date().toISOString(),
          operation,
          error: body.error || 'Request failed'
        }
        try {
          setDebugOperations(await saveDebugOperation(snapshot.id, failed))
        } catch {
          setDebugOperations((present) => [...present, failed])
          setDebugStorageNotice(
            'The failed-step trace is available for this visit but could not be saved.'
          )
        }
        setTrace(failed.trace)
        throw new Error(
          body.error || 'The evaluator is unavailable. Your answer is saved.'
        )
      }
      if (
        !current.current ||
        !matchesResponse(current.current, body, pending.current?.id ?? '')
      )
        return
      const next = restoreLocalInteraction(
        snapshot,
        assessmentSchema.parse(body.assessment),
        operation,
        id
      )
      let recorded: SavedDebugOperation[] | undefined
      let debugNotice = ''
      const operationTrace: SavedDebugOperation | undefined = body.debug
        ? {
            trace: body.debug,
            provider: body.provider,
            createdAt: new Date().toISOString(),
            operation,
            assessment: { ...next, draft: '', interactionHistory: [] }
          }
        : undefined
      if (operationTrace) {
        try {
          recorded = await saveDebugOperation(next.id, operationTrace)
        } catch {
          debugNotice =
            'Debug details could not be saved in this browser. Your assessment progress is still saved separately.'
        }
      }
      // Restart/tab conflicts can occur while the debug transaction is finishing.
      if (
        !current.current ||
        !matchesResponse(current.current, body, pending.current?.id ?? '')
      ) {
        if (operationTrace && current.current?.id !== next.id)
          void clearDebugOperations(next.id).catch(() =>
            setDebugStorageNotice(
              'The previous debug history could not be cleared.'
            )
          )
        return
      }
      uncertain.current = null
      const events = transitionEvents(snapshot, next, operation, id)
      persist(next)
      events.forEach(emitEvent)
      if (operationTrace) {
        setTrace(operationTrace.trace)
        setDebugOperations(
          (present) =>
            recorded ??
            [
              ...present.filter(
                (entry) =>
                  entry.trace.requestId !== operationTrace.trace.requestId
              ),
              operationTrace
            ].slice(-64)
        )
        setDebugStorageNotice(debugNotice)
      }
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
    const previousId = current.current?.id
    if (previousId)
      void clearDebugOperations(previousId).catch(() =>
        setDebugStorageNotice(
          'The previous debug history could not be cleared.'
        )
      )
    setDebugOperations([])
    setDebugStorageNotice('')
    if (current.current)
      emitEvent(makeEvent(current.current, 'assessment_restarted'))
    pending.current?.controller.abort()
    pending.current = null
    uncertain.current = null
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
  const unavailableQuestion = !recoveryCopy[p.promptId]
  const paused = state.status === 'paused'
  const allowed =
    canSubmit(state) && !unavailableQuestion && !busy && !conflict && !rawBackup
  const excessCharacters = Math.max(0, state.draft.length - limits.answerChars)
  const answerTooLong = excessCharacters > 0
  const turns = conversationTurns(state)
  const currentTurn = turns[turns.length - 1]!
  return (
    <section className='relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10'>
      {state.recovery.paperclipActive && (
        <Paperclips dismiss={() => void act({ type: 'dismiss' })} />
      )}
      <div className='relative flex flex-col gap-8'>
        <div className='flex flex-col gap-6'>
          {notice && (
            <Alert>
              <AlertTitle>Local progress</AlertTitle>
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}
          {state.versions.content !== versions.content &&
            supportedContentVersions.some(
              (version) => version === state.versions.content
            ) && (
              <Alert>
                <AlertTitle>Updated draft available</AlertTitle>
                <AlertDescription>
                  Your saved assessment will keep its earlier version. Restart
                  to try the updated draft.
                </AlertDescription>
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
        </div>
        <ConversationHistory
          turns={showResult ? turns : turns.slice(0, -1)}
          operations={debugMode ? debugOperations : undefined}
        />
        <div className='flex flex-col gap-6'>
          {showResult ? (
            <ResultView
              state={state}
              act={(op) => void act(op)}
              busy={busy || conflict}
              onError={setError}
              operations={debugOperations}
            />
          ) : (
            <>
              <div>
                {state.answers.length > 0 && (
                  <p className='mb-5 text-xs text-muted-foreground'>
                    {`${state.answers.length} substantive ${state.answers.length === 1 ? 'answer' : 'answers'} · prompt ${p.ordinal}${p.ordinal >= limits.warning ? ` of ${limits.prompts}` : ''}`}
                  </p>
                )}
                <h1 className='text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl'>
                  {p.text}
                </h1>
              </div>
              <ConversationReplies turn={currentTurn} />
              {unavailableQuestion && (
                <Alert>
                  <AlertTitle>This question is no longer available</AlertTitle>
                  <AlertDescription>
                    Your history and draft are preserved. Choose a different
                    question below to continue.
                  </AlertDescription>
                </Alert>
              )}
              {p.ordinal >= limits.warning && (
                <Alert>
                  <AlertTitle>Approaching the limit</AlertTitle>
                  <AlertDescription>
                    This assessment ends at {limits.prompts} prompts. You can
                    restart afterward.
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
                  if (allowed && !answerTooLong && state.draft.trim())
                    void act({ type: 'answer', text: state.draft.trim() })
                }}
              >
                <FieldGroup>
                  <Field
                    data-invalid={Boolean(error) || answerTooLong}
                    data-disabled={!allowed}
                  >
                    <FieldLabel htmlFor='answer' className='sr-only'>
                      Your answer
                    </FieldLabel>
                    <Textarea
                      id='answer'
                      value={state.draft}
                      placeholder='A few sentences is plenty. Just tell us what you think. Using speech-to-text is encouraged.'
                      disabled={!allowed}
                      aria-invalid={Boolean(error) || answerTooLong}
                      aria-describedby={
                        answerTooLong ? 'answer-length answer-limit' : undefined
                      }
                      className='min-h-36 resize-none'
                      onKeyDown={(event) => {
                        if (
                          event.key !== 'Enter' ||
                          !(event.metaKey || event.ctrlKey) ||
                          event.nativeEvent.isComposing
                        )
                          return
                        event.preventDefault()
                        if (!event.repeat)
                          event.currentTarget.form?.requestSubmit()
                      }}
                      onChange={(event) => {
                        try {
                          persist({ ...state, draft: event.target.value })
                        } catch {
                          /* Conflict UI preserves the saved record. */
                        }
                      }}
                    />
                    {answerTooLong && (
                      <>
                        <FieldDescription id='answer-length'>
                          {state.draft.length.toLocaleString('en-US')} /{' '}
                          {limits.answerChars.toLocaleString('en-US')}{' '}
                          characters
                        </FieldDescription>
                        <FieldError id='answer-limit'>
                          Your full answer is still here. Shorten it by{' '}
                          {excessCharacters.toLocaleString('en-US')}{' '}
                          {excessCharacters === 1 ? 'character' : 'characters'}{' '}
                          to continue.
                        </FieldError>
                      </>
                    )}
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
                          aria-keyshortcuts='Meta+Enter Control+Enter'
                          disabled={
                            !allowed || answerTooLong || !state.draft.trim()
                          }
                        >
                          {busy ? 'Reading your answer…' : 'Continue'}{' '}
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
                      {state.prompts.length < limits.prompts &&
                        (paused ||
                          state.status === 'recovery' ||
                          unavailableQuestion) && (
                          <Button
                            type='button'
                            disabled={busy || conflict}
                            variant='outline'
                            onClick={() => void act({ type: 'skip' })}
                          >
                            Try a different question
                          </Button>
                        )}
                      {state.answers.length > 0 &&
                        (!paused || state.recovery.reason !== 'stopped') && (
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
              {state.answers.length > 0 && (
                <ReadinessMeter state={state} debug={debugMode} />
              )}
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
        </div>
        <div className='flex flex-col gap-6'>
          {error && (
            <Alert variant='destructive'>
              <AlertTitle>Could not complete that step</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className='flex items-center justify-between gap-4'>
            {state.answers.length > 0 && (
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
                      This clears the current local assessment. Download your
                      report first if you want to keep it.
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
            )}
            {debugAvailable && (
              <Button
                variant='ghost'
                size='sm'
                aria-pressed={debugMode}
                onClick={toggleDebug}
              >
                Debug {debugMode ? 'on' : 'off'}
              </Button>
            )}
          </div>
          {debugMode && (
            <DebugPanel
              dimensions={dimensions}
              trace={trace}
              operations={debugOperations}
              onSelectTrace={setTrace}
              storageNotice={debugStorageNotice}
              assessment={state}
              provider={fixture ? 'fixture' : 'live'}
            />
          )}
        </div>
      </div>
    </section>
  )
}
