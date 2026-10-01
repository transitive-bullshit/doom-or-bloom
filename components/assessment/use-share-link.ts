'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale } from 'next-intl'
import { api } from '@/lib/assessments/client'
import type { ShareSurface } from '@/lib/sharing/share-caption'
import type { OwnerShareLink } from '@/lib/sharing/share-links'

type State = {
  /** The active link for the current result, if one exists. */
  link: OwnerShareLink | null
  /** Active links for any of this assessment's results. */
  active: number
}

/**
 * The owner's card-only share link. Nothing is created until the first share
 * action; later actions reuse it, and a new result gets a new link.
 */
export function useShareLink({
  assessmentId,
  evidenceRevision,
  enabled,
  onCreated
}: {
  assessmentId: string
  evidenceRevision: number | null
  enabled: boolean
  onCreated: (surface: ShareSurface) => void
}) {
  const locale = useLocale()
  const [state, setState] = useState<State>({ link: null, active: 0 })
  const pending = useRef<Promise<OwnerShareLink> | null>(null)
  const created = useRef(onCreated)
  useEffect(() => {
    created.current = onCreated
  })
  useEffect(() => {
    if (!enabled || evidenceRevision === null) return
    let active = true
    pending.current = null
    void api<State>(`/api/assessments/${assessmentId}/share-link`)
      .then((saved) => {
        if (active) setState(saved)
      })
      .catch(() => {
        /* Sharing still works; the link is created on first use. */
      })
    return () => {
      active = false
    }
  }, [assessmentId, evidenceRevision, enabled])
  const link =
    state.link && state.link.evidenceRevision === evidenceRevision
      ? state.link
      : null
  const ensure = useCallback(
    (name: string | null, surface: ShareSurface) => {
      if (link) return Promise.resolve(link)
      pending.current ??= api<{ link: OwnerShareLink; created: boolean }>(
        `/api/assessments/${assessmentId}/share-link`,
        { method: 'POST', body: JSON.stringify({ name: name ?? '', locale }) }
      )
        .then((saved) => {
          setState((previous) => ({
            link: saved.link,
            active: previous.active + (saved.created ? 1 : 0)
          }))
          if (saved.created) created.current(surface)
          return saved.link
        })
        .finally(() => {
          pending.current = null
        })
      return pending.current
    },
    [assessmentId, link, locale]
  )
  const revoke = useCallback(async () => {
    await api(`/api/assessments/${assessmentId}/share-link`, {
      method: 'DELETE'
    })
    pending.current = null
    setState({ link: null, active: 0 })
  }, [assessmentId])
  return { link, active: state.active, ensure, revoke }
}
