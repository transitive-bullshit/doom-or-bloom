import { z } from 'zod'
import { oneLinerProblems } from './one-liner-rules'
import darioamodei from '@/content/profiles/darioamodei.json'
import geoffreyhinton from '@/content/profiles/geoffreyhinton.json'
import ylecun from '@/content/profiles/ylecun.json'

// What a simulated user's real person has said about AI: short, dated quotes
// in their own words, each checked against the page it links to. Shown on the
// profile below the map (docs/user-journeys.md#public-statements). Never quote
// simulated answers here.

const day = z.iso.date()
const dayOrMonth = z.union([day, z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)])

const publicStatementSchema = z.strictObject({
  /** Exact words, without surrounding quotation marks. */
  quote: z.string().min(1).max(320),
  /** When they said or published it: YYYY-MM-DD, or YYYY-MM when only the month is known. */
  date: dayOrMonth,
  /** Where, as readers would name it: "CNN, The Lead" or "Essay, The Urgency of Interpretability". */
  venue: z.string().min(1).max(90),
  url: z.url({ protocol: /^https$/ }),
  /** When we last matched the quote against the linked page. */
  verified: day
})
export type PublicStatement = z.infer<typeof publicStatementSchema>

export const publicStatementsSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9_-]{1,80}$/),
  /** One neutral sentence under the one-liner rule. */
  summary: z.string(),
  statements: z.array(publicStatementSchema).min(3).max(5)
})
export type PublicStatements = z.infer<typeof publicStatementsSchema>

/** Quotes stay short enough to read at a glance; 25 words is the target. */
const maxQuoteWords = 30

const words = (text: string) => text.split(/\s+/).filter(Boolean).length

/** The mechanical checks; whether quotes are fair to the person still needs a read. */
export function publicStatementProblems(file: PublicStatements) {
  const problems = oneLinerProblems(file.summary).map(
    (problem) => `summary ${problem}`
  )
  file.statements.forEach((statement, index) => {
    const at = `statement ${index + 1}`
    const { quote } = statement
    if (quote !== quote.trim() || /\s{2}|\n/.test(quote))
      problems.push(`${at} has stray whitespace`)
    if (/^[“”"‘’']|[“”"‘’']$/.test(quote))
      problems.push(`${at} wraps its quote in quotation marks`)
    if (words(quote) > maxQuoteWords)
      problems.push(`${at} has ${words(quote)} words, over ${maxQuoteWords}`)
    if (statement.verified < statement.date.slice(0, 10))
      problems.push(`${at} was verified before it was said`)
    const next = file.statements[index + 1]
    if (next && next.date > statement.date)
      problems.push(`${at} is older than the one after it; list newest first`)
  })
  return problems
}

const files = [darioamodei, geoffreyhinton, ylecun].map((file) =>
  publicStatementsSchema.parse(file)
)

/** Every profile with sourced statements, keyed by slug. */
export const publicStatements: ReadonlyMap<string, PublicStatements> = new Map(
  files.map((file) => [file.slug, file])
)
