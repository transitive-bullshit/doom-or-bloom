'use client'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent
} from 'react'
import Image, { getImageProps } from 'next/image'
import { useTranslations } from 'next-intl'
import { subjectArgs, type ResultSubject } from '@/lib/sharing/result-subject'
import { PrismField } from '@/components/worldview/prism-field'
import { MapActions } from './map-actions'
import { resultMapLayout } from '@/lib/sharing/map-layout'
import { fitFontSize, pillWidth, textWidth } from '@/lib/sharing/text-fit'
import { cn } from 'cn'
import type { Component } from '@/lib/assessment/schema'
import type { experimentalAxes } from '@/lib/assessment/worldview-experiment'
import { claimText } from '@/lib/assessment/display-text'
import { useAuthoredText } from './authored-text'

export function Map({
  horizontal: x,
  vertical: y,
  axis,
  history = [],
  layout = 'breakout',
  subject,
  guess,
  pick
}: {
  horizontal: Component
  vertical: Component
  axis: keyof typeof experimentalAxes
  history?: Array<{ x: number | null; y: number | null; label: string }>
  layout?: 'contained' | 'breakout'
  subject?: ResultSubject
  // The participant's own expected position, shown beside the result.
  guess?: { x: number; y: number } | null
  // Self-placement mode: the result stays hidden and a tap places the guess.
  pick?: (point: { x: number; y: number }) => void
}) {
  const svg = useRef<SVGSVGElement>(null)
  const [labelScale, setLabelScale] = useState(1)
  useEffect(() => {
    const element = svg.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0) {
        setLabelScale(Math.min(1.7, Math.max(1, 680 / entry.contentRect.width)))
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const root = useTranslations()
  const t = useTranslations('Map')
  const authored = useAuthoredText()
  const id = useId().replaceAll(':', '')
  const plot = { left: 76, top: 40, width: 528, height: 268 }
  const px = (value: number) => plot.left + value * plot.width
  const py = (value: number) => plot.top + (1 - value) * plot.height
  const point = !pick && x.value !== null && y.value !== null
  const place = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = svg.current?.getScreenCTM()
    if (!pick || !matrix) return
    const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse()
    )
    const clamp = (value: number) => Math.min(1, Math.max(0, value))
    pick({
      x: clamp((local.x - plot.left) / plot.width),
      y: clamp(1 - (local.y - plot.top) / plot.height)
    })
  }
  // Keep a native SVG image for clipping and PNG export, using Next's resized
  // 192px source for high-density screens and responsive SVG scaling: SVG
  // images cannot select from an HTML srcSet.
  const portrait =
    subject?.avatar && point
      ? getImageProps({
          src: subject.avatar,
          alt: '',
          width: 96,
          height: 96,
          quality: 90
        }).props.src
      : undefined
  const shared = subject?.kind === 'shared'
  const percent = (value: number) => Math.round(value * 100)
  const coordinate = (value: number | null) =>
    value === null ? t('unplaced') : t('outOf', { value: percent(value) })
  const description = pick
    ? guess
      ? t('pickDescription', {
          axis,
          x: percent(guess.x),
          y: percent(guess.y)
        })
      : t('pickEmpty')
    : t('description', {
        axis,
        x: coordinate(x.value),
        y: coordinate(y.value),
        xLow: percent(x.range[0]),
        xHigh: percent(x.range[1]),
        yLow: percent(y.range[0]),
        yHigh: percent(y.range[1])
      })
  // Translated labels vary in length: side labels shrink to fit the margin,
  // and the point and caption boxes grow to fit their text.
  const sideLabel = (text: string) => ({
    fontSize: fitFontSize(text, 12 * labelScale, 70)
  })
  const pointLabel =
    y.interpretation === 'unsettled'
      ? t('unsettled')
      : y.interpretation === 'tentative'
        ? t('estimate')
        : shared
          ? t('theirView')
          : subject
            ? t('simulatedView')
            : t('yourView')
  const pointWidth = pillWidth(pointLabel, 12, { minimum: 92 })
  const caption = { title: t('unplacedTitle'), note: t('unplacedNote') }
  const captionWidth = Math.min(
    plot.width,
    Math.max(
      292,
      Math.ceil(
        Math.max(
          textWidth(caption.title, 15, true),
          textWidth(caption.note, 12)
        )
      ) + 28
    )
  )
  return (
    <figure
      data-slot='worldview-map'
      className={cn(
        'worldview-map prism-theme flex flex-col gap-4 rounded-2xl border border-border p-4 shadow-sm sm:gap-5 sm:p-6',
        layout === 'breakout' &&
          'lg:relative lg:left-1/2 lg:w-[min(54rem,calc(100vw-4rem))] lg:-translate-x-1/2'
      )}
    >
      <div className='grid grid-cols-[2.25rem_minmax(0,1fr)_2.25rem] items-start gap-2'>
        <h2 className='col-start-2 text-center'>{t('question', { axis })}</h2>
        <div className='col-start-3 justify-self-end'>
          {!pick && <MapActions svg={svg} />}
        </div>
      </div>
      <svg
        ref={svg}
        data-slot='worldview-map-svg'
        viewBox={`0 0 ${resultMapLayout.width} ${resultMapLayout.height}`}
        role='img'
        aria-label={description}
        className={cn('block w-full', pick && 'cursor-crosshair touch-none')}
        style={{ '--map-label-scale': labelScale } as CSSProperties}
        onPointerDown={pick ? place : undefined}
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
          y='16'
          dominantBaseline='middle'
          textAnchor='middle'
          fill='var(--map-muted)'
          fontSize='12'
        >
          {t('high', { axis })}
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
          {t('low', { axis })}
        </text>
        <text
          className='prism-pole'
          x='36'
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
          x='644'
          y={py(0.5)}
          dominantBaseline='middle'
          textAnchor='middle'
          fill='var(--map-text)'
          fontSize='14'
        >
          Bloom
        </text>
        {(!subject || shared) && (
          <>
            <text
              className='prism-axis-label'
              x='36'
              y={py(0.5) + 18}
              dominantBaseline='middle'
              textAnchor='middle'
              fill='var(--map-muted)'
              fontSize='11'
              style={sideLabel(t('worried'))}
            >
              {t('worried')}
            </text>
            <text
              className='prism-axis-label'
              x='644'
              y={py(0.5) + 18}
              dominantBaseline='middle'
              textAnchor='middle'
              fill='var(--map-muted)'
              fontSize='11'
              style={sideLabel(t('hopeful'))}
            >
              {t('hopeful')}
            </text>
          </>
        )}
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
        {!pick && (
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
        )}
        {guess && (
          <g data-slot='worldview-map-guess'>
            <circle
              cx={px(guess.x)}
              cy={py(guess.y)}
              r='9'
              fill='var(--map-surface)'
              fillOpacity='.6'
              stroke='var(--map-text)'
              strokeWidth='2.5'
              strokeDasharray='3 3'
            />
            <text
              x={px(guess.x)}
              y={guess.y < 0.15 ? py(guess.y) - 16 : py(guess.y) + 22}
              textAnchor='middle'
              fill='var(--map-text)'
              fontSize='11'
              fontWeight='600'
            >
              {pick ? t('you') : t('yourGuess')}
            </text>
          </g>
        )}
        {point && (
          <g>
            {subject?.avatar ? (
              <g
                data-persona-marker={subject.name}
                role='img'
                aria-label={t('marker', {
                  name: subject.name,
                  claim: y.claim
                    ? claimText(root, y.claim, y.vector, authored)
                    : t('markerFallback')
                })}
              >
                <image
                  href={portrait}
                  data-export-src={subject.avatar}
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
                  transform={`translate(${Math.max(plot.left + pointWidth / 2, Math.min(plot.left + plot.width - pointWidth / 2, px(x.value!)))},${y.value! > 0.85 ? py(y.value!) + 36 : py(y.value!) - 29})`}
                >
                  <rect
                    x={-pointWidth / 2}
                    y='-14'
                    width={pointWidth}
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
                    {pointLabel}
                  </text>
                </g>
              </>
            )}
          </g>
        )}
        {!point && !pick && (
          <g className='map-axis-caption'>
            <rect
              x={340 - captionWidth / 2}
              y='148.5'
              width={captionWidth}
              height='51'
              rx='10'
              fill='var(--map-surface)'
            />
            <text
              x='340'
              y='169.5'
              textAnchor='middle'
              fill='var(--map-text)'
              fontSize={fitFontSize(caption.title, 15, captionWidth - 28, true)}
              fontWeight='600'
            >
              {caption.title}
            </text>
            <text
              x='340'
              y='187.5'
              textAnchor='middle'
              fill='var(--map-muted)'
              fontSize={fitFontSize(caption.note, 12, captionWidth - 28)}
            >
              {caption.note}
            </text>
          </g>
        )}
      </svg>
      {!point && !pick && (
        <p className='map-mobile-captions map-muted text-sm'>
          {t('unplacedCaption')}
        </p>
      )}
      <figcaption className='map-muted text-xs leading-5 sm:text-sm'>
        <div className='flex min-w-0 flex-col gap-2'>
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
                    sizes='16px'
                    quality={90}
                    className='size-4 rounded-full border border-white object-cover'
                  />
                ) : (
                  <span className='map-point size-2 rounded-full' />
                )}
              </span>
              {point
                ? y.interpretation === 'unsettled'
                  ? t('centerUnresolved')
                  : shared
                    ? t('sharedPosition')
                    : subject
                      ? t('simulatedPosition')
                      : t('estimatedPosition')
                : t('notDetermined')}
            </span>
            <span className='inline-flex items-center gap-2'>
              <span
                className='map-range h-4 w-5 shrink-0 rounded-sm border border-dashed'
                aria-hidden='true'
              />
              {t('range')}
            </span>
          </div>
          <p>
            {t('axes', { ...subjectArgs(subject), axis })}
            {history.length > 0 ? ` ${t('history')}` : ''}
          </p>
        </div>
      </figcaption>
      <p className='sr-only'>{description}</p>
    </figure>
  )
}
