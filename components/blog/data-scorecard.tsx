import { scorecardDataSchema } from '@/lib/blog/schema'
import {
  ChartFigure,
  englishChartText,
  Legend,
  type ChartText
} from './chart-parts'
import { LevelMark, type ScorecardLevel } from './level-mark'
import { ScorecardGrid } from './scorecard-grid'

/**
 * Approaches rated against criteria from committed JSON: a matrix of Harvey
 * balls whose cells open a one-line reason, or one approach at a time on
 * phones. The highlighted row is drawn in coral.
 */
export function DataScorecard({
  data,
  text = englishChartText()
}: {
  data: unknown
  text?: ChartText
}) {
  const chart = scorecardDataSchema.parse(data)
  const levels = Object.fromEntries(
    chart.levels.map((entry) => [entry.key, entry.label])
  ) as Record<ScorecardLevel, string>
  return (
    <ChartFigure
      slot='blog-data-scorecard'
      title={chart.title}
      legend={
        <Legend
          items={chart.levels.map((entry) => ({
            key: entry.key,
            label: entry.label,
            swatch: <LevelMark level={entry.key} />
          }))}
        />
      }
      source={chart.source}
      asOf={chart.asOf}
      text={text}
    >
      <ScorecardGrid
        columns={chart.columns}
        rows={chart.rows}
        levels={levels}
        hint={chart.hint}
      />
    </ChartFigure>
  )
}
