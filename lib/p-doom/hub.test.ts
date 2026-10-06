import { access } from 'node:fs/promises'
import { describe, expect, test } from 'vitest'
import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import { segments, type Source } from '@/lib/sources/citations'
import { curatedPeople } from './curated'
import { sourceIcon } from '@/lib/sources/favicons'
import { hubContent, hubRows, hubSourceUrls } from './hub'
import { readingGroups } from './readings'
import { scenarioSources, scenarios, scenariosIntro } from './scenarios'
import { surveySources } from './survey'

const person = (id: string) => ({
  id,
  slug: id,
  name: id,
  avatar: `/personas/${id}.jpg`
})
const everyone = curatedPeople.map(({ id }) => person(id))
const statement = (
  overrides: Partial<(typeof publicPdoomStatements)[string]> = {}
) => ({
  token: '≥10%',
  bounds: [0.1, 0.99] as [number, number],
  title: 'A talk',
  url: 'https://example.com/talk',
  publishedAt: '2025-11-03',
  outcome: 'The long outcome the statement records',
  horizon: 'Not specified',
  conditions: 'Not specified',
  ...overrides
})

describe('the curated table', () => {
  test('shows each stated token as written, in curated order, with its source', () => {
    const rows = hubRows([person('katja-grace'), person('concerned-pioneer')], {
      'concerned-pioneer': publicPdoomStatements['concerned-pioneer']!,
      'katja-grace': statement({ token: '≈50%', estimate: 0.5 })
    })
    // Curated order, not input or numeric order.
    expect(rows.map((row) => row.slug)).toEqual([
      'concerned-pioneer',
      'katja-grace'
    ])
    expect(rows[0]).toEqual({
      slug: 'concerned-pioneer',
      name: 'concerned-pioneer',
      avatar: '/personas/concerned-pioneer.jpg',
      token: '10–20%',
      quote: null,
      note: 'Chance AI causes human extinction within about 30 years',
      source: {
        title: 'The Godfather of AI says we cannot afford to get it wrong',
        url: 'https://www.wbur.org/onpoint/2025/01/10/ai-geoffrey-hinton-physics-nobel-prize',
        by: 'WBUR',
        year: 2025,
        published: '2025-01-10'
      }
    })
    // A note written for another source gives way to the statement's outcome.
    expect(rows[1]).toMatchObject({
      token: '≈50%',
      note: 'The long outcome the statement records',
      source: { by: 'example.com', year: 2025 }
    })
  })

  test('leaves out people without a statement or a profile', () => {
    const rows = hubRows(
      everyone.filter(({ id }) => id !== 'concerned-pioneer'),
      { 'concerned-pioneer': statement(), 'kevin-roose': statement() }
    )
    expect(rows.filter((row) => row.token)).toHaveLength(1)
    expect(rows.map((row) => row.slug)).not.toContain('concerned-pioneer')
  })

  test('shows refusals as short exact quotes after the numbers', () => {
    const rows = hubRows(everyone)
    const declined = rows.filter((row) => !row.token)
    expect(declined.map((row) => row.name)).toEqual([
      'control-alarmist',
      'scientist-ai-advocate',
      'scientific-steward',
      'cautious-builder'
    ])
    expect(rows.slice(-declined.length)).toEqual(declined)
    for (const row of declined) {
      expect(row.quote!.split(/\s+/).length).toBeLessThan(15)
      expect(row.source.url).toMatch(/^https:\/\//)
    }
  })

  test('curated notes match the statements they describe', () => {
    const stale = curatedPeople.filter((entry) => {
      const current = publicPdoomStatements[entry.id]
      return 'note' in entry && current && entry.note?.url !== current.url
    })
    expect(stale.map(({ id }) => id)).toEqual([])
  })

  test('is dated by its newest cited statement or source, not the render time', () => {
    const latest = (people: ReturnType<typeof person>[], statements = {}) =>
      hubContent(people, statements).asOf
    // A newer statement moves the date; a person without a profile does not.
    expect(
      latest([person('concerned-pioneer'), person('katja-grace')], {
        'concerned-pioneer': statement({ publishedAt: '2031-05-04' }),
        'kevin-roose': statement({ publishedAt: '2032-01-01' })
      })
    ).toBe('2031-05-04')
    // Sources with only a year count from 1 January, never later.
    expect(latest([], {})).toBe(
      `${Math.max(
        ...Object.values({ ...surveySources, ...scenarioSources }).map(
          ({ year }) => year
        )
      )}-01-01`
    )
    // The live hub: its curated statements' dates and its sources' years.
    const { asOf } = hubContent(everyone)
    const dated = curatedPeople.flatMap(({ id }) =>
      'declined' in curatedPeople.find((entry) => entry.id === id)!
        ? []
        : (publicPdoomStatements[id]?.publishedAt ?? [])
    )
    const years = [
      ...curatedPeople.flatMap((entry) =>
        'declined' in entry ? [entry.declined.source.year] : []
      ),
      ...Object.values({ ...surveySources, ...scenarioSources }).map(
        ({ year }) => year
      )
    ]
    expect(asOf).toBe(
      [...dated, `${Math.max(...years)}-01-01`].toSorted().at(-1)
    )
  })

  test('cites X posts by their author', () => {
    const [row] = hubRows([person('world-model-optimist')], {
      'world-model-optimist': statement({
        url: 'https://x.com/ylecun/status/2046577402264870958'
      })
    })
    expect(row!.source.by).toBe('world-model-optimist on X')
  })
})

describe('citations', () => {
  test('split prose into text, titles and markers', () => {
    expect(segments('As *The Book* says,[^a] it is.[^b][^a]')).toEqual([
      { text: 'As ' },
      { emphasis: 'The Book' },
      { text: ' says,' },
      { cite: 'a' },
      { text: ' it is.' },
      { cite: 'b' },
      { cite: 'a' }
    ])
  })

  test('number sources by first citation across the table, survey and scenarios', () => {
    const {
      rows,
      survey,
      intro,
      scenarios: cited,
      footnotes
    } = hubContent(everyone)
    expect(footnotes.map((note) => note.number)).toEqual(
      footnotes.map((_, index) => index + 1)
    )
    // The table cites first, then the survey beside it, then the scenarios in
    // reading order.
    expect(rows.map((row) => row.citation.number)).toEqual(
      rows.map((_, index) => index + 1)
    )
    expect(survey.filter((part) => 'number' in part)).toEqual([
      { number: rows.length + 1, id: `cite-${rows.length + 1}` }
    ])
    expect(footnotes[rows.length]).toMatchObject(surveySources['espai-2024'])
    expect(intro.find((part) => 'number' in part)).toEqual({
      number: rows.length + 2,
      id: `cite-${rows.length + 2}`
    })
    // A repeated source keeps its number, and only its first marker is an anchor.
    const markers = cited
      .flatMap((scenario) => [
        ...scenario.summary,
        ...scenario.proponents.flatMap(({ claim }) => claim),
        ...scenario.disagreement
      ])
      .filter((part) => 'number' in part)
    const carlsmith = footnotes.find(
      (note) => note.url === scenarioSources['power-seeking-ai'].url
    )!
    const uses = markers.filter((part) => part.number === carlsmith.number)
    expect(uses.length).toBeGreaterThan(1)
    expect(uses.filter((part) => part.id)).toEqual([
      { number: carlsmith.number, id: `cite-${carlsmith.number}` }
    ])
    expect(new Set(footnotes.map((note) => note.url)).size).toBe(
      footnotes.length
    )
  })

  test('every scenario source is cited, and every citation has a source', () => {
    const prose = [
      scenariosIntro,
      ...scenarios.flatMap((scenario) => [
        scenario.summary,
        ...scenario.proponents.map(({ claim }) => claim),
        scenario.disagreement
      ])
    ]
    const keys = new Set(
      prose.flatMap((text) =>
        segments(text).flatMap((part) => ('cite' in part ? [part.cite] : []))
      )
    )
    expect([...keys].toSorted()).toEqual(
      Object.keys(scenarioSources).toSorted()
    )
    expect(scenarios).toHaveLength(6)
  })
})

describe('profile links', () => {
  const published = [
    {
      id: 'biosecurity-abundance-optimist',
      slug: 'noahpinion',
      name: 'Noah Smith'
    },
    { id: 'frontier-pacer', slug: 'darioamodei', name: 'Dario Amodei' },
    { id: 'control-alarmist', slug: 'esyudkowsky', name: 'Eliezer Yudkowsky' },
    {
      id: 'superintelligence-stop-advocate',
      slug: 'so8res',
      name: 'Nate Soares'
    }
  ].map((entry) => ({ ...entry, avatar: '/personas/x.jpg' }))
  const content = hubContent(published)
  const slugs = (parts: object[]) =>
    parts.flatMap((part) => ('slug' in part ? [part.slug] : []))

  test('link the first mention in each paragraph of published people only', () => {
    // Toby Ord has no profile; Noah Smith does.
    expect(slugs(content.intro)).toEqual(['noahpinion'])
    const misuse = content.scenarios.find(
      ({ id }) => id === 'mass-casualty-misuse'
    )!
    expect(slugs(misuse.summary)).toEqual(['darioamodei'])
    expect(misuse.proponents.map(({ name }) => slugs(name))).toEqual([
      ['darioamodei'],
      ['noahpinion'],
      []
    ])
    expect(slugs(hubContent([]).intro)).toEqual([])
  })

  test('link every published author in footnotes and readings', () => {
    const book = content.footnotes.find(
      (note) => note.url === scenarioSources['if-anyone-builds-it'].url
    )!
    expect(slugs(book.byline)).toEqual(['esyudkowsky', 'so8res'])
    expect(book.byline.map(({ text }) => text).join('')).toBe(book.by)
    const [start] = content.readings
    expect(slugs(start!.readings[0]!.byline)).toEqual(['esyudkowsky', 'so8res'])
  })
})

describe('sources and readings', () => {
  const all: Source[] = [
    ...hubContent(everyone).footnotes,
    ...readingGroups.flatMap(({ readings }) => readings)
  ]

  test('have titles, authors and plausible years', () => {
    for (const source of all) {
      expect(source.title.trim()).toBe(source.title)
      expect(source.by).not.toBe('')
      expect(source.year).toBeGreaterThanOrEqual(2008)
      expect(source.year).toBeLessThanOrEqual(new Date().getFullYear())
      expect(new URL(source.url).protocol).toBe('https:')
    }
    for (const { readings } of readingGroups)
      for (const reading of readings)
        expect(reading.description).toMatch(/[.!?]$/)
  })

  test('show a committed local favicon for every page the hub links', async () => {
    const icons = hubSourceUrls().map((url) => ({ url, icon: sourceIcon(url) }))
    expect(
      icons.filter(
        ({ icon }) => !/^\/resource-previews\/[\w-]+\.webp$/.test(icon ?? '')
      )
    ).toEqual([])
    await Promise.all(icons.map(({ icon }) => access(`public${icon}`)))
  })
})
