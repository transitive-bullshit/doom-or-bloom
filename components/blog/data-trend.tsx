import { unionDates } from '@/lib/blog/chart-geometry'
import { postDate } from '@/lib/blog/format'
import { trendDataSchema } from '@/lib/blog/schema'
import {
  ChartFigure,
  englishChartText,
  formatPercent,
  type ChartText
} from './chart-parts'
import { TrendPanels } from './trend-panels'

/**
 * Measures over time from committed JSON, as small multiples on one date
 * axis: each panel one question with its own scale and one or two series,
 * labelled at the line ends. A crosshair reads every series at a survey; a
 * screen-reader table per panel lists them all.
 */
export function DataTrend({
  data,
  text = englishChartText()
}: {
  data: unknown
  text?: ChartText
}) {
  const chart = trendDataSchema.parse(data)
  return (
    <ChartFigure
      slot='blog-data-trend'
      title={chart.title}
      source={chart.source}
      asOf={chart.asOf}
      text={text}
    >
      <TrendPanels
        from={chart.from}
        to={chart.to}
        events={chart.events}
        panels={chart.panels}
        tag={text.tag}
        hint={chart.hint}
      />
      {/* A table ignores sr-only's 1px width, so its wrapper hides it. */}
      <div className='sr-only'>
        {chart.panels.map((panel) => (
          <table key={panel.key}>
            <caption>
              {panel.title}
              {panel.note && `. ${panel.note}`}
            </caption>
            <thead>
              <tr>
                <th scope='col'>{text.t('category')}</th>
                {panel.series.map((series) => (
                  <th key={series.key} scope='col'>
                    {series.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {unionDates(panel.series).map((date) => (
                <tr key={date}>
                  <th scope='row'>{postDate(date, text.tag)}</th>
                  {panel.series.map((series) => {
                    const point = series.points.find(
                      (entry) => entry.date === date
                    )
                    return (
                      <td key={series.key}>
                        {point &&
                          `${
                            panel.scale.unit === 'percent'
                              ? formatPercent(point.value, text.tag)
                              : Math.round(point.value)
                          }${point.note ? ` (${point.note})` : ''}`}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
    </ChartFigure>
  )
}
