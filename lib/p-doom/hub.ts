import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import { profileMentions, type MentionPart } from '@/lib/personas/mentions'
import {
  footnoteRegistry,
  segments,
  type Citation,
  type Footnote,
  type HubSource
} from './citations'
import { curatedPeople, statementPublishers } from './curated'
import { readingGroups, type Reading } from './readings'
import { scenarioSources, scenarios, scenariosIntro } from './scenarios'
import { surveyComparison, surveySources } from './survey'

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

/**
 * Prose with each citation resolved to its footnote number, and the names of
 * people with a profile marked for linking.
 */
export type CitedProse = (MentionPart | { emphasis: string } | Citation)[]

const citedSources: Record<string, HubSource> = {
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
    survey,
    intro,
    scenarios: cited,
    footnotes: footnotes.map((footnote): HubFootnote => ({
      ...footnote,
      byline: mention(footnote.by)
    })),
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

/** A footnote whose authors link to their profiles. */
export type HubFootnote = Footnote & { byline: MentionPart[] }
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
