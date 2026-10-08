import { useEffect, useRef } from 'react'
import { separatePortraits } from '@/lib/landing/portrait-layout'
import { portraitFlights, springEasing } from '@/lib/landing/portrait-entrance'

type Point = { outlook: number | null; transformation: number | null }

// Each map flies in on its first reveal per page load; later visits fade in.
const flown = new Set<string>()
let flightEasing: string | undefined

/** Portraits stay hidden until `ready` and the first layout, then appear together. */
export function usePortraitLayout(
  points: Point[],
  ready: boolean,
  entrance: string
) {
  const ref = useRef<HTMLDivElement>(null)
  const revealed = useRef(false)
  useEffect(() => {
    const chart = ref.current
    if (!chart) return
    const portraits = Array.from(
      chart.querySelectorAll<HTMLAnchorElement>('.study-portrait')
    )
    const dots = Array.from(chart.querySelectorAll<HTMLElement>('.study-dot'))
    const sizes = new Map<Element, { width: number; height: number }>()
    let frame = 0
    let revealFrame = 0
    let initialLayout = true
    let onScreen = true
    let flights: Animation[] = []
    const reveal = (
      chartSize: { width: number; height: number },
      positions: ReturnType<typeof separatePortraits>
    ) => {
      revealed.current = true
      const fly =
        onScreen &&
        !flown.has(entrance) &&
        matchMedia('(prefers-reduced-motion: no-preference)').matches
      flown.add(entrance)
      if (!fly) {
        chart.dataset.reveal = 'fade'
        return
      }
      flightEasing ??= CSS.supports(
        'transition-timing-function',
        'linear(0, 1)'
      )
        ? springEasing()
        : 'cubic-bezier(0.23, 1, 0.32, 1)'
      const landing = portraits.flatMap((node, i) =>
        node.dataset.portraitFailed === 'true'
          ? []
          : [{ node, dot: dots[i], target: positions[i]! }]
      )
      const plans = portraitFlights(
        landing.map(({ target }) => target),
        chartSize.width,
        chartSize.height
      )
      chart.dataset.reveal = 'fly'
      flights = landing.map(({ node, dot }, i) => {
        const { keyframes, delay, duration } = plans[i]!
        // Its placeholder dot fades as the portrait arrives over it.
        dot?.style.setProperty('--landing', `${delay + duration / 4}ms`)
        // Portraits take pointer input once they land.
        node.dataset.flying = 'true'
        const flight = node.animate(keyframes, {
          delay,
          duration,
          easing: flightEasing,
          fill: 'backwards'
        })
        const land = () => delete node.dataset.flying
        flight.finished.then(land, land)
        return flight
      })
      void Promise.allSettled(flights.map((flight) => flight.finished)).then(
        () => {
          chart.dataset.reveal = 'landed'
        }
      )
    }
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
      // A resize mid-flight lands every portrait at its new position.
      for (const flight of flights) flight.finish()
      // All measurements come from ResizeObserver; this phase only writes.
      chart.style.setProperty('--chart-width', `${chartSize.width}px`)
      portraits.forEach((node, i) => {
        const position = positions[i]!
        if (initialLayout) node.style.transition = 'none'
        node.style.left = '0px'
        node.style.top = '0px'
        node.style.transform = `translate(${position.x}px, ${position.y}px) translate(-50%, -50%) scale(var(--portrait-scale, 1))`
        // CSS centers each label at its own width, shifting only at chart edges.
        node.style.setProperty('--label-left-space', `${position.x}px`)
      })
      chart.dataset.layoutReady = 'true'
      if (ready && !revealed.current) reveal(chartSize, positions)
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
    // An entrance nobody sees would only delay input; offscreen maps fade in.
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true
    })
    observer.observe(chart)
    portraits.forEach((node) => observer.observe(node))
    visibility.observe(chart)
    return () => {
      observer.disconnect()
      visibility.disconnect()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(revealFrame)
      for (const flight of flights) flight.cancel()
    }
  }, [points, ready, entrance])
  return ref
}
