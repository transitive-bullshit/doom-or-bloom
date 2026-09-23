'use client'
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import Image from 'next/image'
import { resultFraming, type ResultSubject } from '@/lib/sharing/result-subject'
import { PrismField } from '@/components/worldview/prism-field'
import { MapActions } from './map-actions'
import { cn } from 'cn'
import type { Component } from '@/lib/assessment/schema'
import { experimentalAxes } from '@/lib/assessment/worldview-experiment'

export function Map({
  horizontal: x,
  vertical: y,
  axis,
  history = [],
  layout = 'breakout',
  subject
}: {
  horizontal: Component
  vertical: Component
  axis: keyof typeof experimentalAxes
  history?: Array<{ x: number | null; y: number | null; label: string }>
  layout?: 'contained' | 'breakout'
  subject?: ResultSubject
}) {
  const svg = useRef<SVGSVGElement>(null)
  const [labelScale, setLabelScale] = useState(1)
  useEffect(() => {
    const element = svg.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0) {
        setLabelScale(Math.min(2.2, Math.max(1, 680 / entry.contentRect.width)))
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const definition = experimentalAxes[axis]
  const framing = resultFraming(subject)
  const id = useId().replaceAll(':', '')
  const plot = { left: 90, top: 52, width: 500, height: 268 }
  const px = (value: number) => plot.left + value * plot.width
  const py = (value: number) => plot.top + (1 - value) * plot.height
  const point = x.value !== null && y.value !== null
  const description = `Doom–Bloom: ${x.value === null ? 'unplaced' : Math.round(x.value * 100) + ' out of 100'}. ${definition.label}: ${y.value === null ? 'unplaced' : Math.round(y.value * 100) + ' out of 100'}. Interpretation ranges: ${x.range.map((v) => Math.round(v * 100)).join(' to ')} horizontally, ${y.range.map((v) => Math.round(v * 100)).join(' to ')} vertically. These are interpretation coordinates, not event probabilities.`
  return (
    <figure
      data-slot='worldview-map'
      className={cn(
        'worldview-map prism-theme rounded-2xl border border-border p-5 shadow-sm sm:p-8',
        layout === 'breakout' &&
          'lg:relative lg:left-1/2 lg:w-[min(54rem,calc(100vw-4rem))] lg:-translate-x-1/2'
      )}
    >
      <div className='flex items-start justify-between gap-4'>
        <h2 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
          {definition.question}
        </h2>
        <div className='shrink-0'>
          <MapActions svg={svg} />
        </div>
      </div>
      <svg
        ref={svg}
        viewBox='0 0 680 395'
        role='img'
        aria-label={description}
        className='mt-1 w-full'
        style={{ '--map-label-scale': labelScale } as CSSProperties}
      >
        <defs>
          {subject?.avatar && point && (
            <clipPath id={`${id}-portrait`}>
              <circle cx={px(x.value!)} cy={py(y.value!)} r='19.25' />
            </clipPath>
          )}
          <pattern
            id={`${id}-missing`}
            width='9'
            height='9'
            patternUnits='userSpaceOnUse'
            patternTransform='rotate(35)'
          >
            <line y2='9' stroke='var(--prism-range-ink)' strokeOpacity='.08' />
          </pattern>
        </defs>
        <PrismField id={id} plot={plot} radius={8 * labelScale} />
        <text
          className='prism-axis-label'
          x='340'
          y='31'
          textAnchor='middle'
          fill='var(--map-muted)'
          fontSize='12'
        >
          {definition.high}
        </text>
        <text
          className='prism-axis-label'
          x='340'
          y='352'
          textAnchor='middle'
          fill='var(--map-muted)'
          fontSize='12'
        >
          {definition.low}
        </text>
        <text
          className='prism-pole'
          x='46'
          y={py(0.5)}
          dominantBaseline='middle'
          textAnchor='middle'
          fill='var(--map-text)'
          fontSize='14'
        >
          Doom
        </text>
        <text
          className='prism-pole'
          x='634'
          y={py(0.5)}
          dominantBaseline='middle'
          textAnchor='middle'
          fill='var(--map-text)'
          fontSize='14'
        >
          Bloom
        </text>
        {history.map((entry, index) =>
          entry.x !== null && entry.y !== null ? (
            <g key={index}>
              <circle
                cx={px(entry.x)}
                cy={py(entry.y)}
                r='4'
                fill='var(--map-text)'
                opacity='.4'
              />
              <text
                x={px(entry.x) + 7}
                y={py(entry.y) - 7}
                fontSize='11'
                fill='var(--map-text)'
              >
                {entry.label}
              </text>
            </g>
          ) : null
        )}
        <rect
          x={px(x.range[0])}
          y={py(y.range[1])}
          width={Math.max(2, (x.range[1] - x.range[0]) * plot.width)}
          height={Math.max(2, (y.range[1] - y.range[0]) * plot.height)}
          rx='4'
          fill={`url(#${id}-missing)`}
          stroke='var(--prism-range-ink)'
          strokeOpacity='.65'
          strokeWidth='1.5'
          vectorEffect='non-scaling-stroke'
          strokeDasharray='6 5'
        />
        {point && (
          <g>
            {subject?.avatar ? (
              <g
                data-persona-marker={subject.name}
                role='img'
                aria-label={`${subject.name}: ${y.claim ?? 'Simulated worldview position'}`}
              >
                <image
                  href={subject.avatar}
                  x={px(x.value!) - 20}
                  y={py(y.value!) - 20}
                  width='40'
                  height='40'
                  preserveAspectRatio='xMidYMid slice'
                  clipPath={`url(#${id}-portrait)`}
                />
                <circle
                  cx={px(x.value!)}
                  cy={py(y.value!)}
                  r='19.25'
                  fill='none'
                  stroke='var(--prism-portrait-ring)'
                  strokeWidth='1.5'
                />
              </g>
            ) : (
              <>
                <circle
                  cx={px(x.value!)}
                  cy={py(y.value!)}
                  r='18'
                  fill='var(--map-text)'
                  fillOpacity='.12'
                />
                <circle
                  cx={px(x.value!)}
                  cy={py(y.value!)}
                  r='8'
                  fill='var(--map-text)'
                  stroke='var(--map-surface)'
                  strokeWidth='3'
                />
                <g
                  transform={`translate(${Math.max(120, Math.min(580, px(x.value!)))},${y.value! > 0.85 ? py(y.value!) + 36 : py(y.value!) - 29})`}
                >
                  <rect
                    x='-46'
                    y='-14'
                    width='92'
                    height='25'
                    rx='12.5'
                    fill='var(--map-text)'
                  />
                  <text
                    textAnchor='middle'
                    y='3'
                    fill='var(--map-surface)'
                    fontSize='12'
                    fontWeight='600'
                  >
                    {y.interpretation === 'unsettled'
                      ? 'Unsettled'
                      : y.interpretation === 'tentative'
                        ? 'Estimate'
                        : subject
                          ? 'Simulated view'
                          : 'Your view'}
                  </text>
                </g>
              </>
            )}
          </g>
        )}
        {!point && (
          <g className='map-axis-caption'>
            <rect
              x='204'
              y='154'
              width='292'
              height='51'
              rx='10'
              fill='var(--map-surface)'
            />
            <text
              x='350'
              y='175'
              textAnchor='middle'
              fill='var(--map-text)'
              fontSize='15'
              fontWeight='600'
            >
              Some dimensions are still unplaced
            </text>
            <text
              x='350'
              y='193'
              textAnchor='middle'
              fill='var(--map-muted)'
              fontSize='12'
            >
              Open regions show what we don’t yet know.
            </text>
          </g>
        )}
      </svg>
      {!point && (
        <p className='map-muted mb-3 text-sm'>
          Some dimensions are still unplaced. Open regions show what we don’t
          yet know.
        </p>
      )}
      <figcaption className='map-muted mt-4 flex items-end justify-between gap-4 text-xs leading-5 sm:text-sm'>
        <div className='flex min-w-0 flex-col gap-3'>
          <div className='flex flex-wrap gap-x-6 gap-y-2'>
            <span className='inline-flex items-center gap-2'>
              <span
                className='inline-flex h-4 w-5 shrink-0 items-center justify-center'
                aria-hidden='true'
              >
                {subject?.avatar && point ? (
                  <Image
                    src={subject.avatar}
                    alt=''
                    width={16}
                    height={16}
                    unoptimized
                    className='size-4 rounded-full border border-white object-cover'
                  />
                ) : (
                  <span className='map-point size-2 rounded-full' />
                )}
              </span>
              {point
                ? y.interpretation === 'unsettled'
                  ? 'Center of unresolved range'
                  : subject
                    ? 'Simulated position'
                    : 'Your estimated position'
                : 'Position not yet determined'}
            </span>
            <span className='inline-flex items-center gap-2'>
              <span
                className='map-range h-4 w-5 shrink-0 rounded-sm border border-dashed'
                aria-hidden='true'
              />
              Interpretation range
            </span>
          </div>
          <p>
            Across: {framing.possessive} expressed Doom–Bloom outlook. Up:{' '}
            {definition.label.toLowerCase()}.
            {history.length > 0 ? ' Numbered dots show earlier answers.' : ''}
          </p>
        </div>
      </figcaption>
      <p className='sr-only'>{description}</p>
    </figure>
  )
}
