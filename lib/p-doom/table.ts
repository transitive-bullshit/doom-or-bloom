import type { Translator } from '@/i18n/translator'
import {
  pdoomRangeLabel,
  pdoomTokenLabel,
  presentPdoom,
  unclearToken
} from '@/lib/assessment/present-result'
import type { Result } from '@/lib/assessment/schema'

/** One simulated user on the P(doom) hub, ready to display and sort. */
export type PdoomRow = {
  slug: string
  name: string
  avatar: string
  /** A number the person stated publicly, as recorded in their source brief. */
  stated: {
    token: string
    /** For sorting: the stated point, or the middle of a stated range. */
    value: number
    outcome: string
    source: { title: string; url: string; date: string; dateTime: string }
  } | null
  /** The simulated interview's number: inferred from answers, or one it gave. */
  simulated: {
    token: string
    /** For sorting; null when the reading is unclear. */
    value: number | null
    /** The plausible range of an inferred number, or that the simulation gave it. */
    detail: string | null
  } | null
}

const middle = ([low, high]: [number, number]) => (low + high) / 2

/**
 * Rows for the hub's table from presented results, the same data simulated
 * user pages show. A stated number appears only when the result carries a
 * sourced public statement; every simulated number is labeled as such.
 */
export function pdoomRows(
  t: Translator,
  tag: string,
  people: readonly {
    slug: string
    name: string
    avatar: string
    result: Result
  }[]
): PdoomRow[] {
  const monthYear = new Intl.DateTimeFormat(tag, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  })
  return people.map(({ slug, name, avatar, result }) => {
    // A result whose experiment predates its latest evidence shows no P(doom),
    // as on the profile.
    const experiment =
      result.experiment?.evidenceRevision === result.evidenceRevision
        ? result.experiment
        : undefined
    const risk = experiment?.pdoom
    const statement =
      risk?.source === 'public-statement' ? risk.publicStatement : undefined
    const simulated = presentPdoom(
      statement ? (risk?.assessmentEstimate ?? null) : risk
    )
    return {
      slug,
      name,
      avatar,
      stated: statement
        ? {
            token: statement.token,
            value: statement.estimate ?? middle(statement.bounds),
            outcome: statement.outcome,
            source: {
              title: statement.title,
              url: statement.url,
              date: monthYear.format(new Date(statement.publishedAt)),
              dateTime: statement.publishedAt
            }
          }
        : null,
      simulated: simulated?.token
        ? {
            token: pdoomTokenLabel(t, simulated.token),
            value:
              simulated.token === unclearToken
                ? null
                : (simulated.estimate ??
                  (simulated.bounds ? middle(simulated.bounds) : null)),
            detail:
              simulated.source === 'stated'
                ? t('PdoomHub.given')
                : simulated.source === 'inferred' && simulated.bounds
                  ? t('PdoomHub.range', {
                      range: pdoomRangeLabel(t, simulated.bounds)
                    })
                  : null
          }
        : null
    }
  })
}

export type PdoomSortKey = 'name' | 'stated' | 'simulated'
export type PdoomSort = { key: PdoomSortKey; direction: 'asc' | 'desc' }

// One collation on the server and in every browser, so hydration agrees.
const collator = new Intl.Collator('en')

/** Missing numbers sort last in either direction; names break ties. */
export function sortPdoomRows(
  rows: readonly PdoomRow[],
  { key, direction }: PdoomSort
) {
  const sign = direction === 'asc' ? 1 : -1
  const byName = (a: PdoomRow, b: PdoomRow) => collator.compare(a.name, b.name)
  return rows.toSorted((a, b) => {
    if (key === 'name') return sign * byName(a, b)
    const left = a[key]?.value ?? null
    const right = b[key]?.value ?? null
    if (left === null) return right === null ? byName(a, b) : 1
    if (right === null) return -1
    return sign * (left - right) || byName(a, b)
  })
}
