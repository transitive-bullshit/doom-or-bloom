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

/** Words a reader reads: prose, without frontmatter, code, JSX or URLs. */
export function countWords(body: string) {
  const text = body
    .replace(/^---[\s\S]*?\n---/u, ' ')
    .replace(/```[\s\S]*?```/gu, ' ')
    .replace(/^(?:import|export)\s.*$/gmu, ' ')
    .replace(/<[^>]*>/gu, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, '$1')
    .replace(/[#>*_`|~-]/gu, ' ')
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
// where its numbers come from. Participant data is not an allowed provenance
// until its owner approves publishing aggregates; see docs/BLOG.md.
const provenance = z.enum(['public-statements', 'simulated-users'])
const probability = z.number().min(0).max(1)
const dataBase = {
  title: headline,
  /** Where the numbers come from, shown under the chart. */
  source: z.string().min(1),
  asOf: day,
  provenance
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

export const mapDataSchema = z.strictObject({
  ...dataBase,
  kind: z.literal('map'),
  points: z
    .array(
      z.strictObject({
        /** Doom (0) to Bloom (1). */
        outlook: probability,
        /** Incremental (0) to civilizational (1) change. */
        transformation: probability,
        label: z.string().optional(),
        /** Relative size, e.g. a count in an aggregate cell. */
        weight: z.number().positive().optional()
      })
    )
    .min(1)
})

export const blogDataSchema = z.discriminatedUnion('kind', [
  rangeDataSchema,
  mapDataSchema
])
