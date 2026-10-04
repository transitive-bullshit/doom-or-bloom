import participants from '@/content/blog/aggregates/participants.json'
import { versions } from '@/lib/assessment/schema'
import { footnoteRegistry, type HubSource } from '@/lib/p-doom/citations'
import type { HubFootnote } from '@/lib/p-doom/hub'

// The About page's methodology section: what it cites and the numbers it
// shows. Numbers from the participant aggregates follow that file; the rest
// are dated research results and change only with a new study.

export const repositoryUrl =
  'https://github.com/transitive-bullshit/doom-or-bloom'

/** A file or heading on the main branch, so links follow the current code. */
const onMain = (path: string) => `${repositoryUrl}/blob/main/${path}`

const code = 'Doom or Bloom on GitHub'
const notes = 'Doom or Bloom research notes'

/**
 * Every source the section cites, in order of first citation in the English
 * text; that order numbers the footnotes in every language. A message cites a
 * source with an empty tag named after its key, such as `<rubric></rubric>`.
 */
export const methodologySources = {
  routing: {
    title: 'How the next question is chosen (lib/assessment/routing.ts)',
    url: onMain('lib/assessment/routing.ts'),
    by: code,
    year: 2026
  },
  questions: {
    title: `The authored questions, content release ${versions.content}`,
    url: onMain(`content/releases/${versions.content}/prompts.json`),
    by: code,
    year: 2026
  },
  rubric: {
    title: `The rubric Jev judges answers against, version ${versions.rubric}`,
    url: onMain(`content/rubrics/${versions.rubric}/rubric.json`),
    by: code,
    year: 2026
  },
  boundary: {
    title: 'What Jev judges and what code decides',
    url: onMain('docs/TYPESAFE.md#role-and-boundaries'),
    by: code,
    year: 2026
  },
  outputs: {
    title: 'Where each part of a result comes from, with links to its code',
    url: onMain('docs/ASSESSMENT.md#where-each-output-comes-from'),
    by: code,
    year: 2026
  },
  briefs: {
    title:
      'Example source briefs for simulated thought leaders, including Elon Musk',
    url: onMain('lib/journeys/frontier-public-personas.ts'),
    by: code,
    year: 2026
  },
  simulations: {
    title: 'How simulated thought leaders are made',
    url: onMain('docs/user-journeys.md#purpose-and-authoring'),
    by: code,
    year: 2026
  },
  pew: {
    title: 'Can AI Stand In for Human Survey-Takers? Not Really',
    url: 'https://www.pewresearch.org/data-labs/2026/09/30/can-ai-stand-in-for-human-survey-takers-not-really/',
    by: 'Pew Research Center',
    year: 2026
  },
  review: {
    title: 'Engine design review, September 29, 2026',
    url: onMain('docs/research/engine-design-review-2026-09-29.md'),
    by: notes,
    year: 2026
  },
  aggregates: {
    title: `Participant aggregates as of ${participants.asOf} (participants.json)`,
    url: onMain('content/blog/aggregates/participants.json'),
    by: code,
    year: Number(participants.asOf.slice(0, 4))
  },
  protocol: {
    title: 'Evaluation protocol and its tolerances',
    url: onMain('docs/evaluation-protocol.md'),
    by: code,
    year: 2026
  },
  confirmation: {
    title:
      'AI-Assisted Conversational Interviewing: Effects on Data Quality and Respondent Experience',
    url: 'https://arxiv.org/abs/2504.13908',
    by: 'Barari et al., NORC at the University of Chicago',
    year: 2025
  },
  aapor: {
    title: 'Responsible AI Integration in Survey Research',
    url: 'https://aapor.org/wp-content/uploads/2026/05/Responsible-AI-Integration-In-Survey-Research.pdf',
    by: 'AAPOR Task Force on Responsible AI Integration in Survey Research',
    year: 2026
  },
  banding: {
    title: 'Why the map showed five columns, October 3, 2026',
    url: onMain('docs/research/distribution-banding-2026-10-03.md'),
    by: notes,
    year: 2026
  },
  audit: {
    title: 'Interview and modeling audit, September 27, 2026',
    url: onMain('docs/research/interview-modeling-audit-2026-09-27.md'),
    by: notes,
    year: 2026
  }
} as const satisfies Record<string, HubSource>

export type MethodologySource = keyof typeof methodologySources

/** Sources outside this repository, for `pnpm resources:previews` favicons. */
export const methodologySourceUrls = () =>
  Object.values(methodologySources)
    .map(({ url }) => url)
    .filter((url) => !url.startsWith(repositoryUrl))

/**
 * Each source's footnote number, and the numbered footnotes. Markers carry no
 * anchor id: a source cited twice would repeat it, and nothing links back.
 */
export function methodologyCitations() {
  const { cite, footnotes } = footnoteRegistry()
  const numbers = Object.fromEntries(
    Object.entries(methodologySources).map(([key, source]) => [
      key,
      cite(source).number
    ])
  ) as Record<MethodologySource, number>
  return {
    numbers,
    footnotes: footnotes.map((footnote): HubFootnote => ({
      ...footnote,
      byline: [{ text: footnote.by }]
    }))
  }
}

/**
 * Mean distance between two readings of the Doom–Bloom outlook on its 0–1
 * axis, from the September 29 engine design review. `readers` compares two
 * readings of the same answers; `selfPlacement` compares a reading with where
 * 219 people placed themselves before seeing their result.
 */
export const outlookAgreement = {
  readers: { repeat: 0.007, reworded: 0.019, largerModel: 0.06 },
  selfPlacement: { jev: 0.141, largerModel: 0.135, sameGuess: 0.233 }
} as const

/** When the September 29 review read its data. */
export const reviewDate = '2026-09-29'

/** Also from the September 29 review. */
export const reviewFindings = {
  /** gpt-5.6-sol against Jev per 1,000 readings: $13.89 and $0.66. */
  costRatio: 21,
  /** Inferred P(doom) against numbers people typed, with those hidden. */
  pdoom: {
    typed: 113,
    /** Jev gave a reading for 96 of them; the 2× rate is out of those. */
    readings: 96,
    within2x: 0.22,
    constantGuess: 0.125
  }
} as const

/** The evaluation protocol's limit for two answers that mean the same. */
export const sameMeaningLimit = 0.1
/** Displayed map ranges are never narrower than this around the point. */
export const minimumRange = 0.05

const { waves, resonance, volume } = participants

/** Who has taken the interview, from the committed participant aggregates. */
export const sample = {
  asOf: participants.asOf,
  people: volume.funnel.peopleWithResult,
  hackerNewsOutlook: waves.hn.outlook.median,
  xOutlook: waves.x.outlook.median,
  /** The waves are UTC days, inferred from timing (see the aggregates). */
  hackerNewsDates: ['2026-09-25', '2026-09-26'],
  xDates: ['2026-09-27', '2026-09-28'],
  feelsRight: resonance.feelsRight.yes
}

/**
 * Releases that changed what people see, newest first. Each has a message
 * under `About.methodology.changes`; add one when a release changes results.
 */
export const methodologyChanges = [
  { id: 'between', date: '2026-10-04', version: '0.7.5', cite: 'banding' },
  { id: 'languages', date: '2026-10-01', version: '0.7.4' },
  {
    id: 'typed',
    date: '2026-09-29',
    version: '0.7.2–0.7.3',
    cite: 'review'
  },
  { id: 'direct', date: '2026-09-27', version: '0.7.0–0.7.1', cite: 'audit' }
] as const satisfies readonly {
  id: string
  date: string
  version: string
  cite?: MethodologySource
}[]
