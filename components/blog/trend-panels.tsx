'use client'

import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import {
  dateShare,
  linearShare,
  nearestIndex,
  thinTicks,
  unionDates,
  yearTicks
} from '@/lib/blog/chart-geometry'

type Tone = 'blue' | 'coral' | 'teal'
export type TrendPanel = {
  key: string
  title: string
  note?: string
  scale: {
    min: number
    max: number
    unit: 'percent' | 'year'
    ticks: number[]
  }
  series: {
    key: string
    label: string
    tone?: Tone
    dashed?: boolean
    points: { date: string; value: number; note?: string }[]
  }[]
}

// One panel's drawing, in viewBox units. Panels render about 320px wide on
// every screen (two columns on wide screens, one on phones), so text keeps its
// size.
const width = 320
const height = 188
const plot = { left: 34, right: 284, top: 16, bottom: 166 }
const toneColor: Record<Tone, string> = {
  blue: 'var(--chart-blue)',
  coral: 'var(--chart-coral)',
  teal: 'var(--chart-teal)'
}
const dash = '5 4'

function formatValue(value: number, unit: 'percent' | 'year', tag: string) {
  return unit === 'year'
    ? String(Math.round(value))
    : new Intl.NumberFormat(tag, {
        style: 'percent',
        maximumFractionDigits: 0
      }).format(value)
}

const monthYear = (date: string, tag: string) =>
  new Intl.DateTimeFormat(tag, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(`${date}T00:00:00Z`))

/** Two end labels closer than a line apart move apart, staying in the plot. */
function spread(ys: number[], gap = 12) {
  if (ys.length !== 2 || Math.abs(ys[0]! - ys[1]!) >= gap) return ys
  const middle = (ys[0]! + ys[1]!) / 2
  const [upper, lower] = [middle - gap / 2, middle + gap / 2]
  return ys[0]! <= ys[1]! ? [upper, lower] : [lower, upper]
}

/**
 * The interactive half of DataTrend: small multiples on one date axis, each
 * with a crosshair that snaps to the nearest survey and lists every series
 * there. Arrow keys move it when a panel has focus.
 */
