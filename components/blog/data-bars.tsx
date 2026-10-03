import { barsDataSchema, minimumGroupSize } from '@/lib/blog/schema'
import type { ProfileMentions } from '@/lib/personas/mentions'
import { MentionText } from '@/components/mention-text'
import {
  ChartFigure,
  englishChartText,
  fewerThan,
  formatCount,
  formatPercent,
  groupRows,
  Legend,
  seriesTone,
  Swatch,
  toneBackground,
  type ChartText
} from './chart-parts'

const niceMax = (value: number) => Math.min(1, Math.ceil(value * 10) / 10)

/**
 * Shares as horizontal bars from a committed JSON file: one bar per series in
 * each row, or one bar stacked to 100%. A group under the minimum size reads
 * "Fewer than 10" beside a hatched swatch instead of a bar. Values sit at the
 * bar ends as text, so the chart reads the same without its bars.
 */
export function DataBars({
  data,
  text = englishChartText(),
  mention = (label) => [{ text: label }]
}: {
  data: unknown
  text?: ChartText
  mention?: ProfileMentions
}) {
  const chart = barsDataSchema.parse(data)
  const tones = chart.series.map(seriesTone)
  const max = niceMax(
    Math.max(
      ...chart.rows.flatMap((row) =>
        Object.values(row.values).map((value) =>
          Math.max(value.share ?? 0, value.ci?.[1] ?? 0)
        )
      )
    ) || 1
  )
  const width = (share: number) =>
    `${(chart.stacked ? share : share / max) * 100}%`
  const suppressed = chart.rows.some((row) =>
    Object.values(row.values).some((value) => value.share === null)
  )
  const legend =
    chart.series.length > 1 || suppressed ? (
      <Legend
        items={[
          ...(chart.series.length > 1
            ? chart.series.map((series, index) => ({
                key: series.key,
                label: series.label,
                swatch: <Swatch tone={tones[index]} />
              }))
            : []),
          ...(suppressed
            ? [
                {
                  key: 'suppressed',
                  label: text.t('fewerThanPeople', { count: minimumGroupSize }),
                  swatch: <Swatch hatch />
                }
              ]
            : [])
        ]}
      />
    ) : undefined
  return (
    <ChartFigure
      slot='blog-data-bars'
      title={chart.title}
      legend={legend}
      source={chart.source}
      asOf={chart.asOf}
      text={text}
    >
      <div className='flex flex-col gap-5'>
        {groupRows(chart.rows).map(({ group, rows }, index) => (
          <div key={group ?? index} className='flex flex-col gap-3'>
            {group && (
              <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                {group}
              </p>
            )}
            {rows.map((row) => (
              <div key={row.label} className='flex flex-col gap-1.5'>
                <div className='flex items-baseline justify-between gap-3 text-sm'>
                  <span className='font-medium'>
                    <MentionText parts={mention(row.label)} />
                  </span>
                  {row.note && (
                    <span className='shrink-0 text-xs text-muted-foreground tabular-nums'>
                      {row.note}
                    </span>
                  )}
                </div>
                {chart.stacked ? (
                  <div className='flex h-6 gap-0.5 overflow-hidden rounded-sm'>
                    <span className='sr-only'>
                      {chart.series
                        .flatMap((series) => {
                          const value = row.values[series.key]
                          return value
                            ? [
                                `${series.label}: ${value.share === null ? fewerThan(text) : formatPercent(value.share, text.tag)}${value.count === undefined ? '' : ` (${formatCount(value.count, text.tag)})`}`
                              ]
                            : []
                        })
                        .join(', ')}
                    </span>
                    {chart.series.map((series, s) => {
                      const value = row.values[series.key]
                      if (!value?.share) return null
                      return (
                        <div
                          key={series.key}
                          aria-hidden
                          className={`flex items-center justify-center text-xs font-medium text-white tabular-nums ${toneBackground[tones[s]!]}`}
                          style={{ width: width(value.share) }}
                        >
                          {value.share >= 0.12 &&
                            formatPercent(value.share, text.tag)}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  chart.series.map((series, s) => {
                    const value = row.values[series.key]
                    if (!value) return null
                    return (
                      <div key={series.key} className='flex items-center gap-2'>
                        {chart.series.length > 1 && (
                          <span className='sr-only'>{series.label}: </span>
                        )}
                        {value.share === null ? (
                          <span className='flex items-center gap-2 text-xs text-muted-foreground italic'>
                            <Swatch
                              hatch
                              tone={
                                chart.series.length > 1 ? tones[s] : undefined
                              }
                            />
                            {fewerThan(text)}
                          </span>
                        ) : (
                          <>
                            <div
                              aria-hidden
                              className='relative h-3 min-w-0 flex-1'
                            >
                              <div
                                className={`absolute inset-y-0 left-0 rounded-r-sm ${toneBackground[tones[s]!]}`}
                                style={{
                                  width: `max(2px, ${width(value.share)})`
                                }}
                              />
                              {value.ci && (
                                <div
                                  className='absolute top-1/2 h-2 -translate-y-1/2 border-x border-foreground/70'
                                  style={{
                                    left: width(value.ci[0]),
                                    width: `calc(${width(value.ci[1])} - ${width(value.ci[0])})`
                                  }}
                                >
                                  <div className='absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-foreground/70' />
                                </div>
                              )}
                            </div>
                            <span className='w-12 shrink-0 text-right text-sm font-semibold tabular-nums'>
                              {formatPercent(value.share, text.tag)}
                            </span>
                            {value.ci && (
                              <span className='sr-only'>
                                {` (${text.t('interval', {
                                  low: formatPercent(value.ci[0], text.tag),
                                  high: formatPercent(value.ci[1], text.tag)
                                })})`}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </ChartFigure>
  )
}
