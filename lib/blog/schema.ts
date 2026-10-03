import { z } from 'zod'

// Blog post frontmatter and the aggregate data files charts read. Pure, so
// pages, the content validator and unit tests share it. See docs/BLOG.md.

/** gray-matter reads an unquoted `2026-10-01` as a Date; keep the day. */
const day = z.preprocess(
  (value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value),
  z.iso.date()
)
// Headlines and labels never end with a period (docs/PRODUCT.md copy rules).
const headline = z
  .string()
  .min(1)
  .max(110)
  .refine((text) => !/\.\s*$/u.test(text), 'Headlines end without a period')

export const postFrontmatterSchema = z.strictObject({
  title: headline,
  /** One or two sentences for search results, social cards and the index. */
  description: z.string().min(50).max(200),
  date: day,
  updated: day.optional()
})
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>

export const postSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u

const wordsPerMinute = 230

/**
 * Words a reader reads: prose, without frontmatter, code, JSX or URLs. With a
 * language tag, words are segmented as that language writes them (Chinese,
 * Japanese and Thai separate words without spaces).
 */
export function countWords(body: string, tag?: string) {
  const text = body
    .replace(/^---[\s\S]*?\n---/u, ' ')
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/^(?:import|export)\s.*$/gmu, ' ')
    .replace(/<[^>]*>/gu, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, '$1')
    .replace(/[#>*_`|~-]/gu, ' ')
  if (tag)
    return [
      ...new Intl.Segmenter(tag, { granularity: 'word' }).segment(text)
    ].filter((segment) => segment.isWordLike).length
  return text.match(/[\p{L}\p{N}][\p{L}\p{N}'’().%]*/gu)?.length ?? 0
}

/** Whole minutes, at least one. */
export const readingMinutes = (words: number) =>
  Math.max(1, Math.round(words / wordsPerMinute))

/** Markdown headings that break the no-trailing-period rule. */
export function periodHeadings(body: string) {
  return body
    .split('\n')
    .filter((line) => /^#{1,6}\s/u.test(line) && /\.\s*$/u.test(line))
}

// Charts read committed aggregate JSON from content/blog/data/. Each file names
// where its numbers come from (docs/BLOG.md#provenance). Participant numbers
// are aggregates over groups of at least `minimumGroupSize` people; a smaller
// group is still shown, as "fewer than 10", without a number.
const provenances = [
  'public-statements',
  'simulated-users',
  'participants',
  'site-traffic'
] as const
const provenance = z.enum(provenances)
export type Provenance = z.infer<typeof provenance>
export const minimumGroupSize = 10
const probability = z.number().min(0).max(1)
const people = z.int().nonnegative()
const dataBase = {
  title: headline,
  /** Where the numbers come from, shown under the chart. */
  source: z.string().min(1),
  asOf: day,
  /** One provenance, or every provenance a chart mixes (series name theirs). */
  provenance: z.union([provenance, z.array(provenance).min(2)])
}
const provenanceList = (value: Provenance | Provenance[]) =>
  Array.isArray(value) ? value : [value]

/** A legend entry. Charts color series in order: blue, then coral. */
const seriesSchema = z.strictObject({
  key: z.string().min(1),
  label: z.string().min(1),
  tone: z.enum(['blue', 'coral']).optional(),
  /** Required when the file lists several provenances. */
  provenance: provenance.optional()
})
const seriesList = z.array(seriesSchema).min(1).max(2)

/**
 * Checks the minimum group size on participant numbers: every shown value
 * names its group size, at least 10, and a smaller group shows no number.
 */
function groupProblems(
  value: { shown: boolean; people?: number },
  where: string
) {
  if (!value.shown)
    return value.people === undefined
      ? []
      : [`${where}: a group under the minimum shows no count`]
  if (value.people === undefined)
    return [`${where}: participant numbers need their group size`]
  return value.people < minimumGroupSize
    ? [`${where}: ${value.people} people is under ${minimumGroupSize}`]
    : []
}

function seriesProvenance(
  chart: { provenance: Provenance | Provenance[] },
  series: z.infer<typeof seriesSchema>
) {
  const listed = provenanceList(chart.provenance)
  return series.provenance ?? (listed.length === 1 ? listed[0] : undefined)
}

function checkSeries<Value>(
  chart: {
    provenance: Provenance | Provenance[]
    series: z.infer<typeof seriesSchema>[]
    rows: { label: string; values: Record<string, Value> }[]
  },
  ctx: z.RefinementCtx,
  group: (value: Value) => { shown: boolean; people?: number }
) {
  const listed = provenanceList(chart.provenance)
  const keys = new Set(chart.series.map((series) => series.key))
  for (const series of chart.series) {
    const source = seriesProvenance(chart, series)
    if (!source || !listed.includes(source))
      ctx.addIssue({
        code: 'custom',
        message: `Series ${series.key} needs a provenance the file lists`
      })
  }
  for (const row of chart.rows)
    for (const [key, value] of Object.entries(row.values)) {
      if (!keys.has(key)) {
        ctx.addIssue({
          code: 'custom',
          message: `${row.label}: unknown series ${key}`
        })
        continue
      }
      const series = chart.series.find((entry) => entry.key === key)!
      if (seriesProvenance(chart, series) !== 'participants') continue
      for (const message of groupProblems(
        group(value),
        `${row.label} (${series.label})`
      ))
        ctx.addIssue({ code: 'custom', message })
    }
}

export const rangeDataSchema = z.strictObject({
  ...dataBase,
  kind: z.literal('ranges'),
  rows: z
    .array(
      z.strictObject({
        label: z.string().min(1),
        /** As written, e.g. "10–20%". */
        token: z.string().min(1),
        low: probability,
        high: probability,
        note: z.string().optional(),
        href: z.url().optional()
      })
    )
    .min(1)
    .refine(
      (rows) => rows.every((row) => row.low <= row.high),
      'Each row needs low <= high'
    )
})

const span = z
  .tuple([probability, probability])
  .refine(([low, high]) => low < high, 'A cell spans low to high')

export const mapDataSchema = z
  .strictObject({
    ...dataBase,
    kind: z.literal('map'),
    /**
     * Aggregate cells shaded by the share of people in each, such as a 5 × 5
     * grid of participants. A null share is a group under the minimum.
     */
    cells: z
      .array(
        z.strictObject({
          outlook: span,
          transformation: span,
          share: probability.nullable(),
          /** People in the cell. */
          count: people.optional()
        })
      )
      .optional(),
    /** Legend text for the cells, e.g. "Share of participants". */
    cellsLabel: z.string().optional(),
    points: z
      .array(
        z.strictObject({
          /** Doom (0) to Bloom (1). */
          outlook: probability,
          /** Incremental (0) to civilizational (1) change. */
          transformation: probability,
          /** Drawn beside the point. */
          label: z.string().optional(),
          /** Named in the point's tooltip and the screen-reader table. */
          name: z.string().optional(),
          /** Relative size, e.g. a count in an aggregate cell. */
          weight: z.number().positive().optional()
        })
      )
      .default([]),
    /** Legend text for the points, e.g. "Simulated thought leaders". */
    pointsLabel: z.string().optional()
  })
  .superRefine((chart, ctx) => {
    if (!chart.points.length && !chart.cells?.length)
      ctx.addIssue({ code: 'custom', message: 'A map needs points or cells' })
    if (!chart.cells) return
    if (!provenanceList(chart.provenance).includes('participants'))
      ctx.addIssue({
        code: 'custom',
        message: 'Cells are participant aggregates'
      })
    chart.cells.forEach((cell, index) => {
      for (const message of groupProblems(
        { shown: cell.share !== null, people: cell.count },
        `cell ${index + 1}`
      ))
        ctx.addIssue({ code: 'custom', message })
    })
  })

const share = z.strictObject({
  /** Null: fewer than 10 people, shown as such without a number. */
  share: probability.nullable(),
  /** People (or visitors) in the bar. Participant shares must give it. */
  count: people.optional(),
  /** 95% interval for the share. */
  ci: z.tuple([probability, probability]).optional()
})

/** Horizontal bars of shares, grouped by series or stacked to 100%. */
export const barsDataSchema = z
  .strictObject({
    ...dataBase,
    kind: z.literal('bars'),
    series: seriesList,
    /** Each row's shares add up to 1 and draw as one bar. */
    stacked: z.boolean().optional(),
    rows: z
      .array(
        z.strictObject({
          label: z.string().min(1),
          /** Consecutive rows with the same group share a heading. */
          group: z.string().optional(),
          /** A short note after the row's bars, e.g. a test's p-value. */
          note: z.string().optional(),
          values: z.record(z.string(), share)
        })
      )
      .min(1)
  })
  .superRefine((chart, ctx) =>
    checkSeries(chart, ctx, (value: z.infer<typeof share>) => ({
      shown: value.share !== null,
      people: value.count
    }))
  )

const point = z.strictObject({
  /** Null: fewer than 10 people, shown as such without a number. */
  value: z.number().nullable(),
  /** The interval around the value, e.g. a 95% interval or middle half. */
  low: z.number().optional(),
  high: z.number().optional(),
  /** People behind the value. Participant values must give it. */
  n: people.optional()
})

/** A value with an interval per row and series, on a shared scale. */
export const intervalsDataSchema = z
  .strictObject({
    ...dataBase,
    kind: z.literal('intervals'),
    scale: z.strictObject({
      min: z.number(),
      max: z.number(),
      /** Logarithmic, for probabilities that span orders of magnitude. */
      log: z.boolean().optional(),
      /** Values are probabilities, written as percentages. */
      percent: z.boolean().optional(),
      ticks: z.array(z.number()).min(2)
    }),
    /** What the line around each point shows, e.g. "95% interval". */
    interval: z.string().min(1),
    series: seriesList,
    rows: z
      .array(
        z.strictObject({
          label: z.string().min(1),
          group: z.string().optional(),
          values: z.record(z.string(), point)
        })
      )
      .min(1)
  })
  .superRefine((chart, ctx) => {
    const { min, max, log } = chart.scale
    if (min >= max || (log && min <= 0))
      ctx.addIssue({ code: 'custom', message: 'Scale needs 0 < min < max' })
    checkSeries(chart, ctx, (value: z.infer<typeof point>) => ({
      shown: value.value !== null,
      people: value.n
    }))
  })

export const blogDataSchema = z.discriminatedUnion('kind', [
  rangeDataSchema,
  mapDataSchema,
  barsDataSchema,
  intervalsDataSchema
])
export type BlogData = z.infer<typeof blogDataSchema>

/** Every provenance a data file draws on. */
export const dataProvenances = (data: Pick<BlogData, 'provenance'>) =>
  provenanceList(data.provenance)
