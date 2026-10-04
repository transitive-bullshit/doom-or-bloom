import { landscapeDataSchema } from '@/lib/blog/schema'
import { ChartFigure, englishChartText, type ChartText } from './chart-parts'
import { LandscapePlot } from './landscape-plot'

const percent = (value: number) => Math.round(value * 100)

/**
 * Projects placed on two editorial axes from committed JSON, such as how
 * people answer against what they get back. Hover, tap or focus opens each
 * project's method, reach and source; a screen-reader table lists them all.
 */
export function DataLandscape({
  data,
  text = englishChartText()
}: {
  data: unknown
  text?: ChartText
}) {
  const chart = landscapeDataSchema.parse(data)
  return (
    <ChartFigure
      slot='blog-data-landscape'
      title={chart.title}
      source={chart.source}
      asOf={chart.asOf}
      text={text}
    >
      <LandscapePlot
        points={chart.points}
        x={chart.x}
        y={chart.y}
        hint={chart.hint}
      />
      {/* A table ignores sr-only's 1px width, so its wrapper hides it. */}
      <div className='sr-only'>
        <table>
          <caption>{chart.title}</caption>
          <thead>
            <tr>
              <th scope='col'>{text.t('point')}</th>
              <th scope='col'>{`${chart.x.title} (0 ${chart.x.start}, 100 ${chart.x.end})`}</th>
              <th scope='col'>{`${chart.y.title} (0 ${chart.y.start}, 100 ${chart.y.end})`}</th>
              <th scope='col'>{text.t('value')}</th>
            </tr>
          </thead>
          <tbody>
            {chart.points.map((point) => (
              <tr key={point.key}>
                <th scope='row'>
                  <a href={point.href}>{point.label}</a>
                </th>
                <td>{percent(point.x)}</td>
                <td>{percent(point.y)}</td>
                <td>{`${point.method} ${point.reach}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartFigure>
  )
}
