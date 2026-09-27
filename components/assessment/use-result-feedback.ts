'use client'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Assessment } from '@/lib/assessment/schema'
import { placementGap, type MapPoint } from '@/lib/assessment/self-placement'
import { api } from '@/lib/assessments/client'
import {
  resultPlacement,
  type AgreementPayload,
  type FeedbackItem
} from '@/lib/assessments/feedback'
import { emitEvent } from '@/lib/analytics/client'
import { makeEvent } from '@/lib/analytics/events'

// What the participant sends; the server adds what was displayed.
export type Agreement = Omit<AgreementPayload, 'shown'>
type Item = FeedbackItem

// A guess made after seeing the result would be anchored by it, so the
// self-placement step is offered only right after a first result appears.
const freshFor = 20 * 60 * 1000
const revealedKey = (id: string) => `doom-or-bloom:result-revealed:${id}`

/**
 * Self-placement and agreement feedback for the owner’s current result.
 * Feedback never blocks the result: failures reveal it and keep going.
 */
export function useResultFeedback(state: Assessment, enabled: boolean) {
  const result = state.result
  const revision = result?.evidenceRevision ?? -1
  const [items, setItems] = useState<Item[]>([])
  const [stage, setStage] = useState<'pending' | 'guess' | 'revealed'>(
    enabled ? 'pending' : 'revealed'
  )
  const [localGuess, setLocalGuess] = useState<MapPoint | null>(null)
  const [busy, setBusy] = useState(false)
  const id = state.id
  const generatedAt = result?.experiment?.generatedAt
  const point = result ? resultPlacement(result) : { x: null, y: null }
  // An unplaced result has nothing to compare a guess with.
  const placed = point.x !== null && point.y !== null
  useEffect(() => {
    if (!enabled) return
    let disposed = false
    let revealed = false
    try {
      revealed = localStorage.getItem(revealedKey(id)) !== null
    } catch {
      /* Without storage, freshness alone decides. */
    }
    const generated = Date.parse(generatedAt ?? '')
    const fresh =
      Number.isFinite(generated) && Date.now() - generated < freshFor
    queueMicrotask(() => {
      if (!disposed)
        setStage(!revealed && fresh && placed ? 'guess' : 'revealed')
    })
    void api<{ feedback: Item[] }>(`/api/assessments/${id}/feedback`)
      .then(({ feedback }) => {
        if (disposed) return
        setItems(feedback)
        if (feedback.some((item) => item.kind === 'self_placement'))
          setStage('revealed')
      })
      .catch(() => {
        /* Feedback is optional; the result is unaffected. */
      })
    return () => {
      disposed = true
    }
  }, [enabled, id, generatedAt, placed])
  const reveal = () => {
    try {
      localStorage.setItem(revealedKey(id), String(revision))
    } catch {
      /* The saved guess still prevents a repeat prompt. */
    }
    setStage('revealed')
  }
  const store = async (body: Record<string, unknown>) => {
    const { feedback } = await api<{ feedback: Item }>(
      `/api/assessments/${id}/feedback`,
      {
        method: 'POST',
        body: JSON.stringify({ ...body, evidenceRevision: revision })
      }
    )
    setItems((present) => [
      ...present.filter(
        (item) =>
          item.kind !== feedback.kind ||
          item.evidenceRevision !== feedback.evidenceRevision
      ),
      feedback
    ])
    return feedback
  }
  const saved = items.findLast((item) => item.kind === 'self_placement')
  return {
    stage,
    busy,
    guess: saved?.kind === 'self_placement' ? saved.payload.guess : localGuess,
    agreement:
      (
        items.find(
          (item) =>
            item.kind === 'agreement' && item.evidenceRevision === revision
        ) as Extract<Item, { kind: 'agreement' }> | undefined
      )?.payload ?? null,
    submitGuess: async (guess: MapPoint) => {
      setBusy(true)
      setLocalGuess(guess)
      try {
        await store({ kind: 'self_placement', guess })
      } catch {
        /* Reveal regardless; the comparison still uses the local guess. */
      }
      if (point.x !== null && point.y !== null)
        emitEvent(
          makeEvent(state, 'self_placement_submitted', {
            placement_gap: placementGap(guess, {
              x: point.x,
              y: point.y
            })
          })
        )
      setBusy(false)
      reveal()
    },
    skip: () => {
      emitEvent(makeEvent(state, 'self_placement_skipped'))
      reveal()
    },
    submitAgreement: async (agreement: Agreement) => {
      try {
        await store({ kind: 'agreement', ...agreement })
        emitEvent(
          makeEvent(state, 'result_feedback_submitted', {
            feedback_rating: agreement.rating,
            feedback_aspects: agreement.aspects
          })
        )
        return true
      } catch {
        toast.error('Couldn’t save your feedback. Please try again.')
        return false
      }
    }
  }
}
