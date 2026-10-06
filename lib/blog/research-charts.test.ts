import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import {
  dateShare,
  highlightQuadrant,
  logShare,
  nearestIndex,
  thinTicks,
  unionDates,
  yearTicks
} from './chart-geometry'
import { dataStrings, dataTranslationProblems, translateData } from './l10n'
import { blogDirectory } from './posts'
import {
  estimatesDataSchema,
  landscapeDataSchema,
  scorecardDataSchema,
  scorecardLevelsUsed,
  trendDataSchema
} from './schema'

// The charts that set outside research beside our own numbers: the landscape,
// scorecard, trend and estimates kinds (docs/BLOG.md#data-components).

const readData = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(blogDirectory, 'data', file), 'utf8'))
const valid =
  (schema: { safeParse: (data: unknown) => { success: boolean } }) =>
  (data: unknown) =>
    schema.safeParse(data).success
const base = {
  title: 'A chart',
  source: 'Somewhere.',
  asOf: '2026-10-04',
  provenance: 'published-research'
}

describe('chart geometry', () => {
  it('places probabilities on a log scale and flags values below it', () => {
    expect(logShare(0.01, 0.001, 1).share).toBeCloseTo(1 / 3)
    expect(logShare(0.1, 0.001, 1).share).toBeCloseTo(2 / 3)
    expect(logShare(0, 0.001, 1)).toEqual({ share: 0, below: true })
    expect(logShare(0.001, 0.001, 1)).toEqual({ share: 0, below: false })
    expect(logShare(2, 0.001, 1)).toEqual({ share: 1, below: false })
  })

  it('places dates and labels years without crowding', () => {
    expect(dateShare('2021-01-01', '2021-01-01', '2023-01-01')).toBe(0)
    expect(dateShare('2022-01-01', '2021-01-01', '2023-01-01')).toBeCloseTo(
      0.5,
      2
    )
    expect(dateShare('2030-01-01', '2021-01-01', '2023-01-01')).toBe(1)
    expect(
      yearTicks('2021-01-01', '2026-12-31').map(({ year }) => year)
    ).toEqual([2021, 2022, 2023, 2024, 2025, 2026])
    expect(
      yearTicks('2021-03-01', '2023-12-31').map(({ year }) => year)
    ).toEqual([2022, 2023])
    expect(thinTicks([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 6)).toEqual([
      1, 3, 5, 7, 9
    ])
    expect(thinTicks([1, 2, 3], 6)).toEqual([1, 2, 3])
  })

  it('snaps a crosshair to the nearest survey across series', () => {
    expect(nearestIndex([0, 0.4, 0.9], 0.62)).toBe(1)
    expect(nearestIndex([0, 0.4, 0.9], 0.7)).toBe(2)
    expect(
      unionDates([
        { points: [{ date: '2024-01-01' }, { date: '2022-01-01' }] },
        { points: [{ date: '2022-01-01' }, { date: '2023-01-01' }] }
      ])
    ).toEqual(['2022-01-01', '2023-01-01', '2024-01-01'])
  })
})

describe('estimates charts', () => {
  const row = {
    label: 'Researchers',
    figure: '10%',
    value: 0.1,
    tone: 'teal'
  }
  const chart = (rows: unknown[], provenance: unknown = base.provenance) => ({
    ...base,
    provenance,
    kind: 'estimates',
    scale: { min: 0.001, max: 1, ticks: [{ value: 0.001 }, { value: 1 }] },
    rows
  })
  const ok = valid(estimatesDataSchema)

  it('need a value or a whole range, in order', () => {
    expect(ok(chart([row]))).toBe(true)
    expect(ok(chart([{ ...row, value: undefined }]))).toBe(false)
    expect(ok(chart([{ ...row, value: undefined, low: 0.1, high: 0.2 }]))).toBe(
      true
    )
    expect(ok(chart([{ ...row, low: 0.1 }]))).toBe(false)
    expect(ok(chart([{ ...row, low: 0.2, high: 0.3 }]))).toBe(false)
  })

  it('show participant numbers only for groups of at least 10', () => {
    const participants = { ...row, tone: 'coral', provenance: 'participants' }
    const mixed = ['published-research', 'participants']
    expect(ok(chart([{ ...participants, n: 117 }], mixed))).toBe(true)
    expect(ok(chart([{ ...participants, n: 9 }], mixed))).toBe(false)
    expect(ok(chart([participants], mixed))).toBe(false)
    // A row from a source the file doesn't list is rejected.
    expect(ok(chart([{ ...participants, n: 117 }]))).toBe(false)
  })

  it('match the verified public statements they chart', () => {
    for (const file of [
      'ai-extinction-estimates.json',
      'ai-extinction-format.json'
    ]) {
      const parsed = estimatesDataSchema.parse(readData(file))
      for (const entry of parsed.rows.filter(
        (item) => item.provenance === 'public-statements'
      )) {
        const statement = Object.values(publicPdoomStatements).find(
          (candidate) => candidate.url === entry.href
        )
        expect({ file, label: entry.label, found: Boolean(statement) }).toEqual(
          { file, label: entry.label, found: true }
        )
        expect({
          figure: entry.figure,
          bounds: [entry.low, entry.high]
        }).toEqual({ figure: statement!.token, bounds: statement!.bounds })
      }
    }
  })

  it('cite participant medians from the committed aggregates', () => {
    const aggregates = JSON.parse(
      readFileSync('content/blog/aggregates/participants.json', 'utf8')
    ) as {
      asOf: string
      pdoom: Record<'typed' | 'inferred', { n: number; median: number }>
    }
    const { pdoom } = aggregates
    const parsed = estimatesDataSchema.parse(
      readData('ai-extinction-estimates.json')
    )
    const participants = parsed.rows.filter(
      (entry) => entry.provenance === 'participants'
    )
    expect(
      participants.map(({ value, n, inferred }) => ({
        value,
        n,
        inferred: Boolean(inferred)
      }))
    ).toEqual([
      { value: pdoom.typed.median, n: pdoom.typed.n, inferred: false },
      { value: pdoom.inferred.median, n: pdoom.inferred.n, inferred: true }
    ])
    expect(parsed.source).toContain('October 3, 2026')
    expect(aggregates.asOf).toBe('2026-10-03')
  })
})

describe('landscape charts', () => {
  const point = {
    key: 'polls',
    label: 'Polls',
    x: 0.1,
    y: 0.1,
    method: 'Fixed questions.',
    reach: 'Thousands.',
    href: 'https://example.com/polls'
  }
  const chart = (points: unknown[]) => ({
    ...base,
    kind: 'landscape',
    x: { title: 'How', start: 'Fixed', end: 'Free' },
    y: { title: 'What', start: 'Nothing', end: 'Result' },
    hint: 'Hover a point',
    points
  })
  const ok = valid(landscapeDataSchema)

  it('carry a group size of 10 or more for participant points', () => {
    const ours = {
      ...point,
      key: 'ours',
      label: 'Ours',
      provenance: 'participants'
    }
    const mixed = (entry: unknown) => ({
      ...chart([point, entry]),
      provenance: ['published-research', 'participants']
    })
    const polls = { ...point, provenance: 'published-research' }
    expect(
      ok({
        ...mixed({ ...ours, n: 953 }),
        points: [polls, { ...ours, n: 953 }]
      })
    ).toBe(true)
    expect(ok({ ...mixed(ours), points: [polls, ours] })).toBe(false)
    expect(ok({ ...mixed(ours), points: [polls, { ...ours, n: 8 }] })).toBe(
      false
    )
  })

  it('count our point from the committed aggregates', () => {
    const aggregates = JSON.parse(
      readFileSync('content/blog/aggregates/participants.json', 'utf8')
    ) as { map: { overall: { outlook: { n: number } } } }
    const parsed = landscapeDataSchema.parse(
      readData('ai-opinion-landscape.json')
    )
    const ours = parsed.points.filter((p) => p.provenance === 'participants')
    expect(ours.map((p) => p.n)).toEqual([aggregates.map.overall.outlook.n])
  })

  it('tint the highlighted point’s quadrant, or none without a highlight', () => {
    const point = { x: 0.9, y: 0.93 }
    expect(highlightQuadrant([point, { ...point, highlight: true }])).toEqual({
      right: true,
      top: true
    })
    expect(
      highlightQuadrant([{ x: 0.1, y: 0.2, highlight: true }, point])
    ).toEqual({ right: false, top: false })
    expect(highlightQuadrant([point, { x: 0.1, y: 0.2 }])).toBeNull()
  })

  it('need distinct points, on the unit square, with one highlight at most', () => {
    const other = { ...point, key: 'quizzes', label: 'Quizzes' }
    expect(ok(chart([point, other]))).toBe(true)
    expect(ok(chart([point, { ...other, key: 'polls' }]))).toBe(false)
    expect(ok(chart([point, { ...other, x: 1.2 }]))).toBe(false)
    expect(
      ok(
        chart([
          { ...point, highlight: true },
          { ...other, highlight: true }
        ])
      )
    ).toBe(false)
  })
})

describe('scorecard charts', () => {
  const levels = [
    { key: 'yes', label: 'Does this' },
    { key: 'partly', label: 'Partly' },
    { key: 'no', label: 'Doesn’t' },
    { key: 'na', label: 'Not needed' }
  ]
  const columns = [
    { key: 'sample', label: 'Sample', detail: 'Who?' },
    { key: 'wording', label: 'Wording', detail: 'How?' }
  ]
  const cell = { level: 'yes', note: 'Why' }
  const chart = (cells: Record<string, unknown>, levelList = levels) => ({
    ...base,
    kind: 'scorecard',
    hint: 'Hover a mark',
    levels: levelList,
    columns,
    rows: [{ key: 'polls', label: 'Polls', cells }]
  })
  const ok = valid(scorecardDataSchema)

  it('rate every row on every column, and nothing else', () => {
    expect(ok(chart({ sample: cell, wording: cell }))).toBe(true)
    expect(ok(chart({ sample: cell }))).toBe(false)
    expect(ok(chart({ sample: cell, wording: cell, other: cell }))).toBe(false)
    expect(
      ok(chart({ sample: cell, wording: { level: 'maybe', note: 'Why' } }))
    ).toBe(false)
  })

  it('label each level once', () => {
    expect(
      ok(
        chart({ sample: cell, wording: cell }, [
          ...levels.slice(0, 3),
          levels[0]!
        ])
      )
    ).toBe(false)
  })

  it('list only the levels their cells use, in legend order', () => {
    const parsed = scorecardDataSchema.parse(
      chart({ sample: { level: 'no', note: 'Why' }, wording: cell })
    )
    expect(scorecardLevelsUsed(parsed).map((entry) => entry.key)).toEqual([
      'yes',
      'no'
    ])
    const polls = scorecardDataSchema.parse(
      readData('ai-opinion-scorecard.json')
    )
    expect(scorecardLevelsUsed(polls)).toEqual(polls.levels)
  })
})

describe('trend charts', () => {
  const panel = {
    key: 'pew',
    title: 'More concerned than excited',
    scale: { min: 0, max: 0.7, unit: 'percent', ticks: [0, 0.6] },
    series: [
      {
        key: 'concerned',
        label: 'More concerned',
        points: [
          { date: '2021-11-07', value: 0.37 },
          { date: '2026-06-28', value: 0.52 }
        ]
      }
    ]
  }
  const chart = (panels: unknown[], provenance: unknown = base.provenance) => ({
    ...base,
    provenance,
    kind: 'trend',
    from: '2021-01-01',
    to: '2026-12-31',
    hint: 'Hover a panel',
    panels
  })
  const ok = valid(trendDataSchema)
  const withPoints = (points: unknown[]) => [
    { ...panel, series: [{ ...panel.series[0], points }] }
  ]

  it('keep points on the axes and in date order', () => {
    expect(ok(chart([panel]))).toBe(true)
    expect(
      ok(
        chart(
          withPoints([
            { date: '2021-11-07', value: 0.37 },
            { date: '2026-06-28', value: 0.8 }
          ])
        )
      )
    ).toBe(false)
    expect(
      ok(
        chart(
          withPoints([
            { date: '2020-11-07', value: 0.37 },
            { date: '2026-06-28', value: 0.5 }
          ])
        )
      )
    ).toBe(false)
    expect(
      ok(
        chart(
          withPoints([
            { date: '2026-06-28', value: 0.5 },
            { date: '2021-11-07', value: 0.37 }
          ])
        )
      )
    ).toBe(false)
  })

  it('carry no participant numbers, which need a group size', () => {
    expect(ok(chart([panel], 'participants'))).toBe(false)
  })
})

describe('research chart translations', () => {
  it('translate the reader’s text and keep keys, links, tones and numbers', () => {
    for (const file of [
      'ai-opinion-landscape.json',
      'ai-opinion-scorecard.json',
      'ai-opinion-trend.json',
      'ai-extinction-estimates.json'
    ]) {
      const data = readData(file)
      const strings = dataStrings(data)
      const paths = strings.map(([at]) => at)
      const values = strings.map(([, text]) => text)
      // Nothing machine-readable is offered for translation.
      for (const text of values) {
        expect(text).not.toMatch(/^https?:/u)
        expect(text).not.toMatch(/^\d{4}-\d{2}-\d{2}$/u)
        expect([
          'blue',
          'coral',
          'teal',
          'ink',
          'yes',
          'partly',
          'no',
          'na'
        ]).not.toContain(text)
      }
      const translated = translateData(
        data,
        new Map(strings.map(([at, text]) => [at, `«${text}»`]))
      )
      expect(dataTranslationProblems(data, translated)).toEqual([])
      expect(paths.length).toBeGreaterThan(5)
    }
    const landscape = dataStrings(readData('ai-opinion-landscape.json')).map(
      ([at]) => at
    )
    expect(landscape).toContain('.points[0].method')
    expect(landscape).toContain('.points[0].reach')
    expect(landscape).toContain('.x.start')
    expect(landscape).toContain('.hint')
    expect(landscape).not.toContain('.points[0].key')
    const estimates = dataStrings(readData('ai-extinction-estimates.json')).map(
      ([at]) => at
    )
    expect(estimates).toContain('.rows[0].wording')
    expect(estimates).toContain('.rows[0].figure')
  })
})

describe('the AI polls post', () => {
  it('links the P(doom) hub, the interview and the about page', () => {
    const source = readFileSync(
      path.join(blogDirectory, 'why-polls-on-ai-disagree.mdx'),
      'utf8'
    )
    for (const link of ['](/p-doom)', '](/)', '](/about)'])
      expect(source).toContain(link)
  })
})
