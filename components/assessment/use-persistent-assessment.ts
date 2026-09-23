'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Assessment, Operation } from '@/lib/assessment/schema'
import { assessmentSchema } from '@/lib/assessment/schema'
import { currentPrompt } from '@/lib/assessment/state'
import type {
  OwnedAssessment,
  OperationOutcome
} from '@/lib/assessments/repository'
import type { Submission } from '@/lib/assessments/contracts'
import {
  api,
  ApiError,
  userErrorMessage,
  readDraft,
  readPending,
  writeDraft,
  writePending
} from '@/lib/assessments/client'
import { saveDebugOperation } from '@/lib/debug/trace-storage'
import { emitEvent } from '@/lib/analytics/client'
import { transitionEvents } from '@/lib/analytics/events'

export function usePersistentAssessment(initial: OwnedAssessment) {
  const [record, setRecord] = useState(initial)
  const [notice, setNotice] = useState('')
  const [sending, setSending] = useState(false)
  const [uncertain, setUncertain] = useState<Submission | null>(null)
  const state = useRef(initial.assessment)
  const inFlight = useRef(false)
  const endpoint = `/api/assessments/${initial.assessment.id}`
  const persist = useCallback((value: Assessment) => {
    state.current = value
    setRecord((previous) => ({ ...previous, assessment: value }))
    try {
      writeDraft(value.id, currentPrompt(value).id, value.draft)
    } catch {
      setNotice(
        'Unsubmitted typing cannot be saved in this browser. Submitted progress is saved on the server.'
      )
    }
  }, [])
  const refresh = useCallback(async () => {
    const next = await api<OwnedAssessment>(endpoint)
    const assessment = assessmentSchema.parse(next.assessment)
    const saved = readPending(assessment.id)
    const op = next.operation
    const promptId = currentPrompt(assessment).id
    let draft =
      readDraft(assessment.id, promptId) ||
      (state.current.id === assessment.id &&
      currentPrompt(state.current).id === promptId
        ? state.current.draft
        : '')
    if (
      saved &&
      op?.requestKey === saved.requestKey &&
      op.status === 'succeeded'
    ) {
      draft = ''
      try {
        writePending(null, assessment.id)
        writeDraft(assessment.id, currentPrompt(assessment).id, '')
      } catch {
        /* State is already committed. */
      }
      setUncertain(null)
    } else if (
      saved &&
      op?.requestKey === saved.requestKey &&
      ['failed', 'interrupted'].includes(op.status)
    ) {
      try {
        writePending(null, assessment.id)
      } catch {
        /* A terminal operation is safe to rediscover. */
      }
      setUncertain(null)
    } else if (saved) setUncertain(saved)
    if (
      !draft &&
      op &&
      ['failed', 'interrupted', 'running'].includes(op.status) &&
      op.action.type === 'answer' &&
      op.baseRevision === assessment.revision
    )
      draft = op.action.text
    const value = { ...assessment, draft }
    state.current = value
    setRecord({ ...next, assessment: value })
    return next
  }, [endpoint])
  useEffect(() => {
    queueMicrotask(() => {
      void api('/api/auth/get-session').catch(() => {})
      void refresh().catch((err) =>
        setNotice(
          userErrorMessage(
            err,
            'Couldn’t load your assessment. Please refresh the page.'
          )
        )
      )
    })
  }, [refresh])
  const processing = record.operation?.status === 'running'
  useEffect(() => {
    if (!processing) return
    const timer = setInterval(() => {
      void refresh().catch(() =>
        setNotice(
          'Connection interrupted. Your answer may still be processing. Please refresh the page.'
        )
      )
    }, 1500)
    return () => clearInterval(timer)
  }, [processing, refresh])

  const act = async (operation: Operation, explicitRetry = false) => {
    if (inFlight.current || processing) return
    const before = state.current
    const previous = record.operation
    const input: Submission = uncertain ?? {
      assessmentId: before.id,
      expectedRevision: before.revision,
      requestKey: crypto.randomUUID(),
      operation,
      retryOf: explicitRetry && previous ? previous.id : undefined,
      debug: true
    }
    if (
      uncertain &&
      JSON.stringify(uncertain.operation) !== JSON.stringify(operation)
    ) {
      setNotice('Confirm the previous submission before making another change.')
      return
    }
    inFlight.current = true
    setSending(true)
    setNotice('')
    setUncertain(input)
    try {
      writePending(input, before.id)
    } catch {
      setNotice('Keep this tab open until the submission is confirmed.')
    }
    try {
      const result = await api<OperationOutcome>(endpoint, {
        method: 'POST',
        body: JSON.stringify(input)
      })
      setRecord((previous) => ({ ...previous, operation: result.operation }))
      if (result.operation.status === 'running') return
      if (result.debug && result.provider) {
        await saveDebugOperation(before.id, {
          trace: result.debug,
          provider: result.provider,
          operation,
          assessment: result.assessment,
          createdAt: new Date().toISOString()
        }).catch(() =>
          setNotice(
            'Your assessment is saved, but browser debug details could not be saved.'
          )
        )
      }
      try {
        writePending(null, before.id)
      } catch {
        /* Terminal state is on the server. */
      }
      setUncertain(null)
      if (result.operation.status === 'succeeded' && result.assessment) {
        const next = assessmentSchema.parse(result.assessment)
        if (next.revision >= state.current.revision) {
          persist({ ...next, draft: '' })
          transitionEvents(before, next, operation, input.requestKey).forEach(
            emitEvent
          )
        }
      } else
        setNotice(
          'This step did not complete. Your previous results are unchanged and your submission is saved. Retry when ready.'
        )
      await refresh()
    } catch (err) {
      setNotice(
        userErrorMessage(
          err,
          'We couldn’t confirm your answer was saved. Check its status before continuing.'
        )
      )
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        try {
          writePending(null, before.id)
        } catch {
          /* Request was rejected before acceptance. */
        }
        setUncertain(null)
        await refresh().catch(() => {})
      }
      // Network/server errors retain the original key: they do not prove rollback.
    } finally {
      inFlight.current = false
      setSending(false)
    }
  }
  return {
    record,
    state: record.assessment,
    busy: sending || processing,
    notice,
    uncertain,
    persist,
    act,
    refresh
  }
}
