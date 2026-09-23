'use client'
import { useEffect, useRef, useState } from 'react'
import { loadDebugOperations } from '@/lib/debug/trace-storage'
import type { SavedDebugOperation } from '@/lib/debug/trace-storage'
import type { DebugTrace } from '@/lib/assessment/schema'
import {
  limits,
  supportedContentVersions,
  versions
} from '@/lib/assessment/schema'
import {
  canSubmit,
  currentPrompt,
  eligible,
  promptLimit
} from '@/lib/assessment/state'
import type { OwnedAssessment } from '@/lib/assessments/repository'
import { usePersistentAssessment } from './use-persistent-assessment'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { api, userErrorMessage } from '@/lib/assessments/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
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
import type { DimensionDefinition } from '@/lib/debug/json-help'
import { ReadinessMeter } from './readiness-meter'
import { toast } from 'sonner'
import { AnswerNavigationProvider } from './answer-navigation'
import { DebugPanel } from '@/components/debug/panel'
import { ResultView } from './result-view'
import { Paperclips } from './paperclips'
import { ConversationHistory, ConversationReplies } from './conversation'
import { conversationTurns } from '@/lib/assessment/conversation'
import { configureAnalytics } from '@/lib/analytics/client'
import type { Catalog } from '@/lib/analytics/events'

import type { PersonaComparison } from '@/lib/assessment/persona-matches'

