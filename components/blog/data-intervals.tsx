import { intervalsDataSchema } from '@/lib/blog/schema'
import {
  ChartFigure,
  englishChartText,
  fewerThan,
  formatDecimal,
  formatPercent,
  groupRows,
  Legend,
  seriesTone,
  Swatch,
  toneBackground,
  type ChartText
} from './chart-parts'

/**
 * A value per row and series with the interval around it, such as medians
 * with their 95% intervals, on a shared linear or log scale. The values are
 * text beside each track; ticks label the scale under each group.
 */
export function DataIntervals({
  data,
  text = englishChartText()
}: {
  data: unknown
  text?: ChartText
}) {
  const chart = intervalsDataSchema.parse(data)
  const { min, max, log, percent } = chart.scale
  const tones = chart.series.map(seriesTone)
  const position = (value: number) => {
    const clamped = Math.min(max, Math.max(min, value))
    const share = log
      ? Math.log(clamped / min) / Math.log(max / min)
      : (clamped - min) / (max - min)
    return `${share * 100}%`
  }
  const format = (value: number) =>
    percent ? formatPercent(value, text.tag) : formatDecimal(value, text.tag)
  const ticks = (
    <div
      aria-hidden
      className='relative mr-14 h-4 text-xs text-muted-foreground tabular-nums'
    >
      {chart.scale.ticks.map((tick, index) => (
        <span
          key={tick}
          className='absolute top-0'
          style={{
            left: position(tick),
            transform:
              index === 0
                ? undefined
                : index === chart.scale.ticks.length - 1
                  ? 'translateX(-100%)'
                  : 'translateX(-50%)'
          }}
        >
          {format(tick)}
        </span>
      ))}
    </div>
  )
  return (
    <ChartFigure
      slot='blog-data-intervals'
      title={chart.title}
      legend={
        <Legend
          items={[
            ...chart.series.map((series, index) => ({
              key: series.key,
              label: series.label,
              swatch: <Swatch tone={tones[index]} />
            })),
            {
              key: 'interval',
              label: chart.interval,
              swatch: (
                <span
                  aria-hidden
                  className='inline-block h-1.5 w-5 rounded-full bg-muted-foreground/40'
                />
              )
            }
          ]}
        />
      }
      source={chart.source}
      asOf={chart.asOf}
      text={text}
    >
      <div className='flex flex-col gap-6'>
        {groupRows(chart.rows).map(({ group, rows }, index) => (
          <div key={group ?? index} className='flex flex-col gap-3'>
            {group && (
              <p className='text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
                {group}
              </p>
            )}
            {rows.map((row) => (
              <div key={row.label} className='flex flex-col gap-1.5'>
                <span className='text-sm font-medium'>{row.label}</span>
                {chart.series.map((series, s) => {
                  const value = row.values[series.key]
                  if (!value) return null
                  return (
                    <div key={series.key} className='flex items-center gap-2'>
                      {chart.series.length > 1 && (
                        <span className='sr-only'>{series.label}: </span>
                      )}
                      {value.value === null ? (
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
                            className='relative h-4 min-w-0 flex-1 border-l border-border'
                          >
                            <div className='absolute inset-x-0 top-1/2 h-px bg-border' />
                            {value.low !== undefined &&
                              value.high !== undefined && (
                                <div
                                  className={`absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full opacity-35 ${toneBackground[tones[s]!]}`}
                                  style={{
                                    left: position(value.low),
                                    width: `calc(${position(value.high)} - ${position(value.low)})`
                                  }}
                                />
                              )}
                            <div
                              className={`absolute top-1/2 size-3 -translate-1/2 rounded-full ring-2 ring-card ${toneBackground[tones[s]!]}`}
                              style={{ left: position(value.value) }}
                            />
                          </div>
                          <span className='w-12 shrink-0 text-right text-sm font-semibold tabular-nums'>
                            {format(value.value)}
                          </span>
                          {value.low !== undefined &&
                            value.high !== undefined && (
                              <span className='sr-only'>
                                {` (${text.t('range', {
                                  interval: chart.interval,
                                  low: format(value.low),
                                  high: format(value.high)
                                })})`}
                              </span>
                            )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
            {ticks}
          </div>
        ))}
      </div>
    </ChartFigure>
  )
}
