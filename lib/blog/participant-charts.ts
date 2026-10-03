import { z } from 'zod'
import { blogDataSchema, minimumGroupSize, type BlogData } from './schema'

// The data posts' charts, built from committed aggregates: participant
// numbers from `pnpm blog:data` (content/blog/aggregates/participants.json)
// and launch-week site traffic (referrers.json). Rebuilding a chart from the
// same aggregates gives the same file, which lib/blog/blog.test.ts checks.
// See docs/BLOG.md#participant-data.

const count = z.int().nonnegative()
// Aggregates are committed publicly, so no group under the minimum may appear
// with its size: neither a count nor a denominator.
const atLeastMinimum = (value: number | null) =>
  value === null || value >= minimumGroupSize
const shareStat = z
  .object({
    n: count.nullable(),
    count: count.nullable(),
    share: z.number().nullable(),
    ci95: z.tuple([z.number().nullable(), z.number().nullable()])
  })
  .refine(
    (stat) => atLeastMinimum(stat.n) && atLeastMinimum(stat.count),
    `A share's group sizes must be null or at least ${minimumGroupSize}`
  )
const medianStat = z.object({
  n: count.nullable(),
  median: z.number().nullable(),
  median_ci95: z.tuple([z.number(), z.number()]).nullable()
})
const iqrStat = z.object({
  n: count.nullable(),
  median: z.number().nullable(),
  iqr: z.tuple([z.number(), z.number()]).nullable()
})
const bin = shareStat.extend({ bin: z.string() })
const outlookBands = [
  'catastrophe',
  'mainly harm',
  'mixed',
  'leans hopeful',
  'enthusiastic'
] as const
const wave = z.object({
  peopleWithResult: count,
  outlook: medianStat.extend({
    byOutlookBand: z.record(z.enum(outlookBands), shareStat)
  })
})
const fisher = z.object({ hn: shareStat, x: shareStat, fisherP: z.number() })
const engineGroup = z.object({ outlook: medianStat, scale: medianStat })

export const participantAggregatesSchema = z.object({
  asOf: z.iso.date(),
  waves: z.object({
    hn: wave,
    x: wave,
    tests: z.object({
      catastropheBand: fisher,
      mainlyHarmBand: fisher,
      enthusiasticBand: fisher,
      pdoomShownAtLeast10: fisher,
      pdoomShownAtLeast30: fisher
    }),
    engineVersion: z.object({
      hnWave_oldInterview: engineGroup,
      xWave_oldInterview: engineGroup,
      xWave_newInterview: engineGroup
    })
  }),
  map: z.object({
    n: count,
    grid: z.object({
      cells: z.array(
        z.object({
          x0: z.number(),
          x1: z.number(),
          y0: z.number(),
          y1: z.number(),
          count: count.nullable(),
          share: z.number().nullable()
        })
      )
    }),
    catalogCoverage: z.object({ featuredThoughtLeaders: count }),
    groups: z.object({
      participantsInClustering: count,
      simulatedInClustering: count,
      groups: z.array(
        shareStat.extend({
          label: z.string(),
          simulated: count,
          simulatedShare: z.number()
        })
      )
    })
  }),
  pdoom: z.object({
    typed: z.object({ n: count, bins: z.array(bin) }),
    inferred: z.object({ n: count, bins: z.array(bin) }),
    bySide: z.array(
      z.object({ side: z.string(), typed: iqrStat, inferred: iqrStat })
    )
  }),
  resonance: z.object({
    n: count,
    gapBuckets: z.record(z.string(), shareStat),
    feelsRight: z.object({ yes: shareStat })
  }),
  closest: z.object({
    n: count,
    top: z.array(shareStat.extend({ name: z.string(), slug: z.string() }))
  })
})
export type ParticipantAggregates = z.infer<typeof participantAggregatesSchema>

export const referrersSchema = z.object({
  byDay: z.array(
    z.object({ day: z.iso.date(), hackerNewsFamily: count, x: count })
  )
})

const prefix = 'launch-week-'
const participantSource = (aggregates: ParticipantAggregates) => ({
  asOf: aggregates.asOf,
  provenance: 'participants' as const
})
const bar = (stat: z.infer<typeof shareStat>, withInterval = false) =>
  stat.share === null || stat.count === null
    ? { share: null }
    : {
        share: stat.share,
        count: stat.count,
        ...(withInterval &&
          stat.ci95[0] !== null &&
          stat.ci95[1] !== null && { ci: [stat.ci95[0], stat.ci95[1]] })
      }
const median = (stat: z.infer<typeof medianStat>) =>
  stat.median === null || stat.n === null
    ? { value: null }
    : {
        value: stat.median,
        ...(stat.median_ci95 && {
          low: stat.median_ci95[0],
          high: stat.median_ci95[1]
        }),
        n: stat.n
      }
const middleHalf = (stat: z.infer<typeof iqrStat>) =>
  stat.median === null || stat.n === null
    ? { value: null }
    : {
        value: stat.median,
        ...(stat.iqr && { low: stat.iqr[0], high: stat.iqr[1] }),
        n: stat.n
      }
