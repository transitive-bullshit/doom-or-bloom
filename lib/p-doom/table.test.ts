import { expect, test } from 'vitest'
import { englishTranslator } from '@/i18n/translators'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment } from '@/lib/assessment/state'
import { baseResult } from '@/lib/assessment/projections'
import {
  buildWorldviewExperiment,
  experimentCandidates
} from '@/lib/assessment/worldview-experiment'
import { applyPublicPdoom } from '@/lib/journeys/public-pdoom'
import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import type { Result } from '@/lib/assessment/schema'
import { pdoomRows, sortPdoomRows, type PdoomRow } from './table'

type Pdoom = NonNullable<NonNullable<Result['experiment']>['pdoom']>

function result(pdoom: Pdoom | null): Result {
  const state = createAssessment('hub')
  const saved = baseResult(state, [], loadBundle().rubric)
  const input = { completeParticipantEvidence: [], activeSupport: [] }
  saved.experiment = buildWorldviewExperiment(
    input,
    experimentCandidates(input),
    {},
    state.evidenceRevision,
    'fixture-v1'
  )
  saved.experiment.pdoom = pdoom
  return saved
}
const person = (slug: string, saved: Result | null) => ({
  slug,
  name: slug,
  avatar: `/personas/${slug}.jpg`,
  result: saved!
})
const inferred: Pdoom = {
  source: 'inferred',
  token: '≈8%',
  estimate: 0.08,
  bounds: [0.03, 0.2]
}

test('rows show a stated number only with its public source, beside the simulated one', () => {
  const statement = publicPdoomStatements['concerned-pioneer']!
  const rows = pdoomRows(englishTranslator(), 'en', [
    person('hinton', applyPublicPdoom(result(inferred), statement)),
    person('simulated', result(inferred)),
    person(
      'stated-in-simulation',
      result({ source: 'stated', token: 'around 30 percent' })
    ),
    person('none', result(null))
  ])
  expect(rows[0]).toEqual({
    slug: 'hinton',
    name: 'hinton',
    avatar: '/personas/hinton.jpg',
    stated: {
      token: '10–20%',
      value: expect.closeTo(0.15),
      outcome: statement.outcome,
      source: {
        title: statement.title,
        url: statement.url,
        date: 'Jan 2025',
        dateTime: statement.publishedAt
      }
    },
    simulated: { token: '≈8%', value: 0.08, range: 'Plausible range 3–20%' }
  })
  expect(rows[1]!.stated).toBeNull()
  expect(rows[1]!.simulated?.token).toBe('≈8%')
  // A number the simulation gave keeps its words and has no inferred range.
  expect(rows[2]!.simulated).toEqual({
    token: 'around 30 percent',
    value: 0.3,
    range: null
  })
  expect(rows[3]).toMatchObject({ stated: null, simulated: null })
})

test('a stale experiment shows no P(doom), as on the profile', () => {
  const stale = result(inferred)
  stale.evidenceRevision += 1
  expect(
    pdoomRows(englishTranslator(), 'en', [person('stale', stale)])[0]
  ).toMatchObject({ stated: null, simulated: null })
})

test('sorting keeps missing and unclear numbers last in either direction', () => {
  const row = (
    name: string,
    simulated: number | null,
    stated?: number
  ): PdoomRow => ({
    slug: name,
    name,
    avatar: '',
    stated:
      stated === undefined
        ? null
        : {
            token: `${stated}`,
            value: stated,
            outcome: '',
            source: { title: '', url: '', date: '', dateTime: '' }
          },
    simulated: { token: `${simulated}`, value: simulated, range: null }
  })
  const rows = [
    row('b', 0.2),
    row('a', null, 0.5),
    row('c', 0.6),
    row('d', 0.2, 0.1)
  ]
  const names = (sorted: PdoomRow[]) => sorted.map((entry) => entry.name)
  expect(
    names(sortPdoomRows(rows, { key: 'simulated', direction: 'desc' }))
  ).toEqual(['c', 'b', 'd', 'a'])
  expect(
    names(sortPdoomRows(rows, { key: 'simulated', direction: 'asc' }))
  ).toEqual(['b', 'd', 'c', 'a'])
  expect(
    names(sortPdoomRows(rows, { key: 'stated', direction: 'desc' }))
  ).toEqual(['a', 'd', 'b', 'c'])
  expect(
    names(sortPdoomRows(rows, { key: 'name', direction: 'desc' }))
  ).toEqual(['d', 'c', 'b', 'a'])
})
