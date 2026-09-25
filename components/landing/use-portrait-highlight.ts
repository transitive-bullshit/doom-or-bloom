'use client'

import { useEffect, useRef } from 'react'

/** Highlighting is presentation only: never rerender or sort the directory on hover. */
export function usePortraitHighlight(points: readonly { id: string }[]) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const portraits = new Map(
      Array.from(
        root.querySelectorAll<HTMLElement>('.study-portrait'),
        (node) => [node.dataset.personId!, node]
      )
    )
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let hovered: string | null = null
    let focused: string | null = null
    let highlighted: string | null = null
    let frame = 0
    const person = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null
      const link = target.closest<HTMLElement>('[data-person-id]')
      return link && root.contains(link) ? link : null
    }
    const update = () => {
      frame = 0
      const next = hovered ?? focused
      if (next === highlighted) return
      if (highlighted)
        portraits.get(highlighted)?.removeAttribute('data-highlighted')
      if (next) portraits.get(next)?.setAttribute('data-highlighted', 'true')
      // Moving between people changes only the old and new portrait, not every sibling.
      if ((next !== null) !== (highlighted !== null)) {
        root.dataset.highlighting = String(next !== null)
      }
      highlighted = next
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const over = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !finePointer.matches) return
      hovered = person(event.target)?.dataset.personId ?? null
      schedule()
    }
    const out = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !finePointer.matches) return
      hovered = person(event.relatedTarget)?.dataset.personId ?? null
      schedule()
    }
    const focus = (event: FocusEvent) => {
      const link = person(event.target)
      if (!link?.matches(':focus-visible')) return
      hovered = null
      focused = link.dataset.personId ?? null
      schedule()
    }
    const blur = () => {
      focused = null
      schedule()
    }
    root.addEventListener('pointerover', over)
    root.addEventListener('pointerout', out)
    root.addEventListener('focusin', focus)
    root.addEventListener('focusout', blur)
    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener('pointerover', over)
      root.removeEventListener('pointerout', out)
      root.removeEventListener('focusin', focus)
      root.removeEventListener('focusout', blur)
      if (highlighted)
        portraits.get(highlighted)?.removeAttribute('data-highlighted')
      root.dataset.highlighting = 'false'
    }
  }, [points])

  return ref
}