const pValue = (p: number) => (p < 0.001 ? 'p < 0.001' : `p = ${p.toFixed(2)}`)
const waveSeries = [
  { key: 'hn', label: 'Hacker News wave, Sep 25–26', tone: 'coral' },
  { key: 'x', label: 'X wave, Sep 27–28', tone: 'blue' }
] as const
const outlookLabels: Record<(typeof outlookBands)[number], string> = {
  catastrophe: 'Expects catastrophe',
  'mainly harm': 'Mainly expects harm',
  mixed: 'Mixed or undecided',
  'leans hopeful': 'Leans hopeful',
  enthusiastic: 'Enthusiastic'
}
const sideLabels = [
  'Doom side (below 0.4)',
  'Middle (0.4–0.6)',
  'Bloom side (above 0.6)'
]
const shortDay = (day: string) =>
  new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(day))

/** The published launch-week chart files, keyed by file name in content/blog/data. */
export function participantCharts(
  aggregates: ParticipantAggregates,
  referrers: z.infer<typeof referrersSchema>
): Record<string, BlogData> {
  const { waves, map, pdoom, resonance, closest } = aggregates
  const engine = waves.engineVersion
  const charts: Record<string, unknown> = {
    'outlook-by-wave': {
      kind: 'bars',
      title: 'Each wave by outlook level',
      source: `One result per person who finished: ${waves.hn.outlook.n} people in the Hacker News wave and ${waves.x.outlook.n} in the X wave.`,
      ...participantSource(aggregates),
      series: waveSeries,
      rows: outlookBands.map((band) => ({
        label: outlookLabels[band],
        values: {
          hn: bar(waves.hn.outlook.byOutlookBand[band]),
          x: bar(waves.x.outlook.byOutlookBand[band])
        }
      }))
    },
    'doomer-vs-mood': {
      kind: 'bars',
      title: 'Same share of doomers, different moods',
      source:
        'Lines show 95% intervals. p-values are from Fisher’s exact test. One result per person.',
      ...participantSource(aggregates),
      series: waveSeries,
      rows: (
        [
          [
            'catastropheBand',
            'Doomer measures',
            'Outlook reads “expects catastrophe”'
          ],
          [
            'pdoomShownAtLeast10',
            'Doomer measures',
            'Shown P(doom) of 10% or more'
          ],
          [
            'pdoomShownAtLeast30',
            'Doomer measures',
            'Shown P(doom) of 30% or more'
          ],
          ['mainlyHarmBand', 'Mood', 'Outlook reads “mainly expects harm”'],
          ['enthusiasticBand', 'Mood', 'Outlook reads “enthusiastic”']
        ] as const
      ).map(([key, group, label]) => ({
        label,
        group,
        note: pValue(waves.tests[key].fisherP),
        values: {
          hn: bar(waves.tests[key].hn, true),
          x: bar(waves.tests[key].x, true)
        }
      }))
    },
    'referrers-by-day': {
      kind: 'bars',
      title: 'Referred visitors per day, Hacker News vs X',
      source:
        'Site visitors referred by Hacker News or X (t.co and x.com), from Vercel Web Analytics. These are visitors, not participants.',
      asOf: '2026-10-01',
      provenance: 'site-traffic',
      stacked: true,
      series: waveSeries.map(({ key, tone }) => ({
        key,
        tone,
        label: key === 'hn' ? 'Hacker News' : 'X'
      })),
      rows: referrers.byDay
        .filter(({ day }) => day <= '2026-09-28')
        .map(({ day, hackerNewsFamily, x }) => ({
          label: shortDay(day),
          values: {
            hn: {
              share: round(hackerNewsFamily / (hackerNewsFamily + x)),
              count: hackerNewsFamily
            },
            x: { share: round(x / (hackerNewsFamily + x)), count: x }
          }
        }))
    },
    'old-vs-new-questions': {
      kind: 'intervals',
      title: 'Old and new questions, by wave',
      source:
        'Interviews started before the Sep 27 release asked the old questions. One result per person.',
      ...participantSource(aggregates),
      interval: '95% interval',
      scale: { min: 0, max: 1, ticks: [0, 0.25, 0.5, 0.75, 1] },
      series: waveSeries,
      rows: (
        [
          ['outlook', 'Median outlook, from Doom (0) to Bloom (1)'],
          [
            'scale',
            'Median scale of change, from incremental (0) to civilizational (1)'
          ]
        ] as const
      ).flatMap(([axis, group]) => [
        {
          label: 'Hacker News wave, old questions',
          group,
          values: { hn: median(engine.hnWave_oldInterview[axis]) }
        },
        {
          label: 'X wave, old questions',
          group,
          values: { x: median(engine.xWave_oldInterview[axis]) }
        },
        {
          label: 'X wave, new questions',
          group,
          values: { x: median(engine.xWave_newInterview[axis]) }
        }
      ])
    },
    'pdoom-typed-vs-inferred': {
      kind: 'bars',
      title: 'Typed and inferred P(doom), share per range',
      source: `${pdoom.typed.n} people typed a number and ${pdoom.inferred.n} got an inferred one. A typed range counts as its midpoint.`,
      ...participantSource(aggregates),
      series: [
        { key: 'typed', label: 'Typed their own number', tone: 'blue' },
        { key: 'inferred', label: 'Inferred by the model', tone: 'coral' }
      ],
      rows: pdoom.typed.bins.map((typed, index) => ({
        label: typed.bin,
        values: {
          typed: bar(typed),
          inferred: bar(pdoom.inferred.bins[index]!)
        }
      }))
    },
    'pdoom-by-map-side': {
      kind: 'intervals',
      title: 'P(doom) by side of the map',
      source:
        'Medians with the middle half of each group, on a log scale. A typed number is part of the answers the map reads, so the typed rows are partly circular.',
      ...participantSource(aggregates),
      interval: 'Middle half',
      scale: {
        min: 0.005,
        max: 1,
        log: true,
        percent: true,
        ticks: [0.01, 0.1, 1]
      },
      series: [
        { key: 'typed', label: 'Typed', tone: 'blue' },
        { key: 'inferred', label: 'Inferred', tone: 'coral' }
      ],
      rows: pdoom.bySide.map((side, index) => ({
        label: sideLabels[index],
        values: {
          typed: middleHalf(side.typed),
          inferred: middleHalf(side.inferred)
        }
      }))
    },
    'population-map': {
      kind: 'map',
      title: 'Where participants landed',
      source: `One result per person (${map.n} people), in a 5 × 5 grid. Hatched cells hold fewer than 10 people.`,
      ...participantSource(aggregates),
      cellsLabel: 'Share of participants',
      cells: map.grid.cells.map((cell) => ({
        outlook: [cell.x0, cell.x1],
        transformation: [cell.y0, cell.y1],
        ...(cell.share === null || cell.count === null
          ? { share: null }
          : { share: cell.share, count: cell.count })
      }))
    },
    'closest-thought-leaders': {
      kind: 'bars',
      title: 'Most common closest thought leader',
      source: `${closest.n} people with a match, against the ${map.catalogCoverage.featuredThoughtLeaders} featured simulated thought leaders.`,
      ...participantSource(aggregates),
      series: [{ key: 'people', label: 'Share of participants', tone: 'blue' }],
      rows: closest.top.map((person) => ({
        label: person.name,
        values: { people: bar(person) }
      }))
    },
    'groups-vs-catalog': {
      kind: 'bars',
      title: 'Participants and simulated thought leaders, by group',
      source: `Five groups by outlook, scale and P(doom), found among ${map.groups.participantsInClustering} participants. Each of the ${map.groups.simulatedInClustering} simulated thought leaders with a P(doom) joins its nearest group.`,
      asOf: aggregates.asOf,
      provenance: ['participants', 'simulated-users'],
      series: [
        {
          key: 'people',
          label: 'Participants',
          tone: 'blue',
          provenance: 'participants'
        },
        {
          key: 'simulated',
          label: 'Simulated thought leaders',
          tone: 'coral',
          provenance: 'simulated-users'
        }
      ],
      rows: map.groups.groups.map((group) => ({
        label: group.label,
        values: {
          people: bar(group),
          simulated: { share: group.simulatedShare, count: group.simulated }
        }
      }))
    },
    'guess-vs-result': {
      kind: 'bars',
      title: 'How results compare with people’s own sense',
      source: `${resonance.n} people guessed their position before the reveal, and ${resonance.feelsRight.yes.n} answered “Does this feel right?”. Both exist since Sep 27. The line shows a 95% interval.`,
      ...participantSource(aggregates),
      series: [{ key: 'people', label: 'Share of participants', tone: 'blue' }],
      rows: [
        ...(
          [
            ['close (≤0.10)', 'Close (0.10 or less)'],
            ['moderate (0.10–0.25)', 'Moderate (0.10–0.25)'],
            ['far (>0.25)', 'Far (over 0.25)']
          ] as const
        ).map(([key, label]) => ({
          label,
          group: 'Distance between guess and result',
          values: { people: bar(resonance.gapBuckets[key]!) }
        })),
        {
          label: 'Yes',
          group: 'Does this feel right?',
          values: { people: bar(resonance.feelsRight.yes, true) }
        }
      ]
    }
  }
  return Object.fromEntries(
    Object.entries(charts)
      .filter(([name]) => publishedCharts.has(name))
      .map(([name, chart]) => [
        `${prefix}${name}.json`,
        blogDataSchema.parse(chart)
      ])
  )
}

// Charts of published posts. The other builders back draft posts kept outside
// the repo until there is more data; add a chart here when its post ships.
const publishedCharts = new Set([
  'outlook-by-wave',
  'doomer-vs-mood',
  'referrers-by-day',
  'old-vs-new-questions'
])

const round = (value: number) => Math.round(value * 1000) / 1000
