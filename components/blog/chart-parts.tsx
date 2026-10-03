import type { ReactNode } from 'react'
import type { Translator } from '@/i18n/translator'
import { englishTranslator } from '@/i18n/translators'
import { postDate } from '@/lib/blog/format'
import { minimumGroupSize } from '@/lib/blog/schema'

// Pieces every blog chart shares: the frame, legend, number formats and the
// text of the post's language (which may differ from the page's chrome).

export type ChartText = {
  /** BCP 47 tag of the post's language, for numbers and dates. */
  tag: string
  t: Translator<'BlogCharts'>
  /** The map's vertical poles, e.g. "Civilizational change". */
  high: string
  low: string
}

export function chartText(
  t: Translator<'BlogCharts'>,
  map: Translator<'Map'>,
  tag: string
): ChartText {
  return {
    tag,
    t,
    high: map('high', { axis: 'transformation' }),
    low: map('low', { axis: 'transformation' })
  }
}

/** English chart text, for posts rendered without a page's translations. */
export const englishChartText = () =>
  chartText(englishTranslator('BlogCharts'), englishTranslator('Map'), 'en')

export type Tone = 'blue' | 'coral'
export const toneBackground: Record<Tone, string> = {
  blue: 'bg-chart-blue',
  coral: 'bg-chart-coral'
}
const toneColor: Record<Tone, string> = {
  blue: 'var(--chart-blue)',
  coral: 'var(--chart-coral)'
}
/** Series take blue, then coral, unless they name a tone. */
export const seriesTone = (series: { tone?: Tone }, index: number): Tone =>
  series.tone ?? (index ? 'coral' : 'blue')

/** "48%"; under 1% keeps one decimal. */
export function formatPercent(value: number, tag: string) {
  return new Intl.NumberFormat(tag, {
    style: 'percent',
    maximumFractionDigits: value > 0 && value < 0.01 ? 1 : 0
  }).format(value)
}

export const formatDecimal = (value: number, tag: string) =>
  new Intl.NumberFormat(tag, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)

export const formatCount = (value: number, tag: string) =>
  new Intl.NumberFormat(tag).format(value)

export const fewerThan = (text: ChartText) =>
  text.t('fewerThan', { count: minimumGroupSize })

/** A series color, or a hatch for a group under the minimum (edged in its series color). */
export function Swatch({ tone, hatch }: { tone?: Tone; hatch?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-3 shrink-0 rounded-sm ${
        hatch
          ? `chart-hatch border ${tone ? '' : 'border-border'}`
          : toneBackground[tone!]
      }`}
      style={hatch && tone ? { borderColor: toneColor[tone] } : undefined}
    />
  )
}

export function Legend({
  items
}: {
  items: { key: string; label: string; swatch: ReactNode }[]
}) {
  return (
    <ul
      aria-hidden
      className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-body-foreground'
    >
      {items.map((item) => (
        <li key={item.key} className='flex items-center gap-2'>
          {item.swatch}
          {item.label}
        </li>
      ))}
    </ul>
  )
}

export function ChartFigure({
  slot,
  title,
  legend,
  children,
  source,
  asOf,
  text,
  note
}: {
  slot: string
  title: string
  legend?: ReactNode
  children: ReactNode
  source: string
  asOf: string
  text: ChartText
  /** A sentence before the source, e.g. the scale of the bars. */
  note?: string
}) {
  return (
    <figure
      data-slot={slot}
      className='flex flex-col gap-4 rounded-2xl border p-4 sm:p-6'
    >
      <figcaption className='font-semibold'>{title}</figcaption>
      {legend}
      {children}
      <p className='text-xs text-muted-foreground'>
        {note && `${note} `}
        {source} {text.t('asOf', { date: postDate(asOf, text.tag) })}
      </p>
    </figure>
  )
}

/** Consecutive rows that share a group, in order. */
export function groupRows<Row extends { group?: string }>(rows: Row[]) {
  const groups: { group?: string; rows: Row[] }[] = []
  for (const row of rows) {
    const last = groups.at(-1)
    if (last && last.group === row.group) last.rows.push(row)
    else groups.push({ group: row.group, rows: [row] })
  }
  return groups
}
