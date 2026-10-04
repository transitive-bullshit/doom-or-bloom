import type { CSSProperties } from 'react'
import { logShare } from '@/lib/blog/chart-geometry'
import { estimatesDataSchema } from '@/lib/blog/schema'
import type { ProfileMentions } from '@/lib/personas/mentions'
import { MentionText } from '@/components/mention-text'
import {
  ChartFigure,
  englishChartText,
  formatPercent,
  groupRows,
  Legend,
  toneColor,
  type ChartText
} from './chart-parts'

type Chart = ReturnType<typeof estimatesDataSchema.parse>
type Mark = 'dot' | 'hollow' | 'range'

function Swatch({ color, mark }: { color: string; mark: Mark }) {
  if (mark === 'range')
    return (
      <span
        aria-hidden
        className='inline-block h-2 w-5 shrink-0 rounded-full'
        style={{ background: color }}
      />
    )
  return (
    <span
      aria-hidden
      className='inline-block size-3 shrink-0 rounded-full border-2'
      style={{
        borderColor: color,
        background: mark === 'hollow' ? 'var(--card)' : color
      }}
    />
  )
}

/**
 * Probability estimates side by side on one log scale from committed JSON,
 * each with the question as asked: medians as dots (hollow when inferred),
 * stated ranges as bars, and the number as published beside each row. A
 * value below the scale sits at its edge behind an arrow. Names with a
 * profile link to it.
 */
export function DataEstimates({
  data,
  text = englishChartText(),
  mention = (label) => [{ text: label }]
}: {
  data: unknown
  text?: ChartText
  mention?: ProfileMentions
}) {
  const chart = estimatesDataSchema.parse(data)
  const { min, max } = chart.scale
  const at = (value: number) => logShare(value, min, max)
  const tickShares = chart.scale.ticks.map((tick) => at(tick.value).share)
  // On wide screens each row is text, track, number; the number column fits
  // the longest figure so every track starts and ends at the same place.
  const longest = Math.max(...chart.rows.map((row) => row.figure.length))
  const columns = {
    '--estimate-template': `minmax(0, 1fr) minmax(0, 1.15fr) ${Math.max(3.5, longest * 0.5 + 0.5)}rem`
  } as CSSProperties
  return (
    <ChartFigure
      slot='blog-data-estimates'
      title={chart.title}
      legend={
        chart.legend.length ? (
          <Legend
            items={chart.legend.map((entry, index) => ({
              key: `${entry.tone}-${entry.mark}-${index}`,
              label: entry.label,
              swatch: <Swatch color={toneColor[entry.tone]} mark={entry.mark} />
            }))}
          />
        ) : undefined
      }
      source={chart.source}
      asOf={chart.asOf}
      text={text}
    >
      <div className='flex flex-col gap-7'>
        {groupRows(chart.rows).map(({ group, rows }, index) => (
          <div key={group ?? index} className='flex flex-col gap-4'>
            {group && (
              <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                {group}
              </p>
            )}
            {rows.map((row) => (
              <Row
                key={`${row.label}-${row.figure}`}
                row={row}
                at={at}
                ticks={tickShares}
                columns={columns}
                mention={mention}
              />
            ))}
            <div className='estimate-grid gap-x-4' style={columns}>
              <span className='hidden sm:block' />
              <div
                aria-hidden
                className='relative h-4 text-xs text-muted-foreground tabular-nums'
              >
                {chart.scale.ticks.map((tick, tickIndex) => (
                  <span
                    key={tick.value}
                    className='absolute top-0 whitespace-nowrap'
                    style={{
                      left: `${tickShares[tickIndex]! * 100}%`,
                      transform:
                        tickIndex === 0
                          ? undefined
                          : tickIndex === chart.scale.ticks.length - 1
                            ? 'translateX(-100%)'
                            : 'translateX(-50%)'
                    }}
                  >
                    {tick.label ?? formatPercent(tick.value, text.tag)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartFigure>
  )
}

function Row({
  row,
  at,
  ticks,
  columns,
  mention
}: {
  row: Chart['rows'][number]
  at: (value: number) => { share: number; below: boolean }
  ticks: number[]
  columns: CSSProperties
  mention: ProfileMentions
}) {
  const color = toneColor[row.tone]
  // A stated single number ("≈3%") is a range of one point: draw it as a dot.
  const single =
    row.value === undefined && row.low !== undefined && row.low === row.high
  const range =
    !single && row.low !== undefined && row.high !== undefined
      ? { low: at(row.low), high: at(row.high) }
      : null
  const value = row.value ?? (single ? row.low : undefined)
  const point = value === undefined ? null : at(value)
  const below = Boolean(point?.below || range?.high.below)
  return (
    <div className='estimate-grid gap-x-4 gap-y-1' style={columns}>
      <div className='flex flex-col gap-1'>
        <div className='flex items-baseline justify-between gap-3 text-sm'>
          <span className='font-medium'>
            <MentionText parts={mention(row.label)} />
          </span>
          <span className='shrink-0 font-semibold tabular-nums sm:hidden'>
            {row.figure}
          </span>
        </div>
        {row.wording && (
          <p className='text-xs leading-snug text-body-foreground'>
            “{row.wording}”
          </p>
        )}
        {row.detail && (
          <p className='text-xs leading-snug text-muted-foreground'>
            {row.detail}
          </p>
        )}
      </div>
      <div aria-hidden className='relative mt-1 h-4 sm:mt-0.5'>
        {ticks.map((share) => (
          <span
            key={share}
            className='absolute inset-y-0 w-px bg-border'
            style={{ left: `${share * 100}%` }}
          />
        ))}
        <span className='absolute inset-x-0 top-1/2 h-px bg-border' />
        {below ? (
          <svg
            viewBox='0 0 10 12'
            className='absolute top-1/2 left-0 h-3 w-2.5 -translate-y-1/2'
          >
            <path d='M9 1 L2 6 L9 11 Z' fill={color} />
          </svg>
        ) : (
          range && (
            <span
              className='absolute top-1/2 h-2 -translate-y-1/2 rounded-full'
              style={{
                background: color,
                left: `min(${range.low.share * 100}%, calc(100% - 0.75rem))`,
                width: `max(0.75rem, ${(range.high.share - range.low.share) * 100}%)`
              }}
            />
          )
        )}
        {point && !point.below && (
          <span
            className='absolute top-1/2 size-3 -translate-1/2 rounded-full border-2 ring-2 ring-card'
            style={{
              left: `${point.share * 100}%`,
              borderColor: color,
              background: row.inferred ? 'var(--card)' : color
            }}
          />
        )}
      </div>
      <span className='hidden text-right text-sm font-semibold tabular-nums sm:block'>
        {row.figure}
      </span>
    </div>
  )
}
