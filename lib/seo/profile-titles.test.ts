import { describe, expect, it } from 'vitest'
import { people } from '@/components/landing/people'
import { locales } from '@/i18n/config'
import { englishTranslator } from '@/i18n/translators'
import { testTranslator } from '@/i18n/test-translator'
import { siteTitle } from '@/lib/site'
import {
  outlookBand,
  profileTitle,
  profileTitleChoice,
  profileTitleStudy,
  renderProfileTitle,
  titleTopicIds,
  type TitleTopic
} from './profile-titles'
import { googleTitleLimit, googleTitleWidth } from './title-width'

const t = englishTranslator()
const search = (name: string, topics: TitleTopic[]) =>
  renderProfileTitle(t, 'en', name, { source: 'search', topics })

describe('search titles', () => {
  it('reads as a plain list of topics, sharing one “AI”', () => {
    expect(search('Geoffrey Hinton', ['pdoom', 'safety', 'risk'])).toBe(
      'Geoffrey Hinton on AI safety, risk and P(doom)'
    )
    expect(search('Sam Altman', ['pdoom', 'safety'])).toBe(
      'Sam Altman on AI safety and P(doom)'
    )
    expect(search('Donald Trump', ['regulation', 'policy', 'risk'])).toBe(
      'Donald Trump on AI risk, regulation and policy'
    )
    expect(search('Fei-Fei Li', ['safety', 'ethics'])).toBe(
      'Fei-Fei Li on AI safety and ethics'
    )
  })

  it('starts with AI itself when no topic names it', () => {
    expect(search('Jensen Huang', ['pdoom'])).toBe(
      'Jensen Huang on AI and P(doom)'
    )
    expect(search('Andrej Karpathy', ['pdoom', 'jobs'])).toBe(
      'Andrej Karpathy on AI, jobs and P(doom)'
    )
    expect(search('Kevin Roose', ['jobs', 'agi'])).toBe(
      'Kevin Roose on AI, jobs and AGI'
    )
  })

  it('leads with the future of AI, or closes with the future once AI is named', () => {
    expect(search('Marc Andreessen', ['future'])).toBe(
      'Marc Andreessen on the future of AI'
    )
    expect(search('Elon Musk', ['jobs', 'future', 'pdoom'])).toBe(
      'Elon Musk on the future of AI, jobs and P(doom)'
    )
    expect(search('Marc Andreessen', ['jobs', 'regulation', 'future'])).toBe(
      'Marc Andreessen on AI regulation, jobs and the future'
    )
  })

  it('names the AI bubble and open source as topics of their own', () => {
    expect(search('Ed Zitron', ['bubble'])).toBe('Ed Zitron on the AI bubble')
    expect(search('Andrew Ng', ['jobs', 'bubble'])).toBe(
      'Andrew Ng on the AI bubble and jobs'
    )
    expect(search('Andrew Ng', ['regulation', 'opensource'])).toBe(
      'Andrew Ng on AI regulation and open source'
    )
  })

  it('reads naturally for every combination of up to three topics', () => {
    const combinations: TitleTopic[][] = []
    titleTopicIds.forEach((a, i) => {
      combinations.push([a])
      titleTopicIds.slice(i + 1).forEach((b, j) => {
        combinations.push([a, b])
        for (const c of titleTopicIds.slice(i + j + 2))
          combinations.push([a, b, c])
      })
    })
    for (const topics of combinations) {
      const title = search('Name', topics)
      expect(title).toMatch(/^Name on (AI\b|the )/)
      // One "AI" per kind of AI, never repeated back to back.
      expect(title).not.toMatch(
        /\bAI,? AI\b|\bAI and AI\b|\bof AI and the future\b/
      )
      expect(title).not.toMatch(/,\s*and |\s{2}|[.:]/)
      expect(title.split(' and ').length).toBeLessThanOrEqual(2)
      expect(title.endsWith(' and P(doom)')).toBe(topics.includes('pdoom'))
    }
  })
})

