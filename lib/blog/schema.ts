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
  'site-traffic',
  'published-research'
] as const
const provenance = z.enum(provenances)
export type Provenance = z.infer<typeof provenance>
export const minimumGroupSize = 10
const probability = z.number().min(0).max(1)
const people = z.int().nonnegative()
/** A portrait from public/personas. */
const personaPortrait = z
  .string()
  .regex(/^\/personas\/[\w.-]+\.(?:jpg|png|webp)$/u)

const dataBase = {
  title: headline,
  /**
   * Where the numbers come from, shown under the chart before its date. Leave
   * it out when the post's own text and links already say so.
   */
  source: z.string().min(1).optional(),
  asOf: day,
  /** One provenance, or every provenance a chart mixes (series name theirs). */
  provenance: z.union([provenance, z.array(provenance).min(2)])
}
const provenanceList = (value: Provenance | Provenance[]) =>
  Array.isArray(value) ? value : [value]

/**
 * Series colors (`--chart-*` in app/globals.css). Unnamed series take blue,
 * then coral. A post keeps one color per kind of respondent across its charts.
 */
export const tones = ['blue', 'coral', 'teal'] as const
const tone = z.enum(tones)

/** A legend entry. Charts color series in order: blue, then coral. */
const seriesSchema = z.strictObject({
  key: z.string().min(1),
  label: z.string().min(1),
  tone: tone.optional(),
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

export const rangeDataSchema = z
  .strictObject({
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
  .superRefine((chart, ctx) => {
    // A range row names no group size, so it cannot pass the minimum check.
    if (provenanceList(chart.provenance).includes('participants'))
      ctx.addIssue({
        code: 'custom',
        message:
          'Ranges carry no group size; chart participant numbers as bars, intervals or map cells'
      })
  })

const span = z
  .tuple([probability, probability])
  .refine(([low, high]) => low < high, 'A cell spans low to high')

const key = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Keys are kebab-case')

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
          /** Names the point for `pairs`. */
          key: key.optional(),
          /** Doom (0) to Bloom (1). */
          outlook: probability,
          /** Incremental (0) to civilizational (1) change. */
          transformation: probability,
          /** Drawn beside the point. */
          label: z.string().optional(),
          /** Named in the point's tooltip and the screen-reader table. */
          name: z.string().optional(),
          /** Relative size, e.g. a count in an aggregate cell. */
          weight: z.number().positive().optional(),
          /** Draws the label left of the point instead of right. */
          side: z.enum(['left', 'right']).optional(),
          /** Nudges the label up (negative) or down, in pixels. */
          shift: z.number().min(-24).max(24).optional(),
          /** A portrait, shown on the point while its pair is chosen. */
          avatar: personaPortrait.optional()
        })
      )
      .default([]),
    /** Legend text for the points, e.g. "Simulated thought leaders". */
    pointsLabel: z.string().optional(),
    /**
     * Two points at a time to compare, such as rivals: a control picks one
     * pair, which is drawn joined and labelled while the others fade.
     */
    pairs: z
      .array(
        z.strictObject({
          key,
          /** The control's text, e.g. "Hinton vs LeCun". */
          label: z.string().min(1),
          points: z.tuple([key, key]),
          /** One line under the map about the pair, without a period. */
          note: z.string().min(1)
        })
      )
      .min(1)
      .optional(),
    /** How to use the pair control, e.g. "Pick a pair to highlight it". */
    hint: z.string().min(1).optional()
  })
  .superRefine((chart, ctx) => {
    if (!chart.points.length && !chart.cells?.length)
      ctx.addIssue({ code: 'custom', message: 'A map needs points or cells' })
    if (chart.pairs) {
      const keys = chart.points.flatMap((point) =>
        point.key ? [point.key] : []
      )
      checkKeys(
        keys.map((entry) => ({ key: entry })),
        'point',
        ctx
      )
      checkKeys(chart.pairs, 'pair', ctx)
      if (chart.cells)
        ctx.addIssue({
          code: 'custom',
          message: 'Pairs compare points, not cells'
        })
      if (!chart.hint)
        ctx.addIssue({ code: 'custom', message: 'Pairs need a hint' })
      for (const pair of chart.pairs) {
        const [first, second] = pair.points
        if (first === second)
          ctx.addIssue({
            code: 'custom',
            message: `${pair.label}: a pair needs two points`
          })
        for (const point of pair.points)
          if (!keys.includes(point))
            ctx.addIssue({
              code: 'custom',
              message: `${pair.label}: no point ${point}`
            })
      }
    }
    // Points are individual people, so they come from another provenance:
    // participants only ever show as cells over groups of 10 or more.
    if (
      chart.points.length &&
      provenanceList(chart.provenance).every(
        (source) => source === 'participants'
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Map points are individuals; participant numbers show as cells'
      })
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

const unit = z.number().min(0).max(1)

/** Keys a list repeats, so lookups by key stay unambiguous. */
function duplicateKeys(items: { key: string }[]) {
  const seen = new Set<string>()
  return items.flatMap(({ key }) => {
    if (seen.has(key)) return [key]
    seen.add(key)
    return []
  })
}

function checkKeys(
  items: { key: string }[],
  where: string,
  ctx: z.RefinementCtx
) {
  for (const repeated of duplicateKeys(items))
    ctx.addIssue({
      code: 'custom',
      message: `${where}: ${repeated} appears twice`
    })
}

/** Rows and points name their provenance when the file lists several. */
function checkProvenance(
  chart: { provenance: Provenance | Provenance[] },
  items: { label: string; provenance?: Provenance }[],
  ctx: z.RefinementCtx
) {
  const listed = provenanceList(chart.provenance)
  for (const item of items) {
    const source =
      item.provenance ?? (listed.length === 1 ? listed[0] : undefined)
    if (!source || !listed.includes(source))
      ctx.addIssue({
        code: 'custom',
        message: `${item.label} needs a provenance the file lists`
      })
  }
}

/** One end of a chart axis: its title and the words at each end. */
const axisSchema = z.strictObject({
  title: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1)
})

/**
 * Projects placed on two editorial axes, such as how people answer against
 * what they get back. Each point opens its method, reach and source.
 */
export const landscapeDataSchema = z
  .strictObject({
    ...dataBase,
    kind: z.literal('landscape'),
    x: axisSchema,
    y: axisSchema,
    /** How to open a point's details, e.g. "Hover, tap or focus a project". */
    hint: z.string().min(1),
    points: z
      .array(
        z.strictObject({
          key,
          label: z.string().min(1),
          x: unit,
          y: unit,
          /** How people take part and what they get back. */
          method: z.string().min(1),
          /** How many took part, as the project reports it. */
          reach: z.string().min(1),
          /** The group size behind a participant point's `reach`. */
          n: z.number().int().positive().optional(),
          /** Where the method is described. */
          href: z.url(),
          /** Draws the label left of the point instead of right. */
          side: z.enum(['left', 'right']).optional(),
          /** Nudges the label up (negative) or down, in pixels. */
          shift: z.number().min(-24).max(24).optional(),
          /** The project the chart is about, drawn in coral. */
          highlight: z.boolean().optional(),
          provenance: provenance.optional()
        })
      )
      .min(2)
  })
  .superRefine((chart, ctx) => {
    checkKeys(chart.points, 'point', ctx)
    checkProvenance(chart, chart.points, ctx)
    const listed = provenanceList(chart.provenance)
    for (const point of chart.points) {
      const source =
        point.provenance ?? (listed.length === 1 ? listed[0] : undefined)
      // A participant count in prose still has to meet the minimum group.
      if (
        source === 'participants' &&
        !(point.n && point.n >= minimumGroupSize)
      )
        ctx.addIssue({
          code: 'custom',
          message: `${point.label} needs a group size n of at least ${minimumGroupSize}`
        })
    }
    if (chart.points.filter((point) => point.highlight).length > 1)
      ctx.addIssue({ code: 'custom', message: 'Highlight one point at most' })
  })

export const scorecardLevels = ['yes', 'partly', 'no', 'na'] as const
const level = z.enum(scorecardLevels)

/**
 * Approaches (rows) rated against criteria (columns): yes, partly, no or not
 * needed, each with a one-line note that says why.
 */
export const scorecardDataSchema = z
  .strictObject({
    ...dataBase,
    kind: z.literal('scorecard'),
    hint: z.string().min(1),
    /** Legend text for each level, e.g. "Does this", "Partly". */
    levels: z
      .array(z.strictObject({ key: level, label: z.string().min(1) }))
      .length(scorecardLevels.length),
    columns: z
      .array(
        z.strictObject({
          key,
          label: z.string().min(1),
          /** What the criterion asks, shown with its cells. */
          detail: z.string().min(1)
        })
      )
      .min(2)
      .max(10),
    rows: z
      .array(
        z.strictObject({
          key,
          label: z.string().min(1),
          /** Examples, e.g. "Pew, Gallup, AP-NORC". */
          detail: z.string().optional(),
          highlight: z.boolean().optional(),
          cells: z.record(
            z.string(),
            z.strictObject({ level, note: z.string().min(1) })
          )
        })
      )
      .min(1)
  })
  .superRefine((chart, ctx) => {
    checkKeys(chart.columns, 'column', ctx)
    checkKeys(chart.rows, 'row', ctx)
    const levels = new Set(chart.levels.map((entry) => entry.key))
    if (levels.size !== scorecardLevels.length)
      ctx.addIssue({ code: 'custom', message: 'Label every level once' })
    const columns = chart.columns.map((column) => column.key)
    for (const row of chart.rows) {
      const cells = Object.keys(row.cells)
      for (const column of columns)
        if (!cells.includes(column))
          ctx.addIssue({
            code: 'custom',
            message: `${row.label}: no cell for ${column}`
          })
      for (const cell of cells)
        if (!columns.includes(cell))
          ctx.addIssue({
            code: 'custom',
            message: `${row.label}: unknown column ${cell}`
          })
    }
  })

const trendPoint = z.strictObject({
  /** The last day of fieldwork. */
  date: day,
  value: z.number(),
  /** Shown with the value, e.g. "n = 3,488". */
  note: z.string().optional()
})

/**
 * Small multiples of measures over time on one shared date axis: each panel
 * one question with its own scale, one or two series.
 */
export const trendDataSchema = z
  .strictObject({
    ...dataBase,
    kind: z.literal('trend'),
    /** The shared date axis. */
    from: day,
    to: day,
    hint: z.string().min(1),
    /** Dated markers drawn across every panel, e.g. a product launch. */
    events: z
      .array(z.strictObject({ date: day, label: z.string().min(1) }))
      .default([]),
    panels: z
      .array(
        z.strictObject({
          key,
          title: headline,
          /** The question as asked, or who answered it. */
          note: z.string().optional(),
          scale: z.strictObject({
            min: z.number(),
            max: z.number(),
            /** Percent values are shares from 0 to 1. */
            unit: z.enum(['percent', 'year']),
            ticks: z.array(z.number()).min(2)
          }),
          series: z
            .array(
              z.strictObject({
                key,
                label: z.string().min(1),
                tone: tone.optional(),
                /** A dashed line, for a second series in the same color. */
                dashed: z.boolean().optional(),
                points: z.array(trendPoint).min(2)
              })
            )
            .min(1)
            .max(2)
        })
      )
      .min(1)
  })
  .superRefine((chart, ctx) => {
    // Trend values carry no group size, so they cannot be participant numbers.
    if (provenanceList(chart.provenance).includes('participants'))
      ctx.addIssue({
        code: 'custom',
        message: 'Trends carry no group size; chart participants another way'
      })
    if (chart.from >= chart.to)
      ctx.addIssue({ code: 'custom', message: 'A trend runs from before to' })
    checkKeys(chart.panels, 'panel', ctx)
    for (const event of chart.events)
      if (event.date < chart.from || event.date > chart.to)
        ctx.addIssue({
          code: 'custom',
          message: `${event.label}: outside the date axis`
        })
    for (const panel of chart.panels) {
      checkKeys(panel.series, panel.title, ctx)
      const { min, max } = panel.scale
      if (min >= max)
        ctx.addIssue({ code: 'custom', message: `${panel.title}: min < max` })
      for (const series of panel.series)
        series.points.forEach((point, index) => {
          const where = `${panel.title}, ${series.label}, ${point.date}`
          if (point.date < chart.from || point.date > chart.to)
            ctx.addIssue({
              code: 'custom',
              message: `${where}: outside the date axis`
            })
          if (point.value < min || point.value > max)
            ctx.addIssue({
              code: 'custom',
              message: `${where}: outside the scale`
            })
          if (index && point.date <= series.points[index - 1]!.date)
            ctx.addIssue({
              code: 'custom',
              message: `${where}: points run in date order`
            })
        })
    }
  })

/** Who gave an estimate, which sets its color across a post. */
const estimateTones = ['blue', 'coral', 'teal', 'ink'] as const

/**
 * Probability estimates side by side on one log scale, each with the question
 * as worded: a median as a dot, a stated range as a bar, or both.
 */
export const estimatesDataSchema = z
  .strictObject({
    ...dataBase,
    kind: z.literal('estimates'),
    scale: z.strictObject({
      /** The smallest value drawn; anything lower sits at the edge. */
      min: z.number().positive(),
      max: z.number().max(1),
      ticks: z
        .array(
          z.strictObject({
            value: z.number().positive(),
            /** Defaults to the value as a percentage. */
            label: z.string().optional()
          })
        )
        .min(2)
    }),
    legend: z
      .array(
        z.strictObject({
          tone: z.enum(estimateTones),
          /** A dot, a hollow dot for inferred values, or a range bar. */
          mark: z.enum(['dot', 'hollow', 'range']).default('dot'),
          label: z.string().min(1)
        })
      )
      .default([]),
    rows: z
      .array(
        z.strictObject({
          label: z.string().min(1),
          group: z.string().optional(),
          /** The number as published or said, e.g. "10%", "≈0%", "1 in 30 million". */
          figure: z.string().min(1),
          /** A median or single estimate, drawn as a dot. */
          value: probability.optional(),
          /** A stated range, drawn as a bar. */
          low: probability.optional(),
          high: probability.optional(),
          /** The question as asked. */
          wording: z.string().optional(),
          /** Who answered, when and how many. */
          detail: z.string().optional(),
          tone: z.enum(estimateTones),
          /** Read from answers rather than stated, drawn hollow. */
          inferred: z.boolean().optional(),
          /** People behind the value. Participant rows must give it. */
          n: people.optional(),
          provenance: provenance.optional(),
          href: z.url().optional()
        })
      )
      .min(1)
  })
  .superRefine((chart, ctx) => {
    const { min, max } = chart.scale
    if (min >= max)
      ctx.addIssue({ code: 'custom', message: 'Scale needs min < max' })
    checkProvenance(chart, chart.rows, ctx)
    const listed = provenanceList(chart.provenance)
    for (const row of chart.rows) {
      const ranged = row.low !== undefined || row.high !== undefined
      if (ranged && (row.low === undefined || row.high === undefined))
        ctx.addIssue({
          code: 'custom',
          message: `${row.label}: a range needs low and high`
        })
      if (row.value === undefined && !ranged)
        ctx.addIssue({
          code: 'custom',
          message: `${row.label}: needs a value or a range`
        })
      if (
        row.low !== undefined &&
        row.high !== undefined &&
        (row.low > row.high ||
          (row.value !== undefined &&
            (row.value < row.low || row.value > row.high)))
      )
        ctx.addIssue({
          code: 'custom',
          message: `${row.label}: low <= value <= high`
        })
      const source = row.provenance ?? (listed.length === 1 ? listed[0] : null)
      if (source === 'participants')
        for (const message of groupProblems(
          { shown: true, people: row.n },
          row.label
        ))
          ctx.addIssue({ code: 'custom', message })
    }
  })

/** A day, or a month (YYYY-MM) when only the month is known. */
const dayOrMonth = z.union([day, z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/u)])

