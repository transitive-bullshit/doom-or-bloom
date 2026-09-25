'use client'

import { useEffect, useState, type RefObject } from 'react'
import {
  createPrefetchIntent,
  nearbyPortraits,
  type NearbyPortrait,
  type PrefetchIntent
} from '@/lib/landing/prefetch-intent'

export function usePersonaPrefetch(rootRef: RefObject<HTMLElement | null>) {
  const [prefetch] = useState(createPrefetchIntent)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const connection = (
      navigator as Navigator & {
        connection?: EventTarget & {
          saveData?: boolean
          effectiveType?: string
        }
      }
    ).connection
    let frame = 0
    let points: NearbyPortrait[] | null = null
    let focused: string | null = null
    const link = (target: EventTarget | null) => {
      const node =
        target instanceof Element
          ? target.closest<HTMLElement>('[data-prefetch-key]')
          : null
      return node && root.contains(node) ? node.dataset.prefetchKey! : null
    }
    const select = (keys: string[], intent: PrefetchIntent) => {
      const constrained =
        connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')
      if (document.hidden || !navigator.onLine || constrained) prefetch.clear()
      else prefetch.select(keys, intent)
    }
    const cancelFrame = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }
    const clear = () => {
      cancelFrame()
      prefetch.clear()
    }
    const resetGeometry = () => {
      points = null
      clear()
      // Focus can scroll a directory link into view after its focusin event.
      if (focused) select([focused], 'explicit')
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !fine.matches) return
      focused = null
      cancelFrame()
      frame = requestAnimationFrame(() => {
        frame = 0
        const direct = link(event.target)
        const chart = root.querySelector<HTMLElement>('.study-chart')
        if (!chart?.contains(event.target as Node))
          return select(direct ? [direct] : [], 'hover')
        points ??= Array.from(
          chart.querySelectorAll<HTMLElement>('[data-prefetch-key]'),
          (node) => {
            const rect = node.getBoundingClientRect()
            return {
              key: node.dataset.prefetchKey!,
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              radius: rect.width / 2
            }
          }
        )
        const nearby = nearbyPortraits(points, event.clientX, event.clientY)
        select(
          direct ? [direct, ...nearby.filter((key) => key !== direct)] : nearby,
          direct ? 'hover' : 'nearby'
        )
      })
    }
    const leave = () => {
      cancelFrame()
      select(focused ? [focused] : [], 'explicit')
    }
    const focus = (event: FocusEvent) => {
      if (
        !(event.target instanceof Element) ||
        !event.target.matches(':focus-visible')
      )
        return
      cancelFrame()
      focused = link(event.target)
      select(focused ? [focused] : [], 'explicit')
    }
    const blur = (event: FocusEvent) => {
      focused = link(event.relatedTarget)
      select(focused ? [focused] : [], 'explicit')
    }
    const press = (event: PointerEvent) => {
      focused = null
      cancelFrame()
      const key = link(event.target)
      select(key ? [key] : [], 'explicit')
    }
    const deactivate = () => {
      focused = null
      clear()
    }
    const observer = new ResizeObserver(resetGeometry)
    observer.observe(root)
    root.addEventListener('pointermove', move, { passive: true })
    root.addEventListener('pointerleave', leave)
    root.addEventListener('pointerdown', press, { passive: true })
    root.addEventListener('pointercancel', deactivate)
    root.addEventListener('focusin', focus)
    root.addEventListener('focusout', blur)
    window.addEventListener('scroll', resetGeometry, {
      passive: true,
      capture: true
    })
    window.addEventListener('resize', resetGeometry)
    window.addEventListener('blur', deactivate)
    window.addEventListener('offline', deactivate)
    document.addEventListener('visibilitychange', deactivate)
    connection?.addEventListener('change', deactivate)
    return () => {
      clear()
      observer.disconnect()
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', leave)
      root.removeEventListener('pointerdown', press)
      root.removeEventListener('pointercancel', deactivate)
      root.removeEventListener('focusin', focus)
      root.removeEventListener('focusout', blur)
      window.removeEventListener('scroll', resetGeometry, true)
      window.removeEventListener('resize', resetGeometry)
      window.removeEventListener('blur', deactivate)
      window.removeEventListener('offline', deactivate)
      document.removeEventListener('visibilitychange', deactivate)
      connection?.removeEventListener('change', deactivate)
    }
  }, [prefetch, rootRef])
  return prefetch
}
