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
import { useLocale, useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { api, userErrorMessage } from '@/lib/assessments/client'
import { promptText } from '@/lib/assessment/display-text'
import { useAuthoredText } from './authored-text'
import {
  isBudgetFailure,
  operationFailureMessage
} from '@/lib/assessments/operation-failure'
import { BudgetNotice } from './budget-notice'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { PublishConfirmation } from './publish-confirmation'
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
import { emitEvent } from '@/lib/analytics/client'
import { makeEvent } from '@/lib/analytics/events'
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
  dimensions,
  budgetBlocked = false
}: {
  personas: PersonaComparison[]
  initial: OwnedAssessment
  /** Jev was out of budget when the page loaded; see BudgetNotice. */
  budgetBlocked?: boolean
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
  const root = useTranslations()
  const t = useTranslations('Interview')
  const authored = useAuthoredText()
  const locale = useLocale()
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
      toast.error(userErrorMessage(root, err, t('forkFailed')))
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
      if (value === 'public')
        emitEvent(makeEvent(state, 'assessment_published'))
      await refresh()
    } catch (err) {
      toast.error(userErrorMessage(root, err, t('visibilityFailed')))
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
  const failedOperation =
    record.operation &&
    ['failed', 'interrupted'].includes(record.operation.status) &&
    record.operation.baseRevision === state.revision &&
    !uncertain
      ? record.operation
      : null
  // The server found Jev out of budget when this page loaded. Any operation
  // since then replaces this notice with its own outcome.
  const budgetNoticeOnLoad =
    budgetBlocked &&
    record.visibility === 'private' &&
    (record.operation?.id ?? null) === (initial.operation?.id ?? null)
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
  // Publishing sits with the share actions at the reveal, not above the thread.
  const publishControl =
    record.visibility === 'public' ? (
      <>
        <span>{t('publicNote')}</span>
        <Button asChild variant='outline' size='sm'>
          <Link href={`/public/assessments/${state.id}`}>
            {t('viewPublic')}
          </Link>
        </Button>
        <Button
          variant='ghost'
          size='sm'
          disabled={busy || managing}
          onClick={() => void visibility('private')}
        >
          {t('makePrivate')}
        </Button>
      </>
    ) : (
      <>
        <span>{t('publishPrompt')}</span>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant='outline'
              size='sm'
              disabled={busy || managing || Boolean(uncertain)}
            >
              {t('publish')}
            </Button>
          </DialogTrigger>
          <PublishConfirmation onConfirm={() => void visibility('public')} />
        </Dialog>
      </>
    )
  const currentTurn = turns[turns.length - 1]!
  return (
    <AnswerNavigationProvider
      answerIds={state.answers.map((answer) => answer.id)}
    >
      <section className='content-column relative flex flex-1 flex-col justify-center py-10'>
        {state.recovery.paperclipActive && (
          <Paperclips dismiss={() => void act({ type: 'dismiss' })} />
        )}
        <div className='relative flex flex-col gap-8'>
          {uncertain && !busy && (
            <Alert>
              <AlertTitle>{t('confirmTitle')}</AlertTitle>
              <AlertDescription>
                {t('confirmDescription')}{' '}
                <Button
                  variant='outline'
                  onClick={() => void act(uncertain.operation)}
                >
                  {t('checkSubmission')}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          {failedOperation &&
            (isBudgetFailure(failedOperation.failureCategory) ? (
              <BudgetNotice saved>
                <Button
                  disabled={busy}
                  onClick={() => void act(failedOperation.action, true)}
                >
                  {t('retrySaved')}
                </Button>
              </BudgetNotice>
            ) : (
              <Alert>
                <AlertTitle>{t('failedTitle')}</AlertTitle>
                <AlertDescription>
                  {operationFailureMessage(
                    root,
                    failedOperation.failureCategory
                  )}{' '}
                  <Button
                    disabled={busy}
                    onClick={() => void act(failedOperation.action, true)}
                  >
                    {t('retrySaved')}
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          {!failedOperation && !showResult && budgetNoticeOnLoad && (
            <BudgetNotice saved={false} />
          )}
          {notice && (
            <Button variant='ghost' onClick={() => void refresh()}>
              {t('refreshProgress')}
            </Button>
          )}

          <div className='flex flex-col gap-6'>
            {notice && (
              <Alert>
                <AlertTitle>{t('savedProgress')}</AlertTitle>
                <AlertDescription>{notice}</AlertDescription>
              </Alert>
            )}
            {state.versions.content !== versions.content &&
              supportedContentVersions.some(
                (version) => version === state.versions.content
              ) && (
                <Alert>
                  <AlertTitle>{t('updatedDraftTitle')}</AlertTitle>
                  <AlertDescription>
                    {t('updatedDraftDescription')}
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
            turns={(showResult ? turns : turns.slice(0, -1)).filter(
              (turn) => turn.replies.length > 0
            )}
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
                publishControl={publishControl}
              />
            ) : (
              <>
                <div>
                  {state.answers.length > 0 && (
                    <p className='mb-5 text-xs text-muted-foreground'>
                      {p.ordinal >= promptLimit(state) - 2
                        ? t('questionOf', {
                            ordinal: p.ordinal,
                            limit: promptLimit(state)
                          })
                        : t('questionProgress', { ordinal: p.ordinal })}
                    </p>
                  )}
                  <h2 className='text-pretty'>
                    {promptText(root, p, authored)}
                  </h2>
                </div>
                <ConversationReplies turn={currentTurn} />
                {unavailableQuestion && (
                  <Alert>
                    <AlertTitle>{t('unavailableTitle')}</AlertTitle>
                    <AlertDescription>
                      {t('unavailableDescription')}
                    </AlertDescription>
                  </Alert>
                )}
                {p.ordinal >= promptLimit(state) - 2 && (
                  <Alert>
                    <AlertTitle>{t('limitTitle')}</AlertTitle>
                    <AlertDescription>
                      {t('limitDescription', { limit: promptLimit(state) })}
                    </AlertDescription>
                  </Alert>
                )}
                {(state.status === 'recovery' || needsAction) && (
                  <Alert>
                    <AlertTitle>
                      {state.recovery.reason === 'paperclips'
                        ? t('recovery.paperclipsTitle')
                        : needsAction
                          ? t('recovery.chooseTitle')
                          : t('recovery.retryTitle')}
                    </AlertTitle>
                    <AlertDescription>
                      {state.recovery.reason === 'paperclips'
                        ? t('recovery.paperclips')
                        : state.recovery.reason === 'exhausted'
                          ? guidance.exhausted
                          : state.recovery.reason === 'needs_clarification'
                            ? guidance.clarification
                            : state.recovery.reason === 'stopped'
                              ? t('recovery.stopped')
                              : state.recovery.reason === 'navigation'
                                ? t('recovery.navigation')
                                : guidance.reask}
                    </AlertDescription>
                  </Alert>
                )}
                <form
                  onSubmit={(event) => {
                    event.preventDefault()
                    if (!state.draft.trim()) {
                      toast.error(t('emptyAnswer'))
                      return
                    }
                    if (allowed && !answerTooLong)
                      void act({
                        type: 'answer',
                        text: state.draft.trim(),
                        locale
                      })
                  }}
                >
                  <FieldGroup>
                    <Field
                      data-invalid={answerTooLong}
                      data-disabled={!allowed}
                    >
                      <FieldLabel htmlFor='answer' className='sr-only'>
                        {t('answerLabel')}
                      </FieldLabel>
                      <Textarea
                        id='answer'
                        required
                        value={state.draft}
                        placeholder={t('placeholder')}
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
                            {t('length', {
                              count: state.draft.length,
                              limit: limits.answerChars
                            })}
                          </FieldDescription>
                          <FieldError id='answer-limit'>
                            {t('tooLong', { count: excessCharacters })}
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
                            {t('viewResults')}
                          </Button>
                        )}
                        {needsAction &&
                          state.recovery.evaluated < limits.recovery && (
                            <Button
                              type='button'
                              disabled={busy}
                              onClick={() => void act({ type: 'retry' })}
                            >
                              {t('tryAgain')}
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
                              {t('differentQuestion')}
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
                            {busy ? t('reflecting') : t('continue')}
                          </Button>
                        )}
                      </div>
                    </Field>
                  </FieldGroup>
                </form>
                <div className='space-y-2 text-xs leading-relaxed text-muted-foreground'>
                  <p>{t('duration')}</p>
                  <p>{t('privacy')}</p>
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
                    {t('busy')}
                  </p>
                )}
                {state.answers.length >= 6 && (
                  <p className='text-sm text-muted-foreground'>
                    {t('keepExploring')}
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