const quotedPerson = z.strictObject({
  key,
  /** The full name as written, which links to a published profile. */
  name: z.string().min(1),
  /** A portrait from public/personas. */
  avatar: personaPortrait.optional()
})

const quoteSchema = z.strictObject({
  /** Exact words, without surrounding quotation marks. */
  quote: z.string().min(1).max(320),
  /** Where, as readers would name it: "CNN, News Central" or "Post on X". */
  venue: z.string().min(1).max(90),
  /** When they said or published it: YYYY-MM-DD, or YYYY-MM. */
  date: dayOrMonth,
  href: z.url({ protocol: /^https$/u }),
  /**
   * When we matched a quote that isn't among the verified public statements
   * against its source. Quotes without it must match a verified statement.
   */
  checked: day.optional()
})
export type BlogQuote = z.infer<typeof quoteSchema>

/**
 * Two people's exact words side by side, topic by topic, each linked to
 * where it was said. Quotes stay in the speaker's words in every language.
 */
export const quotesDataSchema = z
  .strictObject({
    ...dataBase,
    kind: z.literal('quotes'),
    people: z.tuple([quotedPerson, quotedPerson]),
    rows: z
      .array(
        z.strictObject({
          /** The topic, e.g. "On control". */
          label: z.string().min(1),
          /** One quote per person, by their key. */
          quotes: z.record(z.string(), quoteSchema)
        })
      )
      .min(1)
  })
  .superRefine((chart, ctx) => {
    if (
      provenanceList(chart.provenance).some(
        (source) => source !== 'public-statements'
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Quotes are public statements'
      })
    checkKeys(chart.people, 'person', ctx)
    const keys = chart.people.map((person) => person.key)
    for (const row of chart.rows) {
      const quoted = Object.keys(row.quotes)
      if (
        quoted.length !== keys.length ||
        !keys.every((entry) => quoted.includes(entry))
      )
        ctx.addIssue({
          code: 'custom',
          message: `${row.label}: quote each person once`
        })
    }
  })

export const blogDataSchema = z.discriminatedUnion('kind', [
  rangeDataSchema,
  mapDataSchema,
  barsDataSchema,
  intervalsDataSchema,
  landscapeDataSchema,
  scorecardDataSchema,
  trendDataSchema,
  estimatesDataSchema,
  quotesDataSchema
])
export type BlogData = z.infer<typeof blogDataSchema>

/** Every provenance a data file draws on. */
export const dataProvenances = (data: Pick<BlogData, 'provenance'>) =>
  provenanceList(data.provenance)