describe('choosing a title', () => {
  it('uses the searched topics, then the map band, then the fallback', () => {
    expect(
      profileTitleChoice({
        slug: 'geoffreyhinton',
        name: 'Geoffrey Hinton',
        outlook: 0.25
      })
    ).toEqual({ source: 'search', topics: ['pdoom', 'safety', 'risk'] })
    expect(
      profileTitleChoice({
        slug: 'someone-new',
        name: 'Someone New',
        outlook: 0.25
      })
    ).toEqual({ source: 'map', band: 'concern' })
    expect(
      profileTitleChoice({
        slug: 'someone-new',
        name: 'Someone New',
        outlook: null
      })
    ).toEqual({ source: 'fallback' })
    // Studied without a strong topic: the map decides.
    expect(profileTitleStudy.people.plinz?.topics).toEqual([])
    expect(
      profileTitleChoice({ slug: 'plinz', name: 'Joscha Bach', outlook: 0.6 })
    ).toEqual({ source: 'map', band: 'middle' })
  })

  it('splits the map at 40 and 80', () => {
    expect([0, 0.399, 0.4, 0.799, 0.8, 1].map(outlookBand)).toEqual([
      'concern',
      'concern',
      'middle',
      'middle',
      'bloom',
      'bloom'
    ])
    const name = 'Jo Smith'
    expect(
      ['concern', 'middle', 'bloom'].map((band) =>
        renderProfileTitle(t, 'en', name, {
          source: 'map',
          band: band as 'concern'
        })
      )
    ).toEqual([
      'Jo Smith on AI safety and risk',
      'Jo Smith on AI’s risks and benefits',
      'Jo Smith on AI’s future and opportunities'
    ])
    expect(renderProfileTitle(t, 'en', name, { source: 'fallback' })).toBe(
      'Jo Smith on AI'
    )
  })

  it('drops the least searched topics until the title fits Google', () => {
    const long = 'Alexandria Ocasio-Cortez'
    const choice = profileTitleChoice({
      slug: 'geoffreyhinton',
      name: long,
      outlook: 0.25
    })
    expect(choice).toEqual({ source: 'search', topics: ['pdoom'] })
  })

  it('keeps every profile’s English title within Google’s limit, brand included', () => {
    const tooWide = people.flatMap((person) =>
      [null, 0.1, 0.5, 0.9]
        .map((outlook) =>
          siteTitle(profileTitle(t, 'en', { ...person, outlook }))
        )
        .filter((title) => googleTitleWidth(title) > googleTitleLimit)
    )
    expect(tooWide).toEqual([])
  })

  it('renders every language with the same topics', () => {
    const hinton = {
      slug: 'geoffreyhinton',
      name: 'Geoffrey Hinton',
      outlook: 0.25
    }
    for (const locale of locales) {
      const title = profileTitle(testTranslator(locale), locale, hinton)
      expect(title).toContain('Geoffrey Hinton')
      expect(title).toContain('P(doom)')
    }
  })
})

describe('the keyword study', () => {
  it('covers only catalog profiles, with evidence for every topic', () => {
    const slugs = new Set(people.map((person) => person.slug))
    const problems = Object.entries(profileTitleStudy.people).flatMap(
      ([slug, entry]) => [
        ...(slugs.has(slug) ? [] : [`${slug} is not in the catalog`]),
        ...entry.topics
          .filter(
            (topic) =>
              entry.evidence.find((item) => item.topic === topic)!.googleRank >
              2
          )
          .map((topic) => `${slug} ${topic} is not a top-three suggestion`)
      ]
    )
    expect(problems).toEqual([])
  })
})

it('measures titles as Google’s 20px Arial does', () => {
  // Canvas measurements in Chromium, which kern a little tighter.
  expect(
    googleTitleWidth(
      'Geoffrey Hinton on AI safety, risk and P(doom) | Doom or Bloom'
    )
  ).toBeCloseTo(570, 0)
  expect(googleTitleWidth('Jürgen')).toBe(googleTitleWidth('Jurgen'))
})
