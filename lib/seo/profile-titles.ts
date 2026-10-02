import { z } from 'zod'
import { languageTag, type Locale } from '@/i18n/config'
import type { Translator } from '@/i18n/translator'
import { englishTranslator } from '@/i18n/translators'
import { siteTitle } from '@/lib/site'
import { googleTitleLimit, googleTitleWidth } from './title-width'
import study from './profile-title-topics.json'

// Simulated-user page titles (docs/SEO.md#profile-titles). In order:
//   1. the AI topics people search with the person's name, when the keyword
//      study found strong evidence: "Geoffrey Hinton on AI safety, risk and
//      P(doom)";
//   2. otherwise where the person lands on the Doom–Bloom map: "Joscha Bach
//      on AI’s risks and benefits";
//   3. otherwise, for an unplaced profile, "<Name> on AI".
// Every choice must fit Google's desktop title in English, brand included.

/**
 * The controlled vocabulary, in the order titles list topics. Most name a
 * kind of AI ("AI safety") and share one "AI" when several follow each other
 * ("AI safety, risk and P(doom)"). P(doom) closes the list.
 */
export const titleTopicIds = [
  'safety',
  'risk',
  'regulation',
  'policy',
  'ethics',
  'consciousness',
  'bubble',
  'jobs',
  'education',
  'healthcare',
  'opensource',
  'agi',
  'superintelligence',
  'future',
  'pdoom'
] as const
export type TitleTopic = (typeof titleTopicIds)[number]

/** Topics whose full form names AI. */
const namesAi = new Set<TitleTopic>([
  'safety',
  'risk',
  'regulation',
  'policy',
  'ethics',
  'consciousness',
  'bubble',
  'future'
])
/** Topics with a shorter form once an earlier topic has named AI. */
const shortens = new Set<TitleTopic>([
  'safety',
  'risk',
  'regulation',
  'policy',
  'ethics',
  'consciousness',
  'future'
])

const topicEvidenceSchema = z.strictObject({
  topic: z.enum(titleTopicIds),
  /** Rank in Google's suggestions for the topic's own prefix ("<name> ai s"); 0 is first. */
  googleRank: z.number().int().min(0),
  /** Rank among Google's suggestions for "<name> ai" or "<name> on ai", if listed there. */
  overallRank: z.number().int().min(0).nullable(),
  engines: z.array(z.enum(['google', 'bing', 'duckduckgo'])).min(1),
  /** The suggestions that matched, as the engines wrote them. */
  queries: z.array(z.string()).min(1).max(4)
})

const profileTopicsSchema = z
  .strictObject({
    /** Most searched first; titles drop from the end when too long. */
    topics: z.array(z.enum(titleTopicIds)).max(3),
    evidence: z.array(topicEvidenceSchema),
    note: z.string().optional()
  })
  .refine(({ topics }) => new Set(topics).size === topics.length, {
    message: 'repeats a topic'
  })
  .refine(
    ({ topics, evidence }) =>
      topics.every((topic) => evidence.some((item) => item.topic === topic)),
    { message: 'lists a topic without evidence' }
  )

const profileTitleStudySchema = z.strictObject({
  studied: z.iso.date(),
  method: z.string(),
  people: z.record(z.string(), profileTopicsSchema)
})

/** The reviewed title topics of the people the keyword study covered. */
export const profileTitleStudy = profileTitleStudySchema.parse(study)

/** Map bands, from the October 2 decision page: outlook below 0.4, 0.4 to below 0.8, 0.8 and up. */
const outlookBands = { concern: 0.4, bloom: 0.8 } as const
export type OutlookBand = 'concern' | 'middle' | 'bloom'

export function outlookBand(outlook: number | null): OutlookBand | null {
  if (outlook === null) return null
  if (outlook < outlookBands.concern) return 'concern'
  return outlook < outlookBands.bloom ? 'middle' : 'bloom'
}

export type ProfileTitleChoice =
  | { source: 'search'; topics: TitleTopic[] }
  | { source: 'map'; band: OutlookBand }
  | { source: 'fallback' }

type Profile = { slug: string; name: string; outlook: number | null }

/**
 * Topics in title order, each in the form its position takes: "AI safety,
 * risk and P(doom)", "the future of AI, jobs and P(doom)", "AI regulation,
 * jobs and the future". Without a topic that names AI, the list starts with
 * AI itself: "AI and P(doom)".
 */
function topicPhrases(t: Translator, topics: TitleTopic[]) {
  const ordered = titleTopicIds.filter((topic) => topics.includes(topic))
  // "The future of AI" leads unless another topic already names AI; then it
  // closes the list as "the future".
  const futureLeads =
    ordered.includes('future') &&
    !ordered.some((topic) => topic !== 'future' && namesAi.has(topic))
  const sequence = futureLeads
    ? (['future', ...ordered.filter((topic) => topic !== 'future')] as const)
    : ordered
  let aiNamed = false
  const phrases = sequence.map((topic) => {
    const phrase =
      aiNamed && shortens.has(topic)
        ? t(
            `Profiles.titleTopicAfterAi.${topic}` as 'Profiles.titleTopicAfterAi.safety'
          )
        : t(`Profiles.titleTopic.${topic}`)
    if (namesAi.has(topic)) aiNamed = true
    return phrase
  })
  return aiNamed ? phrases : [t('Profiles.titleTopic.ai'), ...phrases]
}

/** A title in a locale for a given choice, without the site name. */
export function renderProfileTitle(
  t: Translator,
  locale: Locale,
  name: string,
  choice: ProfileTitleChoice
) {
  switch (choice.source) {
    case 'search':
      return t('Profiles.userTitleTopics', {
        name,
        // British English lists without the serial comma: "safety, risk and P(doom)".
        topics: new Intl.ListFormat(
          locale === 'en' ? 'en-GB' : languageTag(locale),
          { type: 'conjunction' }
        ).format(topicPhrases(t, choice.topics))
      })
    case 'map':
      return t(`Profiles.userTitleMap.${choice.band}`, { name })
    case 'fallback':
      return t('Profiles.userTitle', { name })
  }
}

const english = englishTranslator()
const fits = (title: string) =>
  googleTitleWidth(siteTitle(title)) <= googleTitleLimit

/**
 * Which title a profile gets, decided in English so every language shows the
 * same topics: the searched topics, most searched first, dropping from the
 * end until the English title fits; then the map band; then the fallback.
 */
export function profileTitleChoice({
  slug,
  name,
  outlook
}: Profile): ProfileTitleChoice {
  const topics = profileTitleStudy.people[slug]?.topics ?? []
  for (let count = topics.length; count > 0; count--) {
    const choice = { source: 'search', topics: topics.slice(0, count) } as const
    if (fits(renderProfileTitle(english, 'en', name, choice))) return choice
  }
  const band = outlookBand(outlook)
  if (band) {
    const choice = { source: 'map', band } as const
    if (fits(renderProfileTitle(english, 'en', name, choice))) return choice
  }
  return { source: 'fallback' }
}

/** A simulated user's page title in a locale, without the site name. */
export function profileTitle(t: Translator, locale: Locale, profile: Profile) {
  return renderProfileTitle(
    t,
    locale,
    profile.name,
    profileTitleChoice(profile)
  )
}
