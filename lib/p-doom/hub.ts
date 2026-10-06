import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import { profileMentions, type MentionPart } from '@/lib/personas/mentions'
import {
  footnoteRegistry,
  segments,
  withBylines,
  type CitedProse,
  type Source
} from '@/lib/sources/citations'
import { curatedPeople, statementPublishers } from './curated'
import { readingGroups, type Reading } from './readings'
import { scenarioSources, scenarios, scenariosIntro } from './scenarios'
import { surveyComparison, surveySources } from './survey'

type Statements = typeof publicPdoomStatements
type Person = { id: string; slug: string; name: string; avatar: string }

/**
 * One curated thought leader: a stated number as written with their words, or
 * a refusal quote.
 */
export type HubRow = Omit<Person, 'id'> & {
  /** The stated P(doom) exactly as written; null when they decline to give one. */
  token: string | null
  /**
   * Their exact words from the cited source, never trimmed: the verified
   * statement's quote, or the refusal. Null when the statement records no
   * quote or only a long one.
   */
  quote: string | null
  /**
   * Our one-line outcome, horizon or condition for a number, shown only when
   * the row has no quote: a person's own words take its place.
   */
  note: string | null
  source: Source
}

/** A statement quote of this many words or more is left out, never trimmed. */
export const quoteWordLimit = 25

/**
 * A verified quote short enough to show whole, or null. Only its apostrophes
 * change, to the typographic form the rest of the page uses.
 */
function shortQuote(quote: string | undefined) {
  const text = quote?.trim()
  if (!text || text.split(/\s+/).length >= quoteWordLimit) return null
  return text.replace(/(?<=\p{L})'(?=\p{L})/gu, '’')
}

const hostname = (url: string) => new URL(url).hostname.replace(/^www\./, '')

function statementSource(
  { title, url, publishedAt }: Statements[string],
  name: string
): Source {
  const host = hostname(url)
  return {
    title,
    url,
    by: host === 'x.com' ? `${name} on X` : (statementPublishers[host] ?? host),
    year: Number(publishedAt.slice(0, 4)),
    published: publishedAt
  }
}

/**
 * The newest date in what the hub cites: the table's statements by their
 * publication dates, and its refusals, survey and scenario sources by year,
 * each counted from 1 January so it never claims a later date than the data
 * shows; undated sources don't count. It changes only when the content does.
 */
function newestSourceDate(sources: readonly Source[]) {
  return sources
    .flatMap(({ published, year }) =>
      published ? [published] : year ? [`${year}-01-01`] : []
    )
    .reduce((newest, date) => (date > newest ? date : newest), '')
}

/**
 * The curated table in display order. Numbers and their quotes are read from
 * the verified statements when the page renders; people without a statement,
 * or without a published profile, are left out.
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
      const { quote, source } = entry.declined
      return [{ slug, name, avatar, token: null, quote, note: null, source }]
    }
    const statement = statements[entry.id]
    if (!statement) return []
    const quote = shortQuote(statement.quote)
    return [
      {
        slug,
        name,
        avatar,
        token: statement.token,
        quote,
        // A note written for an earlier source would misdescribe a new one.
        note: quote
          ? null
          : entry.note?.url === statement.url
            ? entry.note.text
            : statement.outcome,
        source: statementSource(statement, name)
      }
    ]
  })
}

const citedSources: Record<string, Source> = {
  ...scenarioSources,
  ...surveySources
}

/**
 * Everything the hub cites, numbered in reading order: the table's sources,
 * the survey benchmark beside it, then the scenarios. Names of people with a
 * published profile link to it: the first mention in each paragraph, and every
 * name in a byline or list.
 */
export function hubContent(
  people: readonly Person[],
  statements: Statements = publicPdoomStatements
) {
  const { cite, footnotes } = footnoteRegistry()
  const mention = profileMentions(people)
  const rows = hubRows(people, statements).map((row) => ({
    ...row,
    citation: cite(row.source)
  }))
  const prose = (text: string): CitedProse => {
    const linked = new Set<string>()
    return segments(text).flatMap((part): CitedProse => {
      if ('text' in part) return mention(part.text, linked)
      if ('emphasis' in part) return [part]
      const source = citedSources[part.cite]
      if (!source) throw new Error(`Unknown hub source [^${part.cite}]`)
      return [cite(source)]
    })
  }
  const survey = prose(surveyComparison)
  const intro = prose(scenariosIntro)
  const cited = scenarios.map((scenario) => ({
    id: scenario.id,
    title: scenario.title,
    summary: prose(scenario.summary),
    proponents: scenario.proponents.map(({ name, claim }) => ({
      name: mention(name),
      claim: prose(claim)
    })),
    disagreement: prose(scenario.disagreement)
  }))
  return {
    rows,
    /** The page's "as of" date, dateModified and sitemap lastmod. */
    asOf: newestSourceDate(footnotes),
    survey,
    intro,
    scenarios: cited,
    footnotes: withBylines(footnotes, (text) => mention(text)),
    readings: readingGroups.map(({ id, readings }) => ({
      id,
      readings: readings.map((reading): HubReading => ({
        ...reading,
        byline: mention(reading.by),
        blurb: mention(reading.description)
      }))
    }))
  }
}

/** A recommended reading whose authors and blurb link to profiles. */
export type HubReading = Reading & {
  byline: MentionPart[]
  blurb: MentionPart[]
}

/** Every page the hub can link to, for prefetching favicons. */
export function hubSourceUrls(statements: Statements = publicPdoomStatements) {
  return [
    ...new Set([
      ...curatedPeople.flatMap((entry) =>
        'declined' in entry
          ? [entry.declined.source.url]
          : statements[entry.id]
            ? [statements[entry.id]!.url]
            : []
      ),
      ...Object.values(surveySources).map(({ url }) => url),
      ...Object.values(scenarioSources).map(({ url }) => url),
      ...readingGroups.flatMap(({ readings }) => readings.map(({ url }) => url))
    ])
  ]
}
