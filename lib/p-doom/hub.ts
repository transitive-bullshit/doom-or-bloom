import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import {
  footnoteRegistry,
  segments,
  type Citation,
  type HubSource
} from './citations'
import { curatedPeople, statementPublishers } from './curated'
import { scenarioSources, scenarios, scenariosIntro } from './scenarios'

type Statements = typeof publicPdoomStatements
type Person = { id: string; slug: string; name: string; avatar: string }

/** One curated thought leader: a stated number as written, or a refusal quote. */
export type HubRow = Omit<Person, 'id'> & {
  /** The stated P(doom) exactly as written; null when they decline to give one. */
  token: string | null
  /** The refusal, quoted exactly; null when there is a number. */
  quote: string | null
  /** Outcome, horizon or condition for a number, or context for a refusal. */
  note: string
  source: HubSource
}

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, '')

function statementSource(
  { title, url, publishedAt }: Statements[string],
  name: string
): HubSource {
  const host = hostname(url)
  return {
    title,
    url,
    by: host === 'x.com' ? `${name} on X` : (statementPublishers[host] ?? host),
    year: Number(publishedAt.slice(0, 4))
  }
}

/**
 * The curated table in display order. Numbers are read from the verified
 * statements when the page renders; people without a statement, or without a
 * published profile, are left out.
 */
export function hubRows(
  people: readonly Person[],
  statements: Statements = publicPdoomStatements
): HubRow[] {
  const byId = new Map(people.map((person) => [person.id, person]))
  return curatedPeople.flatMap((entry): HubRow[] => {
    const person = byId.get(entry.id)
    if (!person) return []
    const { slug, name, avatar } = person
    if ('declined' in entry) {
      const { quote, note, source } = entry.declined
      return [{ slug, name, avatar, token: null, quote, note, source }]
    }
    const statement = statements[entry.id]
    if (!statement) return []
    return [
      {
        slug,
        name,
        avatar,
        token: statement.token,
        quote: null,
        // A note written for an earlier source would misdescribe a new one.
        note:
          entry.note?.url === statement.url
            ? entry.note.text
            : statement.outcome,
        source: statementSource(statement, name)
      }
    ]
  })
}

/** Prose with each citation resolved to its footnote number. */
export type CitedProse = ({ text: string } | { emphasis: string } | Citation)[]

/**
 * Everything the hub cites, numbered in reading order: the table's sources,
 * then the scenarios.
 */
export function hubContent(
  people: readonly Person[],
  statements: Statements = publicPdoomStatements
) {
  const { cite, footnotes } = footnoteRegistry()
  const rows = hubRows(people, statements).map((row) => ({
    ...row,
    citation: cite(row.source)
  }))
  const prose = (text: string): CitedProse =>
    segments(text).map((part) => {
      if (!('cite' in part)) return part
      const source = (scenarioSources as Record<string, HubSource>)[part.cite]
      if (!source) throw new Error(`Unknown scenario source [^${part.cite}]`)
      return cite(source)
    })
  const intro = prose(scenariosIntro)
  const cited = scenarios.map((scenario) => ({
    id: scenario.id,
    title: scenario.title,
    summary: prose(scenario.summary),
    proponents: scenario.proponents.map(({ name, claim }) => ({
      name,
      claim: prose(claim)
    })),
    disagreement: prose(scenario.disagreement)
  }))
  return { rows, intro, scenarios: cited, footnotes }
}
