import { useEffect, useRef } from 'react'
import { separatePortraits } from '@/lib/landing/portrait-layout'

type Point = { outlook: number | null; transformation: number | null }

export function usePortraitLayout(points: Point[]) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const chart = ref.current
    if (!chart) return
    const portraits = Array.from(
      chart.querySelectorAll<HTMLAnchorElement>('.study-portrait')
    )
    const labels = portraits.map((node) => node.querySelector('span'))
    const sizes = new Map<Element, { width: number; height: number }>()
    let frame = 0
    let revealFrame = 0
    let initialLayout = true
    const layout = () => {
      frame = 0
      const chartSize = sizes.get(chart)
      if (
        !chartSize?.width ||
        !chartSize.height ||
        portraits.some((node) => !sizes.has(node))
      )
        return
      const boxes = portraits.map((node, i) => ({
        ...sizes.get(node)!,
        x: points[i]!.outlook! * chartSize.width,
        y: (1 - points[i]!.transformation!) * chartSize.height
      }))
      const positions = separatePortraits(
        boxes,
        chartSize.width,
        chartSize.height
      )
      // All measurements come from ResizeObserver; this phase only writes.
      portraits.forEach((node, i) => {
        const position = positions[i]!
        if (initialLayout) node.style.transition = 'none'
        node.style.left = '0px'
        node.style.top = '0px'
        node.style.transform = `translate(${position.x}px, ${position.y}px) translate(-50%, -50%) scale(var(--portrait-scale, 1))`
        const labelShift =
          Math.max(75, Math.min(chartSize.width - 75, position.x)) - position.x
        labels[i]?.style.setProperty('--label-shift', `${labelShift}px`)
      })
      chart.dataset.layoutReady = 'true'
      if (initialLayout) {
        initialLayout = false
        revealFrame = requestAnimationFrame(() => {
          portraits.forEach((node) => node.style.removeProperty('transition'))
        })
      }
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const box = entry.borderBoxSize[0]
        sizes.set(entry.target, {
          width: box?.inlineSize ?? entry.contentRect.width,
          height: box?.blockSize ?? entry.contentRect.height
        })
      }
      if (!frame) frame = requestAnimationFrame(layout)
    })
    observer.observe(chart)
    portraits.forEach((node) => observer.observe(node))
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(revealFrame)
    }
  }, [points])
  return ref
}
