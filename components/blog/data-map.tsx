import { useId } from 'react'
import { PrismField } from '@/components/worldview/prism-field'
import { postDate } from '@/lib/blog/format'
import { mapDataSchema, minimumGroupSize } from '@/lib/blog/schema'
import { resultMapLayout } from '@/lib/sharing/map-layout'
import {
  ChartFigure,
  englishChartText,
  fewerThan,
  formatPercent,
  Legend,
  Swatch,
  type ChartText
} from './chart-parts'

// The result map's geometry and Prism field, with aggregate points instead of
// one subject.
const plot = { left: 76, top: 40, width: 528, height: 268 }
const px = (value: number) => plot.left + value * plot.width
const py = (value: number) => plot.top + (1 - value) * plot.height
const percent = (value: number) => Math.round(value * 100)

// A square grid for cells, so its labels stay legible at phone width.
const grid = { left: 34, top: 30, size: 336, view: 404 }
const gx = (value: number) => grid.left + value * grid.size
const gy = (value: number) => grid.top + (1 - value) * grid.size

type Chart = ReturnType<typeof mapDataSchema.parse>

/**
 * The Doom–Bloom × transformation map from committed JSON: shaded cells of
 * participant aggregates (a group under the minimum is hatched and labelled),
 * or sized points on the result map's Prism field.
 */
export function DataMap({
  data,
  text = englishChartText()
}: {
  data: unknown
  text?: ChartText
}) {
  const chart = mapDataSchema.parse(data)
  const id = useId().replace(/[^a-zA-Z0-9-]/g, '')
  return chart.cells ? (
    <CellMap chart={chart} id={id} text={text} />
  ) : (
    <PointMap chart={chart} id={id} text={text} />
  )
}

