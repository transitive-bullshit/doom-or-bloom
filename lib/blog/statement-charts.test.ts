import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { personas } from '@/lib/journeys/catalog'
import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import { curatedPeople } from '@/lib/p-doom/curated'
import { publicStatements } from '@/lib/personas/public-statements'
import { dataStrings, dataTranslationProblems, translateData } from './l10n'
import { blogDirectory } from './posts'
import { blogDataSchema, mapDataSchema, quotesDataSchema } from './schema'

// Charts of what people have said: quotes side by side, and maps that compare
// simulated thought leaders two at a time (docs/BLOG.md#data-components).

const dataDirectory = path.join(blogDirectory, 'data')
const charts = readdirSync(dataDirectory)
  .filter((file) => file.endsWith('.json'))
  .map((file) => ({
    file,
    chart: blogDataSchema.parse(
      JSON.parse(readFileSync(path.join(dataDirectory, file), 'utf8'))
    )
  }))
const quoteCharts = charts.flatMap(({ file, chart }) =>
  chart.kind === 'quotes' ? [{ file, chart }] : []
)

/** Every quote already verified against its source, by URL. */
const verifiedQuotes = [
  ...[...publicStatements.values()].flatMap((file) =>
    file.statements.map(({ url, quote }) => ({ url, quote }))
  ),
  ...Object.values(publicPdoomStatements).flatMap(({ url, quote }) =>
    quote ? [{ url, quote }] : []
  ),
  ...curatedPeople.flatMap((person) =>
    'declined' in person
      ? [{ url: person.declined.source.url, quote: person.declined.quote }]
      : []
  )
]

const quotes = {
  kind: 'quotes',
  title: 'Two people',
  source: 'Their words.',
  asOf: '2026-10-06',
  provenance: 'public-statements',
  people: [
    { key: 'a', name: 'Person A' },
    { key: 'b', name: 'Person B' }
  ],
  rows: [
    {
      label: 'On control',
      quotes: {
        a: {
          quote: 'Words',
          venue: 'Post on X',
          date: '2026-09',
          href: 'https://x.com/a/status/1'
        },
        b: {
          quote: 'Other words',
          venue: 'Interview',
          date: '2026-09-16',
          href: 'https://example.com/b',
          checked: '2026-10-06'
        }
      }
    }
  ]
}

describe('quotes charts', () => {
  const ok = (data: unknown) => quotesDataSchema.safeParse(data).success
  const row = quotes.rows[0]!

  it('quote both people in every row, from public statements', () => {
    expect(ok(quotes)).toBe(true)
    expect(
      ok({ ...quotes, rows: [{ ...row, quotes: { a: row.quotes.a } }] })
    ).toBe(false)
    expect(
      ok({
        ...quotes,
        rows: [{ ...row, quotes: { ...row.quotes, c: row.quotes.a } }]
      })
    ).toBe(false)
    expect(ok({ ...quotes, provenance: 'simulated-users' })).toBe(false)
    expect(
      ok({ ...quotes, people: [quotes.people[0], quotes.people[0]] })
    ).toBe(false)
    expect(
      ok({
        ...quotes,
        rows: [
          {
            ...row,
            quotes: { ...row.quotes, a: { ...row.quotes.a, href: 'http://x' } }
          }
        ]
      })
    ).toBe(false)
  })

  it('reuse verified quotes exactly, and date the ones checked for a post', () => {
    expect(quoteCharts.length).toBeGreaterThan(0)
    for (const { file, chart } of quoteCharts)
      for (const entry of chart.rows)
        for (const [key, quote] of Object.entries(entry.quotes)) {
          const where = { file, row: entry.label, key }
          // A checked quote was matched after it was said; one without a
          // check date must be one we already verified, from the same page.
          const ok = quote.checked
            ? quote.checked >= quote.date
            : verifiedQuotes.some(
                (statement) =>
                  statement.url === quote.href &&
                  statement.quote === quote.quote
              )
          expect({ ...where, ok }).toEqual({ ...where, ok: true })
        }
  })

  it('name people with a simulated profile', () => {
    const names = new Set(
      personas.map((persona) => persona.proxy.split(' · ')[0])
    )
    for (const { file, chart } of quoteCharts)
      for (const person of chart.people)
        expect({
          file,
          name: person.name,
          known: names.has(person.name)
        }).toEqual({ file, name: person.name, known: true })
  })

  it('translate topics, titles and venues but never the quotes', () => {
    for (const { chart } of quoteCharts) {
      const strings = dataStrings(chart)
      const paths = strings.map(([at]) => at)
      expect(paths).toContain('.rows[0].label')
      expect(paths).toContain(
        '.rows[0].quotes.' + chart.people[0].key + '.venue'
      )
      expect(paths.some((at) => at.endsWith('.quote'))).toBe(false)
      expect(paths.some((at) => at.endsWith('.name'))).toBe(false)
      const translated = translateData(
        chart,
        new Map(strings.map(([at, text]) => [at, `«${text}»`]))
      )
      expect(dataTranslationProblems(chart, translated)).toEqual([])
    }
  })
})

describe('map pairs', () => {
  const map = {
    kind: 'map',
    title: 'Rivals',
    source: 'Profiles.',
    asOf: '2026-10-06',
    provenance: 'simulated-users',
    hint: 'Pick a pair',
    points: [
      { key: 'a', outlook: 0.2, transformation: 0.8, label: 'A' },
      { key: 'b', outlook: 0.8, transformation: 0.7, label: 'B', side: 'left' }
    ],
    pairs: [{ key: 'a-b', label: 'A vs B', points: ['a', 'b'], note: 'Apart' }]
  }
  const ok = (data: unknown) => mapDataSchema.safeParse(data).success
  const pair = map.pairs[0]!

  it('join two distinct points that exist, with a hint', () => {
    expect(ok(map)).toBe(true)
    expect(ok({ ...map, pairs: [{ ...pair, points: ['a', 'c'] }] })).toBe(false)
    expect(ok({ ...map, pairs: [{ ...pair, points: ['a', 'a'] }] })).toBe(false)
    expect(ok({ ...map, pairs: [pair, pair] })).toBe(false)
    expect(ok({ ...map, hint: undefined })).toBe(false)
    expect(
      ok({ ...map, points: [map.points[0], { ...map.points[1], key: 'a' }] })
    ).toBe(false)
  })

  it('place every committed pair from simulated profiles', () => {
    for (const { file, chart } of charts) {
      if (chart.kind !== 'map' || !chart.pairs) continue
      expect({ file, provenance: chart.provenance }).toEqual({
        file,
        provenance: 'simulated-users'
      })
      const names = new Set(
        personas.map((persona) => persona.proxy.split(' · ')[0])
      )
      for (const point of chart.points)
        expect({
          file,
          name: point.name,
          known: names.has(point.name!)
        }).toEqual({ file, name: point.name, known: true })
    }
  })
})
