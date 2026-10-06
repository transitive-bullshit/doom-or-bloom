import { languageTag, type Locale } from '@/i18n/config'
import type { Translator } from '@/i18n/translator'
import {
  closestPersonas,
  type PersonaComparison
} from '@/lib/assessment/persona-matches'
import {
  pdoomTokenLabel,
  presentResult,
  unclearToken
} from '@/lib/assessment/present-result'
import type { Result } from '@/lib/assessment/schema'
import { resultPoint } from '@/lib/assessment/self-placement'

// Published participant results (docs/SEO.md#published-results). A result
// published with a name is "<Name>’s AI worldview"; an anonymous one is titled
// by where its point sits on the map, "Hopeful about AI, expects sweeping
// change", so hundreds of pages don't share one title. Titles never name a
// thought leader, whose own profile would compete with them, and never lead
// with P(doom). Descriptions add the P(doom) and closest thought leaders the
// page shows.

/** The five outlook levels, Doom to Bloom. */
export const outlookReadings = [
  'veryWorried',
  'worried',
  'mixed',
  'hopeful',
  'veryHopeful'
] as const
/** The five scale-of-transformation levels, incremental to civilizational. */
export const changeReadings = [
  'little',
  'modest',
  'substantial',
  'sweeping',
  'profound'
] as const
export type OutlookReading = (typeof outlookReadings)[number]
export type ChangeReading = (typeof changeReadings)[number] | 'unsettled'

// The map places a point within half a level of its level reading
// (lib/assessment/map-ladder.ts), so the nearest level is that reading.
const level = (value: number) => Math.min(4, Math.max(0, Math.round(value * 4)))

/**
 * The level readings of a result's displayed map point. The scale of change
 * is unsettled when the point marks the center of an open range, and null
 * when unplaced or from a stale experiment, as on the map.
 */
export function mapReadings(saved: Result): {
  outlook: OutlookReading | null
  change: ChangeReading | null
} {
  const result = presentResult(saved)
  const { x, y } = resultPoint(result)
  return {
    outlook: x === null ? null : outlookReadings[level(x)]!,
    change:
      y === null
        ? null
        : result.experiment?.transformation.interpretation === 'unsettled'
          ? 'unsettled'
          : changeReadings[level(y)]!
  }
}

/** A title for these readings, without the site name. */
export function renderResultTitle(
  t: Translator,
  { outlook, change }: ReturnType<typeof mapReadings>
) {
  if (!outlook) return t('Profiles.sharedTitle')
  const phrase = t(`Profiles.resultTitle.outlook.${outlook}`)
  return change
    ? t('Profiles.resultTitle.full', {
        outlook: phrase,
        change: t(`Profiles.resultTitle.change.${change}`)
      })
    : phrase
}

/** A published participant result's page title, without the site name. */
export function resultTitle(
  t: Translator,
  saved: Result,
  name?: string | null
) {
  return name
    ? t('Profiles.publicTitle', { name })
    : renderResultTitle(t, mapReadings(saved))
}

/**
 * One or two sentences from what the page shows: its P(doom), called rough
 * when inferred, and its closest simulated thought leaders.
 */
export function resultDescription(
  t: Translator,
  locale: Locale,
  saved: Result,
  personas: PersonaComparison[],
  name?: string | null
) {
  const result = presentResult(saved)
  const pdoom = result.experiment?.pdoom
  const source = pdoom
    ? (pdoom.source ?? (pdoom.adjustment ? 'inferred' : 'stated'))
    : null
  // An unclear inference has no single number to quote.
  const token =
    pdoom?.token && pdoom.token !== unclearToken
      ? pdoomTokenLabel(t, pdoom.token)
      : null
  const names = closestPersonas(result, personas).map(({ name }) => name)
  const estimate = token ? (source === 'inferred' ? 'rough' : 'stated') : ''
  const kind = `${estimate}${names.length ? (estimate ? 'Closest' : 'closest') : ''}`
  return t('Profiles.resultDescription', {
    kind: kind || 'other',
    worldview: name
      ? t('Profiles.publicTitle', { name })
      : t('Profiles.resultSubject'),
    pdoom: token ?? '',
    // British English lists without the serial comma.
    names: new Intl.ListFormat(
      locale === 'en' ? 'en-GB' : languageTag(locale),
      { type: 'conjunction' }
    ).format(names)
  })
}
