'use client'

import Image from 'next/image'
import { type CSSProperties, useState } from 'react'
import type { MentionPart } from '@/lib/personas/mentions'
import { MentionText } from '@/components/mention-text'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PrismField } from '@/components/worldview/prism-field'
import { resultMapLayout } from '@/lib/sharing/map-layout'

export type PairPoint = {
  key?: string
  outlook: number
  transformation: number
  label?: string
  name?: string
  side?: 'left' | 'right'
  shift?: number
  avatar?: string
}

export type Pair = {
  key: string
  label: string
  points: [string, string]
  note: string
  /** The two full names, linked to their profiles. */
  names: MentionPart[][]
}

// The result map's geometry, as in DataMap. Marks on the field use the
// field's own ink and paper, which keep their colors in both themes.
const plot = { left: 76, top: 40, width: 528, height: 268 }
const px = (value: number) => plot.left + value * plot.width
const py = (value: number) => plot.top + (1 - value) * plot.height
const { width, height } = resultMapLayout
const radius = { pair: 7, other: 4.5 }
// A chosen point with a portrait shows it instead of its dot, so readers can
// recognize the pair; it scales with the map down to phone width.
const portrait = 'clamp(28px, 7.5cqw, 44px)'

/**
 * The interactive half of DataMap's pairs: a control picks two points, which
 * are joined, labelled and shown by their portraits (or enlarged dots) while
 * the rest fade, with a line about them below. Labels are HTML over the SVG, so they keep a readable size on
 * phones, where only the chosen pair is labelled.
 */
export function PairPlot({
  id,
  points,
  pairs,
  hint,
  poles,
  summary
}: {
  id: string
  points: PairPoint[]
  pairs: Pair[]
  hint: string
  poles: { high: string; low: string }
  summary: string
}) {
  const [selected, setSelected] = useState(pairs[0]!.key)
  const pair = pairs.find((entry) => entry.key === selected)!
  const chosen = new Set<string>(pair.points)
  const [first, second] = pair.points.map((key) =>
    points.find((point) => point.key === key)!
  )
  return (
    <div className='flex flex-col gap-4'>
      <ToggleGroup
        type='single'
        variant='outline'
        size='sm'
        spacing={1}
        value={selected}
        onValueChange={(value) => {
          // Pressing the chosen pair again keeps it chosen.
          if (value) setSelected(value)
        }}
        aria-label={hint}
        className='w-full flex-wrap justify-center gap-1.5'
      >
        {pairs.map((entry) => (
          <ToggleGroupItem
            key={entry.key}
            value={entry.key}
            className='rounded-full px-3 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background'
          >
            {entry.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className='relative' style={{ containerType: 'inline-size' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role='img'
          aria-label={summary}
          className='block w-full'
        >
          <PrismField id={`blog-pairs-${id}`} plot={plot} />
          <text
            className='prism-axis-label'
            x='340'
            y='16'
            dominantBaseline='middle'
            textAnchor='middle'
            fill='var(--map-muted)'
            fontSize='12'
          >
            {poles.high}
          </text>
          <text
            className='prism-axis-label'
            x='340'
            y='332'
            dominantBaseline='middle'
            textAnchor='middle'
            fill='var(--map-muted)'
            fontSize='12'
          >
            {poles.low}
          </text>
          {(['Doom', 'Bloom'] as const).map((pole, index) => (
            <text
              key={pole}
              className='prism-pole'
              x={index ? 644 : 36}
              y={py(0.5)}
              dominantBaseline='middle'
              textAnchor='middle'
              fill='var(--map-text)'
              fontSize='14'
            >
              {pole}
            </text>
          ))}
          {first && second && (
            <line
              x1={px(first.outlook)}
              y1={py(first.transformation)}
              x2={px(second.outlook)}
              y2={py(second.transformation)}
              stroke='var(--prism-range-ink)'
              strokeWidth='2'
              strokeDasharray='5 4'
              strokeLinecap='round'
              opacity='.75'
            />
          )}
          {points.map((point, index) => {
            const on = Boolean(point.key && chosen.has(point.key))
            return (
              <circle
                key={point.key ?? index}
                cx={px(point.outlook)}
                cy={py(point.transformation)}
                r={on ? radius.pair : radius.other}
                fill='var(--prism-range-ink)'
                fillOpacity={on ? 1 : 0.55}
                stroke='var(--prism-portrait-ring)'
                strokeWidth={on ? 2.5 : 1.5}
                className='motion-safe:transition-[r,fill-opacity] motion-safe:duration-200'
              >
                {point.name && <title>{point.name}</title>}
              </circle>
            )
          })}
        </svg>
        {points.map((point) =>
          point.avatar && point.key && chosen.has(point.key) ? (
            <Image
              key={`portrait-${point.key}`}
              src={point.avatar}
              alt=''
              aria-hidden
              width={88}
              height={88}
              sizes='44px'
              quality={90}
              style={{
                left: `${(px(point.outlook) / width) * 100}%`,
                top: `${(py(point.transformation) / height) * 100}%`,
                width: portrait,
                height: portrait
              }}
              className='pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--prism-portrait-ring)] object-cover shadow-md'
            />
          ) : null
        )}
        {points.map((point, index) => {
          if (!point.label) return null
          const on = Boolean(point.key && chosen.has(point.key))
          const gap =
            on && point.avatar
              ? `calc(${portrait} / 2 + 4px)`
              : `calc(${on ? radius.pair : radius.other} * 100cqw / ${width} + 4px)`
          const style: CSSProperties = {
            left: `${(px(point.outlook) / width) * 100}%`,
            top: `calc(${(py(point.transformation) / height) * 100}% + ${point.shift ?? 0}px)`,
            transform:
              point.side === 'left'
                ? `translate(calc(-100% - ${gap}), -50%)`
                : `translate(${gap}, -50%)`
          }
          return (
            <span
              key={point.key ?? index}
              aria-hidden
              style={style}
              className={`pointer-events-none absolute leading-none whitespace-nowrap text-[var(--prism-range-ink)] motion-safe:transition-opacity motion-safe:duration-200 ${
                on
                  ? 'rounded bg-[var(--prism-portrait-ring)]/85 px-1 py-0.5 text-[13px] font-semibold'
                  : 'hidden text-[11px] opacity-80 [text-shadow:0_0_3px_var(--prism-portrait-ring),0_0_3px_var(--prism-portrait-ring)] sm:block'
              }`}
            >
              {point.label}
            </span>
          )
        })}
      </div>
      <div
        aria-live='polite'
        className='flex min-h-20 flex-col gap-1 rounded-xl border-l-4 border-chart-ink bg-muted/60 p-4 text-sm'
      >
        <p className='font-semibold'>
          {pair.names.map((parts, index) => (
            <span key={index}>
              {index > 0 && ' · '}
              <MentionText parts={parts} />
            </span>
          ))}
        </p>
        <p className='text-body-foreground'>{pair.note}</p>
      </div>
      <p className='text-center text-xs text-muted-foreground'>{hint}</p>
    </div>
  )
}