function CellMap({
  chart,
  id,
  text
}: {
  chart: Chart
  id: string
  text: ChartText
}) {
  const cells = chart.cells!
  const heaviest = Math.max(...cells.map((cell) => cell.share ?? 0))
  const strength = (share: number) => 12 + 88 * (share / heaviest)
  const span = ([low, high]: [number, number]) =>
    `${percent(low)}–${percent(high)}`
  return (
    <ChartFigure
      slot='blog-data-map'
      title={chart.title}
      legend={
        <Legend
          items={[
            {
              key: 'cells',
              label: chart.cellsLabel ?? text.t('share'),
              swatch: (
                <span
                  aria-hidden
                  className='inline-block h-3 w-8 rounded-sm'
                  style={{
                    background:
                      'linear-gradient(90deg, color-mix(in oklab, var(--chart-blue) 12%, var(--card)), var(--chart-blue))'
                  }}
                />
              )
            },
            {
              key: 'suppressed',
              label: text.t('fewerThanPeople', { count: minimumGroupSize }),
              swatch: <Swatch hatch />
            },
            ...(chart.points.length && chart.pointsLabel
              ? [
                  {
                    key: 'points',
                    label: chart.pointsLabel,
                    swatch: <Swatch tone='coral' />
                  }
                ]
              : [])
          ]}
        />
      }
      source={chart.source}
      asOf={chart.asOf}
      text={text}
    >
      <svg
        viewBox={`0 0 ${grid.view} ${grid.view}`}
        role='img'
        aria-label={text.t('mapSummary', { title: chart.title })}
        className='mx-auto block w-full max-w-xl'
      >
        <defs>
          <pattern
            id={`${id}-hatch`}
            width='6'
            height='6'
            patternUnits='userSpaceOnUse'
            patternTransform='rotate(45)'
          >
            <rect width='6' height='6' fill='var(--card)' />
            <line
              x1='0'
              y1='0'
              x2='0'
              y2='6'
              stroke='var(--muted-foreground)'
              strokeOpacity='.45'
              strokeWidth='1.2'
            />
          </pattern>
        </defs>
        <text
          x={grid.left + grid.size / 2}
          y='16'
          textAnchor='middle'
          dominantBaseline='middle'
          fontSize='14'
          fill='var(--muted-foreground)'
        >
          {text.high}
        </text>
        <text
          x={grid.left + grid.size / 2}
          y={grid.top + grid.size + 16}
          textAnchor='middle'
          dominantBaseline='middle'
          fontSize='14'
          fill='var(--muted-foreground)'
        >
          {text.low}
        </text>
        {(['Doom', 'Bloom'] as const).map((pole, index) => (
          <text
            key={pole}
            x={index ? grid.left + grid.size + 18 : 16}
            y={grid.top + grid.size / 2}
            textAnchor='middle'
            dominantBaseline='middle'
            fontSize='15'
            fontWeight='600'
            fill='var(--foreground)'
            transform={`rotate(${index ? 90 : -90} ${index ? grid.left + grid.size + 18 : 16} ${grid.top + grid.size / 2})`}
          >
            {pole}
          </text>
        ))}
        {cells.map((cell, index) => {
          const x = gx(cell.outlook[0])
          const y = gy(cell.transformation[1])
          const width = gx(cell.outlook[1]) - x
          const height = gy(cell.transformation[0]) - y
          const fill =
            cell.share === null
              ? `url(#${id}-hatch)`
              : `color-mix(in oklab, var(--chart-blue) ${strength(cell.share)}%, var(--card))`
          const dark = cell.share !== null && strength(cell.share) > 55
          return (
            <g key={index}>
              <rect
                x={x + 1}
                y={y + 1}
                width={width - 2}
                height={height - 2}
                rx='4'
                fill={fill}
                stroke={cell.share === null ? 'var(--border)' : 'none'}
              />
              <text
                x={x + width / 2}
                y={y + height / 2}
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize={cell.share === null ? 14 : 17}
                fontWeight={cell.share === null ? 500 : 600}
                fill={
                  cell.share === null
                    ? 'var(--muted-foreground)'
                    : dark
                      ? 'white'
                      : 'var(--foreground)'
                }
                className='tabular-nums'
              >
                {cell.share === null
                  ? `<${minimumGroupSize}`
                  : formatPercent(cell.share, text.tag)}
              </text>
            </g>
          )
        })}
        {chart.points.map((point, index) => (
          <circle
            key={index}
            cx={gx(point.outlook)}
            cy={gy(point.transformation)}
            r='4'
            fill='var(--chart-coral)'
            stroke='var(--card)'
            strokeWidth='2'
          >
            {point.name && <title>{point.name}</title>}
          </circle>
        ))}
      </svg>
      {/* A table ignores sr-only's 1px width, so its wrapper hides it. */}
      <div className='sr-only'>
        <table>
          <caption>{chart.title}</caption>
          <thead>
            <tr>
              <th scope='col'>{text.t('outlook')}</th>
              <th scope='col'>{text.t('scale')}</th>
              <th scope='col'>{chart.cellsLabel ?? text.t('share')}</th>
            </tr>
          </thead>
          <tbody>
            {cells.map((cell, index) => (
              <tr key={index}>
                <td>{span(cell.outlook)}</td>
                <td>{span(cell.transformation)}</td>
                <td>
                  {cell.share === null
                    ? fewerThan(text)
                    : formatPercent(cell.share, text.tag)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ChartFigure>
  )
}

function PointMap({
  chart,
  id,
  text
}: {
  chart: Chart
  id: string
  text: ChartText
}) {
  const heaviest = Math.max(...chart.points.map((point) => point.weight ?? 1))
  const radius = (weight = 1) => 4 + 10 * Math.sqrt(weight / heaviest)
  return (
    <figure
      data-slot='blog-data-map'
      className='worldview-map prism-theme flex flex-col gap-4 rounded-2xl border border-border p-4 shadow-sm sm:p-6'
    >
      <figcaption className='text-center font-semibold'>
        {chart.title}
      </figcaption>
      <svg
        viewBox={`0 0 ${resultMapLayout.width} ${resultMapLayout.height}`}
        role='img'
        aria-label={text.t('mapSummary', { title: chart.title })}
        className='block w-full'
      >
        <PrismField id={`blog-map-${id}`} plot={plot} />
        <text
          className='prism-axis-label'
          x='340'
          y='16'
          dominantBaseline='middle'
          textAnchor='middle'
          fill='var(--map-muted)'
          fontSize='12'
        >
          {text.high}
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
          {text.low}
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
        {chart.points.map((point, index) => (
          <g key={index}>
            <circle
              cx={px(point.outlook)}
              cy={py(point.transformation)}
              r={radius(point.weight)}
              fill='var(--map-text)'
              fillOpacity='.5'
              stroke='var(--map-surface)'
              strokeWidth='1.5'
            />
            {point.label && (
              <text
                x={px(point.outlook) + radius(point.weight) + 4}
                y={py(point.transformation)}
                dominantBaseline='middle'
                fontSize='11'
                fill='var(--map-text)'
              >
                {point.label}
              </text>
            )}
          </g>
        ))}
      </svg>
      {/* A table ignores sr-only's 1px width, so its wrapper hides it. */}
      <div className='sr-only'>
        <table>
          <caption>{chart.title}</caption>
          <thead>
            <tr>
              <th scope='col'>{text.t('point')}</th>
              <th scope='col'>{text.t('outlook')}</th>
              <th scope='col'>{text.t('scale')}</th>
              <th scope='col'>{text.t('weight')}</th>
            </tr>
          </thead>
          <tbody>
            {chart.points.map((point, index) => (
              <tr key={index}>
                <th scope='row'>{point.label ?? point.name ?? index + 1}</th>
                <td>{percent(point.outlook)}</td>
                <td>{percent(point.transformation)}</td>
                <td>{point.weight ?? 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className='text-xs text-muted-foreground'>
        {chart.source}{' '}
        {text.t('asOf', { date: postDate(chart.asOf, text.tag) })}
      </p>
    </figure>
  )
}
