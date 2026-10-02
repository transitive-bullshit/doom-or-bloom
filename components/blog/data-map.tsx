import { useId } from 'react'
import { PrismField } from '@/components/worldview/prism-field'
import { postDate } from '@/lib/blog/format'
import { mapDataSchema } from '@/lib/blog/schema'
import { resultMapLayout } from '@/lib/sharing/map-layout'

// The result map's geometry and Prism field, with aggregate points instead of
// one subject. Labels are English, like the posts.
const plot = { left: 76, top: 40, width: 528, height: 268 }
const px = (value: number) => plot.left + value * plot.width
const py = (value: number) => plot.top + (1 - value) * plot.height
const percent = (value: number) => Math.round(value * 100)

/** Points on the Doom–Bloom × transformation map from committed JSON. */
export function DataMap({ data }: { data: unknown }) {
  const chart = mapDataSchema.parse(data)
  const id = useId().replace(/[^a-zA-Z0-9-]/g, '')
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
        aria-label={`${chart.title}: ${chart.points.length} points. Across: Doom to Bloom. Up: scale of transformation.`}
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
          Civilizational change
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
          Incremental change
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
      <table className='sr-only'>
        <caption>{chart.title}</caption>
        <thead>
          <tr>
            <th scope='col'>Point</th>
            <th scope='col'>Doom–Bloom (0–100)</th>
            <th scope='col'>Scale of transformation (0–100)</th>
            <th scope='col'>Weight</th>
          </tr>
        </thead>
        <tbody>
          {chart.points.map((point, index) => (
            <tr key={index}>
              <th scope='row'>{point.label ?? index + 1}</th>
              <td>{percent(point.outlook)}</td>
              <td>{percent(point.transformation)}</td>
              <td>{point.weight ?? 1}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className='text-xs text-muted-foreground'>
        {chart.source} As of {postDate(chart.asOf, 'en')}
      </p>
    </figure>
  )
}
