'use client'
import { useId, useRef } from 'react'
import { MapActions } from './map-actions'
import { cn } from 'cn'
import type { Component } from '@/lib/assessment/schema'
import { experimentalAxes } from '@/lib/assessment/worldview-experiment'

const coordinate = (value: number | null) =>
  value === null ? 'Unplaced' : `${Math.round(value * 100)} / 100`
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
  subject?: string
}) {
  const svg = useRef<SVGSVGElement>(null)
  const definition = experimentalAxes[axis]
  const id = useId().replaceAll(':', '')
  const plot = { left: 70, top: 52, width: 560, height: 268 }
  const px = (value: number) => plot.left + value * plot.width
  const py = (value: number) => plot.top + (1 - value) * plot.height
  const point = x.value !== null && y.value !== null
  const description = `Doom–Bloom: ${x.value === null ? 'unplaced' : Math.round(x.value * 100) + ' out of 100'}. ${definition.label}: ${y.value === null ? 'unplaced' : Math.round(y.value * 100) + ' out of 100'}. Interpretation ranges: ${x.range.map((v) => Math.round(v * 100)).join(' to ')} horizontally, ${y.range.map((v) => Math.round(v * 100)).join(' to ')} vertically. These are interpretation coordinates, not event probabilities.`
  return (
    <figure
      data-slot='worldview-map'
      className={cn(
        'worldview-map rounded-2xl p-5 shadow-xl sm:p-8',
        layout === 'breakout' &&
          'lg:relative lg:left-1/2 lg:w-[min(54rem,calc(100vw-4rem))] lg:-translate-x-1/2'
      )}
    >
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <p className='map-muted text-xs font-medium tracking-widest uppercase'>
            Experimental · outlook × {definition.label.toLowerCase()}
          </p>
          <h2 className='mt-2 text-2xl font-semibold tracking-tight'>
            {definition.question}
          </h2>
        </div>
        <div className='flex flex-wrap gap-3 text-xs'>
          <MapActions
            svg={svg}
            title={
              subject
                ? `${subject} · Simulated AI worldview`
                : 'My AI worldview'
            }
            legend={
              point
                ? y.interpretation === 'unsettled'
                  ? 'Point: center of unresolved range · Dashed area: interpretation range'
                  : 'Point: estimated position · Dashed area: interpretation range'
                : 'No placement yet · Dashed area: interpretation range'
            }
          />
          <div className='map-stat rounded-lg px-3 py-2'>
            <p className='map-muted'>Outlook</p>
            <p className='mt-1 font-semibold tabular-nums'>
              {coordinate(x.value)}
            </p>
          </div>
          <div className='map-stat rounded-lg px-3 py-2'>
            <p className='map-muted'>{definition.label}</p>
            <p className='mt-1 font-semibold tabular-nums'>
              {coordinate(y.value)}
            </p>
          </div>
        </div>
      </div>
      <p className='map-muted mt-5 text-sm'>
        Upward: {definition.high.toLowerCase()}. Downward:{' '}
        {definition.low.toLowerCase()}.
      </p>
      <svg
        ref={svg}
        viewBox='0 0 680 395'
        role='img'
        aria-label={description}
        className='mt-1 w-full'
      >
        <defs>
          <linearGradient id={`${id}-field`}>
            <stop stopColor='var(--map-doom)' stopOpacity='.3' />
            <stop
              offset='.5'
              stopColor='var(--map-surface)'
              stopOpacity='.05'
            />
            <stop offset='1' stopColor='var(--map-bloom)' stopOpacity='.32' />
          </linearGradient>
          <linearGradient id={`${id}-axis`}>
            <stop stopColor='var(--map-doom)' />
            <stop offset='1' stopColor='var(--map-bloom)' />
          </linearGradient>
          <pattern
            id={`${id}-missing`}
            width='9'
            height='9'
            patternUnits='userSpaceOnUse'
            patternTransform='rotate(35)'
          >
            <line y2='9' stroke='var(--map-text)' strokeOpacity='.08' />
          </pattern>
        </defs>
        <rect
          x={plot.left}
          y={plot.top}
          width={plot.width}
          height={plot.height}
          rx='12'
          fill={`url(#${id}-field)`}
        />
        {[0, 0.25, 0.5, 0.75, 1].map((value) => (
          <g
            key={value}
            stroke='var(--map-grid)'
            strokeDasharray={value === 0.5 ? '4 6' : undefined}
            strokeOpacity={value === 0.5 ? 1 : 0.55}
          >
            <line x1={px(value)} y1={plot.top} x2={px(value)} y2={py(0)} />
            <line x1={plot.left} y1={py(value)} x2={px(1)} y2={py(value)} />
          </g>
        ))}
        <text
          x='51'
          y={py(1) + 4}
          fill='var(--map-muted)'
          fontSize='12'
          className='map-axis-tick'
          textAnchor='end'
        >
          100
        </text>
        <text
          x='51'
          y={py(0.5) + 4}
          fill='var(--map-muted)'
          fontSize='12'
          className='map-axis-tick'
          textAnchor='end'
        >
          50
        </text>
        <text
          x='51'
          y={py(0) + 4}
          fill='var(--map-muted)'
          fontSize='12'
          className='map-axis-tick'
          textAnchor='end'
        >
          0
        </text>
        <text
          className='hidden sm:block'
          transform='translate(18 186) rotate(-90)'
          fill='var(--map-muted)'
          fontSize='12'
          textAnchor='middle'
        >
          {definition.label}
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
          stroke='var(--map-text)'
          strokeOpacity='.65'
          strokeWidth='1.5'
          strokeDasharray='6 5'
        />
        {point && (
          <g>
            <line
              x1={px(x.value!)}
              y1={py(0)}
              x2={px(x.value!)}
              y2={py(y.value!)}
              stroke='var(--map-text)'
              strokeOpacity='.5'
              strokeDasharray='3 5'
            />
            <line
              x1={px(0)}
              y1={py(y.value!)}
              x2={px(x.value!)}
              y2={py(y.value!)}
              stroke='var(--map-text)'
              strokeOpacity='.5'
              strokeDasharray='3 5'
            />
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
              transform={`translate(${Math.max(120, Math.min(580, px(x.value!)))},${Math.max(25, py(y.value!) - 29)})`}
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
                    : 'Your view'}
              </text>
            </g>
          </g>
        )}
        {!point && (
          <g className='hidden sm:block'>
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
        <rect
          x={plot.left}
          y='331'
          width={plot.width}
          height='3'
          rx='1.5'
          fill={`url(#${id}-axis)`}
        />
        <text
          x={plot.left}
          y='360'
          fill='var(--map-doom)'
          fontSize='24'
          className='map-pole'
          fontWeight='700'
        >
          Doom
        </text>
        <text
          className='hidden sm:block'
          x='350'
          y='357'
          textAnchor='middle'
          fill='var(--map-muted)'
          fontSize='12'
        >
          EXPRESSED OUTLOOK
        </text>
        <text
          x={px(1)}
          y='360'
          textAnchor='end'
          fill='var(--map-bloom)'
          fontSize='24'
          className='map-pole'
          fontWeight='700'
        >
          Bloom
        </text>
        <text
          className='hidden sm:block'
          x={plot.left}
          y='381'
          fill='var(--map-muted)'
          fontSize='12'
        >
          Concern about harmful futures
        </text>
        <text
          x={px(1)}
          y='381'
          className='hidden sm:block'
          textAnchor='end'
          fill='var(--map-muted)'
          fontSize='12'
        >
          Hope for beneficial futures
        </text>
      </svg>
      <div className='map-muted -mt-1 mb-4 flex justify-between gap-4 text-xs sm:hidden'>
        <span>Concern</span>
        <span>Hope</span>
      </div>
      {!point && (
        <p className='map-muted mb-3 text-sm'>
          Some dimensions are still unplaced. Open regions show what we don’t
          yet know.
        </p>
      )}
      {y.claim && <p className='map-muted mb-3 text-sm'>{y.claim}</p>}
      <figcaption className='map-muted flex flex-wrap gap-x-5 gap-y-2 text-xs'>
        <span className='flex items-center gap-2'>
          <span className='map-point size-2 rounded-full' />
          {point
            ? y.interpretation === 'unsettled'
              ? 'Point: center of your unresolved range'
              : 'Point: your estimated position'
            : 'Point withheld until both axes are assessable'}
        </span>
        <span className='flex items-center gap-2'>
          <span className='map-range h-3 w-5 rounded-sm border border-dashed' />
          Dashed area: interpretation range, including missing evidence
        </span>
      </figcaption>
      <p className='map-muted mt-4 text-xs leading-relaxed'>
        Across: your expressed Doom–Bloom outlook. Up:{' '}
        {definition.label.toLowerCase()}. Coordinates describe beliefs, not
        reasoning quality or event probabilities.
        {history.length > 0
          ? ' Small numbered dots show earlier answers; gaps remain unplaced.'
          : ''}
      </p>
      <p className='sr-only'>{description}</p>
    </figure>
  )
}
