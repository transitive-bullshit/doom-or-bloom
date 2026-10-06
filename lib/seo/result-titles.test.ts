import { describe, expect, test } from 'vitest'
import { locales } from '@/i18n/config'
import { testTranslator } from '@/i18n/test-translator'
import { loadBundle } from '@/lib/content/loader'
import { createAssessment } from '@/lib/assessment/state'
import { baseResult, emptyComponent } from '@/lib/assessment/projections'
import {
  buildWorldviewExperiment,
  experimentCandidates
} from '@/lib/assessment/worldview-experiment'
import type { PersonaComparison } from '@/lib/assessment/persona-matches'
import { worldviewIds, type Result } from '@/lib/assessment/schema'
import { siteTitle } from '@/lib/site'
import {
  changeReadings,
  mapReadings,
  outlookReadings,
  renderResultTitle,
  resultDescription,
  resultTitle
} from './result-titles'
import { googleTitleLimit, googleTitleWidth } from './title-width'

const en = testTranslator('en')

function saved({
  outlook,
  change,
  unsettled = false,
  pdoom = null
}: {
  outlook: number | null
  change: number | null
  unsettled?: boolean
  pdoom?: NonNullable<Result['experiment']>['pdoom']
}): Result {
  const state = createAssessment('published')
  const result = baseResult(state, [], loadBundle().rubric)
  const input = { completeParticipantEvidence: [], activeSupport: [] }
  result.experiment = buildWorldviewExperiment(
    input,
    experimentCandidates(input),
    {},
    state.evidenceRevision,
    'fixture-v1'
  )
  result.horizontal = {
    ...result.horizontal,
    value: outlook,
    range: [outlook ?? 0, outlook ?? 1]
  }
  result.experiment.transformation = {
    ...emptyComponent('transformation', 'Scale of transformation'),
    value: change,
    range: [change ?? 0, change ?? 1],
    ...(unsettled && { interpretation: 'unsettled' as const })
  }
  result.experiment.pdoom = pdoom
  // Every worldview dimension, so closest thought leaders can be compared.
  result.components = worldviewIds.map((id) => ({
    ...emptyComponent(id, id),
    value: 0.7
  }))
  return result
}

const persona = (name: string, value: number): PersonaComparison => ({
  id: name,
  slug: name.toLowerCase().replace(/\W+/g, ''),
  name,
  avatar: '/personas/test.jpg',
  values: Object.fromEntries(worldviewIds.map((id) => [id, value])),
  map: { x: value, y: value }
})
const personas = [
  persona('Ada Lovelace', 0.7),
  persona('Alan Turing', 0.72),
  persona('Grace Hopper', 0.65),
  persona('Far Away', 0)
]

describe('anonymous result titles', () => {
  test('name the map position’s level readings, never a person or P(doom)', () => {
    expect(
      resultTitle(en, saved({ outlook: 0.8125, change: 0.75 }), null)
    ).toBe('Hopeful about AI, expects sweeping change')
    expect(resultTitle(en, saved({ outlook: 0.1, change: 0.95 }))).toBe(
      'Very worried about AI, expects profound change'
    )
    expect(resultTitle(en, saved({ outlook: 0.5, change: 0.25 }))).toBe(
      'Mixed on AI, expects modest change'
    )
    // An unsettled scale is the center of an open range, not a moderate view.
    expect(
      resultTitle(en, saved({ outlook: 1, change: 0.5, unsettled: true }))
    ).toBe('Very hopeful about AI, unsure how much changes')
    // Without a placed scale, the outlook alone; without an outlook, the
    // shared title.
    expect(resultTitle(en, saved({ outlook: 0.3, change: null }))).toBe(
      'Worried about AI'
    )
    expect(resultTitle(en, saved({ outlook: null, change: 0.5 }))).toBe(
      'A shared AI worldview'
    )
  })

  test('a stale experiment leaves the scale out, as on the map', () => {
    const stale = saved({ outlook: 0.75, change: 1 })
    stale.experiment!.evidenceRevision = stale.evidenceRevision - 1
    expect(mapReadings(stale)).toEqual({ outlook: 'hopeful', change: null })
  })

  test('a name keeps the named title', () => {
    expect(
      resultTitle(en, saved({ outlook: 0.75, change: 1 }), 'Jo Smith')
    ).toBe('Jo Smith’s AI worldview')
  })

  test('every English title fits Google’s desktop title with the brand', () => {
    const titles = outlookReadings.flatMap((outlook) => [
      renderResultTitle(en, { outlook, change: null }),
      ...[...changeReadings, 'unsettled' as const].map((change) =>
        renderResultTitle(en, { outlook, change })
      )
    ])
    expect(new Set(titles).size).toBe(titles.length)
    expect(
      titles.filter(
        (title) => googleTitleWidth(siteTitle(title)) > googleTitleLimit
      )
    ).toEqual([])
  })

  test('every language renders every title', () => {
    for (const locale of locales) {
      const t = testTranslator(locale)
      for (const outlook of outlookReadings)
        for (const change of [...changeReadings, 'unsettled' as const])
          expect(renderResultTitle(t, { outlook, change })).not.toMatch(
            /[{}]|Profiles\./
          )
    }
  })
})

describe('result descriptions', () => {
  const inferred = {
    source: 'inferred' as const,
    basis: 'direct' as const,
    token: '≈7%',
    estimate: 0.07,
    bounds: [0.04, 0.12] as [number, number]
  }

  test('give a rough inferred P(doom) and the closest simulated thought leaders', () => {
    expect(
      resultDescription(
        en,
        'en',
        saved({ outlook: 0.7, change: 0.7, pdoom: inferred }),
        personas
      )
    ).toBe(
      'A participant’s AI worldview with a rough P(doom) of ≈7%, closest to the simulated worldviews of Ada Lovelace, Alan Turing and Grace Hopper.'
    )
  })

  test('call a stated number stated, and leave out an unclear one', () => {
    const stated = saved({
      outlook: 0.7,
      change: 0.7,
      pdoom: { source: 'stated', token: 'under 5%', bounds: [0, 0.05] }
    })
    expect(resultDescription(en, 'en', stated, [], 'Jo Smith')).toBe(
      'Jo Smith’s AI worldview with a stated P(doom) of under 5%. See where it lands between doom and bloom, and the answers behind it.'
    )
    const unclear = saved({
      outlook: 0.7,
      change: 0.7,
      pdoom: { ...inferred, bounds: [0.01, 0.9], estimate: 0.3 }
    })
    expect(resultDescription(en, 'en', unclear, personas)).toBe(
      'A participant’s AI worldview, closest to the simulated worldviews of Ada Lovelace, Alan Turing and Grace Hopper. See where it lands between doom and bloom.'
    )
    expect(
      resultDescription(en, 'en', saved({ outlook: 0.5, change: 0.5 }), [])
    ).toBe(
      'A participant’s AI worldview, mapped between doom and bloom, with the answers behind it.'
    )
  })

  test('leave out the P(doom) of an outdated experiment, as the page does', () => {
    const stale = saved({ outlook: 0.7, change: 0.7, pdoom: inferred })
    stale.experiment!.evidenceRevision = stale.evidenceRevision - 1
    expect(resultDescription(en, 'en', stale, personas)).not.toContain(
      'P(doom)'
    )
  })

  test('render in every language', () => {
    for (const locale of locales)
      expect(
        resultDescription(
          testTranslator(locale),
          locale,
          saved({ outlook: 0.7, change: 0.7, pdoom: inferred }),
          personas
        )
      ).toContain('Ada Lovelace')
  })
})