export function TrendPanels({
  from,
  to,
  events,
  panels,
  tag,
  hint
}: {
  from: string
  to: string
  events: { date: string; label: string }[]
  panels: TrendPanel[]
  tag: string
  hint: string
}) {
  return (
    <div className='flex flex-col gap-3'>
      <div className='grid gap-x-6 gap-y-8 sm:grid-cols-2'>
        {panels.map((panel) => (
          <Panel
            key={panel.key}
            panel={panel}
            from={from}
            to={to}
            events={events}
            tag={tag}
          />
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>{hint}</p>
    </div>
  )
}

function Panel({
  panel,
  from,
  to,
  events,
  tag
}: {
  panel: TrendPanel
  from: string
  to: string
  events: { date: string; label: string }[]
  tag: string
}) {
  const [index, setIndex] = useState<number | null>(null)
  const { min, max, unit } = panel.scale
  const x = (date: string) =>
    plot.left + dateShare(date, from, to) * (plot.right - plot.left)
  const y = (value: number) =>
    plot.bottom - linearShare(value, min, max) * (plot.bottom - plot.top)
  const dates = unionDates(panel.series)
  const shares = dates.map((date) => dateShare(date, from, to))
  const years = thinTicks(yearTicks(from, to), 6)
  const ends = panel.series.map((series) => series.points.at(-1)!)
  const endYs = spread(ends.map((point) => y(point.value)))
  const date = index === null ? null : dates[index]!
  const onPointer = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const share = (event.clientX - box.left) / box.width
    setIndex(nearestIndex(shares, share))
  }
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    if (!step) return
    event.preventDefault()
    setIndex((current) =>
      Math.min(
        dates.length - 1,
        Math.max(0, (current ?? dates.length - 1) + step)
      )
    )
  }
  const shown = date ?? dates.at(-1)!
  const shownNote = panel.series
    .map((series) => series.points.find((entry) => entry.date === shown)?.note)
    .find(Boolean)
  return (
    <div className='flex h-full min-w-0 flex-col gap-2'>
      <div className='flex flex-col gap-0.5'>
        <p className='text-sm leading-snug font-semibold'>{panel.title}</p>
        {panel.note && (
          <p className='text-xs leading-snug text-muted-foreground'>
            {panel.note}
          </p>
        )}
      </div>
      {panel.series.length > 1 && (
        <ul aria-hidden className='flex flex-wrap gap-x-4 gap-y-1 text-xs'>
          {panel.series.map((series) => (
            <li key={series.key} className='flex items-center gap-1.5'>
              <svg viewBox='0 0 18 6' className='h-1.5 w-[18px]'>
                <line
                  x1='0'
                  x2='18'
                  y1='3'
                  y2='3'
                  stroke={toneColor[series.tone ?? 'blue']}
                  strokeWidth='2'
                  strokeDasharray={series.dashed ? '4 3' : undefined}
                />
              </svg>
              <span className='text-body-foreground'>{series.label}</span>
            </li>
          ))}
        </ul>
      )}
      <div
        role='group'
        tabIndex={0}
        aria-label={panel.title}
        onKeyDown={onKey}
        onFocus={() => setIndex((current) => current ?? dates.length - 1)}
        onBlur={() => setIndex(null)}
        className='relative mt-auto rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring'
      >
        <svg
          aria-hidden
          viewBox={`0 0 ${width} ${height}`}
          className='block h-auto w-full overflow-visible'
        >
          {panel.scale.ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={plot.left}
                x2={plot.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke='var(--border)'
                strokeWidth='1'
              />
              <text
                x={plot.left - 6}
                y={y(tick)}
                textAnchor='end'
                dominantBaseline='middle'
                fontSize='10'
                fill='var(--muted-foreground)'
                className='tabular-nums'
              >
                {formatValue(tick, unit, tag)}
              </text>
            </g>
          ))}
          {years.map((tick) => (
            <text
              key={tick.year}
              x={x(tick.date)}
              y={height - 6}
              textAnchor='middle'
              fontSize='10'
              fill='var(--muted-foreground)'
              className='tabular-nums'
            >
              {tick.year}
            </text>
          ))}
          {events.map((event) => (
            <g key={event.date}>
              <line
                x1={x(event.date)}
                x2={x(event.date)}
                y1={plot.top - 6}
                y2={plot.bottom}
                stroke='var(--muted-foreground)'
                strokeOpacity='.5'
                strokeWidth='1'
                strokeDasharray='2 3'
              />
              <text
                x={x(event.date) + 4}
                y={plot.top - 2}
                fontSize='9.5'
                fill='var(--muted-foreground)'
              >
                {event.label}
              </text>
            </g>
          ))}
          {date !== null && (
            <line
              x1={x(date)}
              x2={x(date)}
              y1={plot.top}
              y2={plot.bottom}
              stroke='var(--foreground)'
              strokeOpacity='.35'
              strokeWidth='1'
            />
          )}
          {panel.series.map((series) => (
            <g key={series.key}>
              <polyline
                points={series.points
                  .map((point) => `${x(point.date)},${y(point.value)}`)
                  .join(' ')}
                fill='none'
                stroke={toneColor[series.tone ?? 'blue']}
                strokeWidth='2'
                strokeLinejoin='round'
                strokeLinecap='round'
                strokeDasharray={series.dashed ? dash : undefined}
              />
              {series.points.map((point) => (
                <circle
                  key={point.date}
                  cx={x(point.date)}
                  cy={y(point.value)}
                  r={point.date === date ? 5 : 3.5}
                  fill={
                    series.dashed
                      ? 'var(--card)'
                      : toneColor[series.tone ?? 'blue']
                  }
                  stroke={
                    series.dashed
                      ? toneColor[series.tone ?? 'blue']
                      : 'var(--card)'
                  }
                  strokeWidth='2'
                />
              ))}
            </g>
          ))}
          {ends.map((point, s) => (
            <text
              key={panel.series[s]!.key}
              x={x(point.date) + 8}
              y={endYs[s]}
              dominantBaseline='middle'
              fontSize='11'
              fontWeight='600'
              fill='var(--foreground)'
              className='tabular-nums'
            >
              {formatValue(point.value, unit, tag)}
            </text>
          ))}
          <rect
            x={plot.left - 8}
            y={0}
            width={plot.right - plot.left + 16}
            height={height}
            fill='transparent'
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={() => setIndex(null)}
          />
        </svg>
      </div>
      {/* The readout follows the crosshair and rests on the latest survey,
          so it never covers the lines or leaves the panel. */}
      <div
        aria-live='polite'
        className='flex min-h-12 flex-wrap content-start items-baseline gap-x-3 gap-y-0.5 text-xs'
      >
        <span className='text-muted-foreground'>
          {monthYear(shown, tag)}
          {shownNote && ` · ${shownNote}`}
        </span>
        {panel.series.map((series) => {
          const point = series.points.find((entry) => entry.date === shown)
          if (!point) return null
          return (
            <span key={series.key} className='flex items-baseline gap-1.5'>
              <svg
                aria-hidden
                viewBox='0 0 12 6'
                className='h-1.5 w-3 shrink-0'
              >
                <line
                  x1='0'
                  x2='12'
                  y1='3'
                  y2='3'
                  stroke={toneColor[series.tone ?? 'blue']}
                  strokeWidth='2'
                  strokeDasharray={series.dashed ? '3 2' : undefined}
                />
              </svg>
              <span>
                <strong className='font-semibold tabular-nums'>
                  {formatValue(point.value, unit, tag)}
                </strong>{' '}
                <span className='text-muted-foreground'>{series.label}</span>
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