export function Interview({
  personas,
  initial,
  debugDefault,
  debugAvailable,
  recoveryCopy,
  analyticsEnabled,
  analyticsCatalog,
  fixtureMode,
  dimensions
}: {
  personas: PersonaComparison[]
  initial: OwnedAssessment
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
  const {
    record,
    state,
    busy,
    notice,
    uncertain,
    persist,
    act: submit,
    refresh
  } = usePersistentAssessment(initial)
  const router = useRouter()
  const [managing, setManaging] = useState(false)
  const [previewRevision, setPreviewRevision] = useState<number | null>(null)
  const forkKey = useRef<string | null>(null)
  async function act(
    operation: import('@/lib/assessment/schema').Operation,
    retry = false
  ) {
    if (
      operation.type === 'project' &&
      state.result?.evidenceRevision === state.evidenceRevision
    ) {
      setPreviewRevision(state.revision)
      return
    }
    if (record.visibility !== 'public') return submit(operation, retry)
    if (managing || busy) return
    setManaging(true)
    try {
      const storageKey = `doom-or-bloom:fork:${state.id}`
      forkKey.current ??= crypto.randomUUID()
      try {
        forkKey.current = localStorage.getItem(storageKey) ?? forkKey.current
        localStorage.setItem(storageKey, forkKey.current)
      } catch {
        /* In-memory key remains stable. */
      }
      const { id } = await api<{ id: string }>(
        `/api/assessments/${state.id}/fork`,
        {
          method: 'POST',
          body: JSON.stringify({ requestKey: forkKey.current })
        }
      )
      try {
        await api(`/api/assessments/${id}`, {
          method: 'POST',
          body: JSON.stringify({
            assessmentId: id,
            expectedRevision: 0,
            requestKey: `${forkKey.current}:continue`,
            operation
          })
        })
      } finally {
        try {
          localStorage.removeItem(storageKey)
        } catch {
          /* Navigation still works. */
        }
        router.push(`/assessments/${id}`)
      }
    } catch (err) {
      toast.error(
        userErrorMessage(
          err,
          'Couldn’t create a new assessment. Please try again.'
        )
      )
    } finally {
      setManaging(false)
    }
  }
  async function visibility(value: 'private' | 'public') {
    if (busy || managing) return
    setManaging(true)
    try {
      await api(`/api/assessments/${state.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          expectedRevision: state.revision,
          visibility: value
        })
      })
      await refresh()
    } catch (err) {
      toast.error(
        userErrorMessage(err, 'Couldn’t update sharing. Please try again.')
      )
    } finally {
      setManaging(false)
    }
  }
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
  const fixture = fixtureMode
  useEffect(() => {
    configureAnalytics(analyticsCatalog, analyticsEnabled)
  }, [analyticsCatalog, analyticsEnabled])
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
  }, [state?.id, state.revision])
  const p = currentPrompt(state)
  const showResult =
    state.result &&
    (previewRevision === state.revision ||
      record.visibility === 'public' ||
      ['results', 'capped'].includes(state.status))
  const guidance = recoveryCopy[p.promptId] ?? recoveryCopy.root!
  const unavailableQuestion = !recoveryCopy[p.promptId]
  const needsAction = ['exhausted', 'navigation', 'stopped'].includes(
    state.recovery.reason ?? ''
  )
  const allowed =
    record.visibility === 'private' &&
    !uncertain &&
    canSubmit(state) &&
    !unavailableQuestion &&
    !busy
  const excessCharacters = Math.max(0, state.draft.length - limits.answerChars)
  const answerTooLong = excessCharacters > 0
  const turns = conversationTurns(state)
  const currentTurn = turns[turns.length - 1]!
  return (
    <AnswerNavigationProvider
      answerIds={state.answers.map((answer) => answer.id)}
    >
      <section className='relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-10'>
        {state.recovery.paperclipActive && (
          <Paperclips dismiss={() => void act({ type: 'dismiss' })} />
        )}
        <div className='relative flex flex-col gap-8'>
          <Link href='/assessments' className='text-sm underline'>
            My assessments
          </Link>
          {showResult && (
            <div className='flex flex-wrap items-center gap-3'>
              {record.visibility === 'public' ? (
                <>
                  <Button asChild variant='outline'>
                    <Link href={`/assessments/public/${state.id}`}>
                      View public assessment
                    </Link>
                  </Button>
                  <Button
                    variant='outline'
                    disabled={busy || managing}
                    onClick={() => void visibility('private')}
                  >
                    Make private
                  </Button>
                  <Button
                    variant='ghost'
                    onClick={() => {
                      void navigator.clipboard
                        .writeText(
                          `${window.location.origin}/assessments/public/${state.id}`
                        )
                        .then(() => toast.success('Public link copied.'))
                        .catch(() =>
                          toast.error(
                            'Unable to copy. Open the public assessment to copy its URL.'
                          )
                        )
                    }}
                  >
                    Copy public link
                  </Button>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button disabled={busy || managing || Boolean(uncertain)}>
                      Share assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Publish your full assessment?</DialogTitle>
                      <DialogDescription>
                        Anyone with the link can view your answers and results.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant='outline'>Keep private</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={() => void visibility('public')}>
                          Publish assessment
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {uncertain && !busy && (
            <Alert>
              <AlertTitle>Confirm your last submission</AlertTitle>
              <AlertDescription>
                Your response may have been saved.{' '}
                <Button
                  variant='outline'
                  onClick={() => void act(uncertain.operation)}
                >
                  Check submission
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {record.operation &&
            ['failed', 'interrupted'].includes(record.operation.status) &&
            record.operation.baseRevision === state.revision &&
            !uncertain && (
              <Alert>
                <AlertTitle>This step did not finish</AlertTitle>
                <AlertDescription>
                  Your previous results are unchanged.{' '}
                  <Button
                    disabled={busy}
                    onClick={() => void act(record.operation!.action, true)}
                  >
                    Retry saved submission
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          {notice && (
            <Button variant='ghost' onClick={() => void refresh()}>
              Refresh saved progress
            </Button>
          )}

          <div className='flex flex-col gap-6'>
            {notice && (
              <Alert>
                <AlertTitle>Saved progress</AlertTitle>
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
                    Your saved assessment will keep its earlier version. Start a
                    new assessment to try the updated draft.
                  </AlertDescription>
                </Alert>
              )}
            {fixture && (
              <Badge variant='outline'>
                Fixture mode · synthetic judgments
              </Badge>
            )}
          </div>
          <ConversationHistory
            turns={showResult ? turns : turns.slice(0, -1)}
            operations={debugMode ? debugOperations : undefined}
          />
          <div className='flex flex-col gap-6'>
            {showResult ? (
              <ResultView
                personas={personas}
                state={state}
                act={(op) => void act(op)}
                busy={busy || managing}
                published={record.visibility === 'public'}
                operations={debugOperations}
              />
            ) : (
              <>
                <div>
                  {state.answers.length > 0 && (
                    <p className='mb-5 text-xs text-muted-foreground'>
                      {`${state.answers.length} substantive ${state.answers.length === 1 ? 'answer' : 'answers'} · question ${p.ordinal}${p.ordinal >= promptLimit(state) - 2 ? ` of ${promptLimit(state)}` : ''}`}
                    </p>
                  )}
                  <h2 className='text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl'>
                    {p.text}
                  </h2>
                </div>
                <ConversationReplies turn={currentTurn} />
                {unavailableQuestion && (
                  <Alert>
                    <AlertTitle>
                      This question is no longer available
                    </AlertTitle>
                    <AlertDescription>
                      Your history and draft are preserved. Choose a different
                      question below to continue.
                    </AlertDescription>
                  </Alert>
                )}
                {p.ordinal >= promptLimit(state) - 2 && (
                  <Alert>
                    <AlertTitle>Approaching the limit</AlertTitle>
                    <AlertDescription>
                      This assessment ends at {promptLimit(state)} prompts. You
                      can restart afterward.
                    </AlertDescription>
                  </Alert>
                )}
                {(state.status === 'recovery' || needsAction) && (
                  <Alert>
                    <AlertTitle>
                      {state.recovery.reason === 'paperclips'
                        ? 'We’ve made some paperclips.'
                        : needsAction
                          ? 'Choose what to do next'
                          : 'Another try?'}
                    </AlertTitle>
                    <AlertDescription>
                      {state.recovery.reason === 'paperclips'
                        ? "You found the easter egg! Now let's get back to business..."
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
                    if (!state.draft.trim()) {
                      toast.error('Enter an answer before continuing.')
                      return
                    }
                    if (allowed && !answerTooLong)
                      void act({ type: 'answer', text: state.draft.trim() })
                  }}
                >
                  <FieldGroup>
                    <Field
                      data-invalid={answerTooLong}
                      data-disabled={!allowed}
                    >
                      <FieldLabel htmlFor='answer' className='sr-only'>
                        Your answer
                      </FieldLabel>
                      <Textarea
                        id='answer'
                        required
                        value={state.draft}
                        placeholder='A few sentences is plenty. Using speech-to-text is encouraged.'
                        disabled={!allowed}
                        aria-invalid={answerTooLong}
                        aria-describedby={
                          answerTooLong
                            ? 'answer-length answer-limit'
                            : undefined
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
                            {excessCharacters === 1
                              ? 'character'
                              : 'characters'}{' '}
                            to continue.
                          </FieldError>
                        </>
                      )}
                    </Field>
                    <Field>
                      <div className='flex flex-wrap gap-3'>
                        {eligible(state) && (
                          <Button
                            type='button'
                            disabled={busy}
                            variant='ghost'
                            onClick={() => void act({ type: 'project' })}
                          >
                            View my results
                          </Button>
                        )}
                        {needsAction &&
                          state.recovery.evaluated < limits.recovery && (
                            <Button
                              type='button'
                              disabled={busy}
                              onClick={() => void act({ type: 'retry' })}
                            >
                              Try again
                            </Button>
                          )}
                        {state.prompts.length < promptLimit(state) &&
                          (needsAction ||
                            state.status === 'recovery' ||
                            unavailableQuestion) && (
                            <Button
                              type='button'
                              disabled={busy}
                              variant='outline'
                              onClick={() => void act({ type: 'skip' })}
                            >
                              Try a different question
                            </Button>
                          )}
                        {!needsAction && (
                          <Button
                            type='submit'
                            className='ml-auto'
                            aria-keyshortcuts='Meta+Enter Control+Enter'
                            disabled={!allowed || answerTooLong}
                          >
                            {busy && (
                              <Spinner
                                data-icon='inline-start'
                                aria-hidden='true'
                              />
                            )}
                            {busy ? 'Reflecting on your answer' : 'Continue'}
                          </Button>
                        )}
                      </div>
                    </Field>
                  </FieldGroup>
                </form>
                <div className='space-y-2 text-xs leading-relaxed text-muted-foreground'>
                  <p>
                    The assessment only takes a few minutes. Results may be
                    shown after your first answer, or we’ll wrap up
                    automatically when Jev has enough confidence.
                  </p>
                  <p>
                    Your answers will remain private unless you choose to
                    publish them at the end.
                  </p>
                </div>
                {state.answers.length > 0 && (
                  <ReadinessMeter
                    state={state}
                    debug={debugMode}
                    disabled={busy}
                    onViewResults={() => void act({ type: 'project' })}
                  />
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
            <div className='flex items-center justify-between gap-4'>
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
    </AnswerNavigationProvider>
  )
}
