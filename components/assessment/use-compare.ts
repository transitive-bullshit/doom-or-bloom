'use client'
import { useEffect, useState } from 'react'
import {
  comparedWorldviewSchema,
  readCompareTarget,
  writeCompareTarget,
  type ComparedWorldview,
  type CompareTarget
} from '@/lib/sharing/compare'

export type CompareState =
  | { status: 'none' }
  | { status: 'loading'; target: CompareTarget }
  | { status: 'ready'; target: CompareTarget; other: ComparedWorldview }
  | { status: 'gone'; target: CompareTarget }

/**
 * The person this participant came to compare with, if any. Loaded from
 * public data without cookies: the server never learns which assessment is
 * comparing, and nothing about the comparison is saved.
 *
 * `shown` is the participant's choice between just their result and the
 * comparison, kept with the target in this browser.
 */
export function useCompare(assessmentId: string, enabled: boolean) {
  const [state, setState] = useState<CompareState>({ status: 'none' })
  const [shown, setShown] = useState(true)
  useEffect(() => {
    if (!enabled) return
    const saved = readCompareTarget(assessmentId)
    if (!saved) return
    const { target } = saved
    let active = true
    queueMicrotask(() => {
      if (!active) return
      setShown(saved.shown)
      setState({ status: 'loading', target })
    })
    const url =
      target.kind === 'persona'
        ? `/api/personas/${target.slug}/comparison`
        : `/api/share-links/${target.id}`
    void fetch(url, { credentials: 'omit' })
      .then(async (response) => {
        if (!active) return
        if (response.status === 404) return setState({ status: 'gone', target })
        if (!response.ok) throw new Error('Comparison unavailable')
        const other = comparedWorldviewSchema.parse(await response.json())
        setState({ status: 'ready', target, other })
      })
      .catch(() => {
        // A network failure is not a revoked link: show nothing this time.
        if (active) setState({ status: 'none' })
      })
    return () => {
      active = false
    }
  }, [assessmentId, enabled])
  const show = (next: boolean) => {
    if (state.status === 'none') return
    setShown(next)
    writeCompareTarget(assessmentId, state.target, next)
  }
  return { ...state, shown, show }
}
