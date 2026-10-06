'use client'

import { useState } from 'react'
import { ArrowRightIcon, ArrowUpIcon, ArrowUpRightIcon } from 'lucide-react'
import { highlightQuadrant } from '@/lib/blog/chart-geometry'

export type LandscapePoint = {
  key: string
  label: string
  x: number
  y: number
  method: string
  reach: string
  href: string
  side?: 'left' | 'right'
  shift?: number
  highlight?: boolean
}

type Axis = { title: string; start: string; end: string }

/**
 * The interactive half of DataLandscape: points with direct labels (numbers
 * on phones, keyed in a list below), and one details panel that follows the
 * pointer, a tap or keyboard focus. Every word stays horizontal, so nothing is
 * clipped at any width. With `axes` at the middle, as on the site's map, the
 * vertical axis title sits over the middle line instead of the left edge.
 */
export function LandscapePlot({
  points,
  x,
  y,
  hint,
  axes = 'edge'
}: {
  points: LandscapePoint[]
  x: Axis
  y: Axis
  hint: string
  axes?: 'edge' | 'middle'
}) {
  const initial = (points.find((point) => point.highlight) ?? points[0]!).key
  const [selected, setSelected] = useState(initial)
  const [hovered, setHovered] = useState<string | null>(null)
  const active = points.find((point) => point.key === (hovered ?? selected))!
  const corner = highlightQuadrant(points)
  const select = (key: string) => {
    setSelected(key)
    setHovered(null)
  }
  return (
    <div className='flex flex-col gap-3'>
      <p
        className={`flex items-center gap-1 text-xs font-semibold text-body-foreground ${axes === 'middle' ? 'justify-center' : ''}`}
      >
        <ArrowUpIcon aria-hidden className='size-3 shrink-0' />
        {y.title}
      </p>
      <div className='relative h-80 border-b border-l border-foreground/40 sm:h-96'>
        {/* Midlines split the space into quadrants; the highlighted point's
            quadrant is tinted, and a chart without a highlight tints none. */}
        {corner && (
          <div
            aria-hidden
            className={`absolute h-1/2 w-1/2 bg-chart-coral/6 ${corner.top ? 'top-0' : 'bottom-0'} ${corner.right ? 'right-0' : 'left-0'}`}
          />
        )}
        <div
          aria-hidden
          className='absolute inset-y-0 left-1/2 w-px bg-border'
        />
        <div
          aria-hidden
          className='absolute inset-x-0 top-1/2 h-px bg-border'
        />
        <span className='absolute top-1.5 left-2 text-xs text-muted-foreground'>
          {y.end}
        </span>
        <span className='absolute bottom-1.5 left-2 text-xs text-muted-foreground'>
          {y.start}
        </span>
        <div className='absolute inset-x-3 top-9 bottom-9'>
          {points.map((point, index) => {
            const isActive = point.key === active.key
            const left = point.side === 'left'
            return (
              <button
                key={point.key}
                type='button'
                aria-pressed={point.key === selected}
                aria-label={point.label}
                onPointerEnter={() => setHovered(point.key)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => select(point.key)}
                onClick={() => select(point.key)}
                className={`absolute flex items-center gap-1.5 rounded-full p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring ${left ? 'flex-row-reverse' : ''} ${isActive ? 'z-10' : ''}`}
                style={{
                  left: `${point.x * 100}%`,
                  top: `${(1 - point.y) * 100}%`,
                  transform: `translate(${left ? 'calc(-100% + 1rem)' : '-1rem'}, calc(-50% + ${point.shift ?? 0}px))`
                }}
              >
                <span
                  aria-hidden
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-card tabular-nums ring-2 transition-[box-shadow] sm:size-3.5 ${point.highlight ? 'bg-chart-coral sm:size-4' : 'bg-chart-ink'} ${isActive ? 'ring-foreground' : 'ring-card'}`}
                >
                  <span className='sm:hidden'>{index + 1}</span>
                </span>
                <span
                  aria-hidden
                  className={`hidden rounded-sm bg-card/85 px-0.5 text-sm leading-tight whitespace-nowrap sm:inline ${isActive || point.highlight ? 'font-semibold text-foreground' : 'text-body-foreground'}`}
                >
                  {point.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
      <div className='flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-xs text-muted-foreground'>
        <span>{x.start}</span>
        <span className='order-last flex basis-full items-center justify-center gap-1 font-semibold text-body-foreground sm:order-none sm:basis-auto'>
          {x.title}
          <ArrowRightIcon aria-hidden className='size-3 shrink-0' />
        </span>
        <span>{x.end}</span>
      </div>
      <div className='flex flex-col gap-1.5'>
        <p className='text-xs text-muted-foreground'>{hint}</p>
        <div
          aria-live='polite'
          className={`flex min-h-36 flex-col gap-1.5 rounded-xl border-l-4 bg-muted/60 p-4 text-sm sm:min-h-28 ${active.highlight ? 'border-chart-coral' : 'border-chart-ink'}`}
        >
          <a
            href={active.href}
            target='_blank'
            rel='noreferrer'
            className='group inline-flex items-center gap-1 self-start font-semibold'
          >
            <span className='underline underline-offset-4'>{active.label}</span>
            <ArrowUpRightIcon
              aria-hidden
              className='size-3 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground'
            />
          </a>
          <p className='text-body-foreground'>{active.method}</p>
          <p className='text-muted-foreground'>{active.reach}</p>
        </div>
      </div>
      <ol className='grid grid-cols-1 gap-x-4 gap-y-1 text-xs min-[420px]:grid-cols-2 sm:hidden'>
        {points.map((point, index) => (
          <li key={point.key}>
            <button
              type='button'
              aria-pressed={point.key === selected}
              onClick={() => select(point.key)}
              className={`flex w-full items-baseline gap-2 rounded-md px-1 py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring ${point.key === active.key ? 'bg-muted font-semibold' : ''}`}
            >
              <span className='w-4 shrink-0 text-right text-muted-foreground tabular-nums'>
                {index + 1}
              </span>
              {point.label}
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
