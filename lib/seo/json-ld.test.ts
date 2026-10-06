import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { englishTranslator } from '@/i18n/translators'
import { breadcrumbTrail } from '@/lib/breadcrumbs'
import { oneLiner } from '@/components/landing/one-liners'
import { profileTitle } from './profile-titles'
import {
  aboutJsonLd,
  articleJsonLd,
  blogJsonLd,
  breadcrumbJsonLd,
  homeJsonLd,
  pdoomJsonLd,
  profileJsonLd,
  serializeJsonLd,
  usersJsonLd,
  type JsonLdDocument
} from './json-ld'

const site = 'https://www.doom-or-bloom.com'
const absolute = z.url().startsWith(`${site}/`)
const ref = z.strictObject({ '@id': absolute })
const graph = (document: JsonLdDocument) =>
  z
    .object({
      '@context': z.literal('https://schema.org'),
      '@graph': z.array(
        z.looseObject({ '@type': z.string(), '@id': z.string().optional() })
      )
    })
    .parse(document)['@graph']
const node = (document: JsonLdDocument, type: string) =>
  graph(document).find((entry) => entry['@type'] === type)
const nodes = (document: JsonLdDocument, type: string) =>
  graph(document).filter((entry) => entry['@type'] === type)

/** Every `{ "@id" }` reference anywhere in a value. */
function references(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(references)
  if (!value || typeof value !== 'object') return []
  const keys = Object.keys(value)
  if (keys.length === 1 && keys[0] === '@id')
    return [(value as { '@id': string })['@id']]
  return Object.values(value).flatMap(references)
}
/**
 * References a page's graph must define itself. The site (`/#website`) is
 * defined on the home page, and each page's BreadcrumbList is its own script.
 */
const unresolved = (document: JsonLdDocument) => {
  const ids = new Set(graph(document).map((entry) => entry['@id']))
  return references(graph(document)).filter(
    (id) =>
      !ids.has(id) && id !== `${site}/#website` && !id.endsWith('#breadcrumb')
  )
}

const creator = z.object({
  '@type': z.literal('Person'),
  '@id': z.literal(`${site}/#creator`),
  name: z.literal('Travis Fischer'),
  url: z.literal('https://x.com/transitive_bs'),
  sameAs: z
    .array(z.url())
    .refine((links) => links.includes('https://x.com/transitive_bs'))
    .refine((links) => links.includes('https://github.com/transitive-bullshit'))
})
const topicIds = [
  `${site}/#topic-ai-safety`,
  `${site}/#topic-ai-existential-risk`,
  `${site}/#topic-p-doom`
]
const wikipedia = z.url().regex(/^https:\/\/en\.wikipedia\.org\/wiki\/\S+$/u)
const wikidata = z.url().regex(/^https:\/\/www\.wikidata\.org\/wiki\/Q\d+$/u)
const topic = z.object({
  '@type': z.enum(['Thing', 'DefinedTerm']),
  '@id': z.enum(topicIds),
  name: z.string().min(1),
  sameAs: z.tuple([wikipedia, wikidata])
})
const creativeWork = z.strictObject({
  '@type': z.literal('CreativeWork'),
  name: z.string().min(1),
  url: z.url(),
  datePublished: z
    .string()
    .regex(/^\d{4}(?:-\d{2}){0,2}$/u)
    .optional()
})
const profileListItem = z.strictObject({
  '@type': z.literal('ListItem'),
  position: z.number().int().positive(),
  url: absolute,
  item: z.strictObject({
    '@type': z.literal('Person'),
    '@id': absolute,
    name: z.string().min(1)
  })
})

const hinton = {
  slug: 'geoffreyhinton',
  name: 'Geoffrey Hinton',
  description: oneLiner('geoffreyhinton'),
  avatar: '/personas/geoffreyhinton.jpg',
  xUrl: 'https://x.com/geoffreyhinton',
  sources: [
    {
      title: 'An interview',
      url: 'https://example.com/interview',
      publishedAt: '2024-05-01'
    },
    // The page lists a source once.
    {
      title: 'An interview',
      url: 'https://example.com/interview',
      publishedAt: '2024-05-01'
    },
    { title: 'A talk', url: 'https://example.com/talk', publishedAt: '2023' },
    {
      title: 'An undated essay',
      url: 'https://example.com/essay',
      publishedAt: 'spring'
    }
  ]
}
const profile = (person: Parameters<typeof profileJsonLd>[0]['person']) => {
  const t = englishTranslator('Profiles')
  return profileJsonLd({
    person,
    locale: 'en',
    title: profileTitle(englishTranslator(), 'en', {
      slug: person.slug,
      name: person.name,
      outlook: 0.25
    }),
    description: t('userDescription', { name: person.name }),
    disclosure: t('personDescription', { name: person.name }),
    dateModified: '2026-09-21T21:10:20.265Z'
  })
}

describe('structured data', () => {
  it('escapes markup so text cannot close the script element', () => {
    const text = serializeJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Thing',
      name: '</script><script>alert(1)</script>'
    })
    expect(text).not.toContain('<')
    expect(JSON.parse(text).name).toBe('</script><script>alert(1)</script>')
  })

  it('describes the home page as a site and a free web application', () => {
    const document = homeJsonLd({
      locale: 'es',
      siteDescription: 'Site',
      appDescription: 'App'
    })
    const website = z
      .strictObject({
        '@type': z.literal('WebSite'),
        '@id': z.literal(`${site}/#website`),
        url: z.literal(`${site}/`),
        name: z.literal('Doom or Bloom'),
        description: z.literal('Site'),
        inLanguage: z.array(z.string()).min(10),
        creator: ref,
        publisher: ref
      })
      .parse(node(document, 'WebSite'))
    // There is no URL-addressable site search, so no SearchAction.
    expect(website).not.toHaveProperty('potentialAction')
    z.object({
      '@type': z.literal('WebApplication'),
      name: z.literal('Doom or Bloom'),
      url: z.literal(`${site}/es`),
      description: z.literal('App'),
      applicationCategory: z.string(),
      operatingSystem: z.string(),
      isAccessibleForFree: z.literal(true),
      offers: z.object({
        '@type': z.literal('Offer'),
        price: z.literal('0'),
        priceCurrency: z.literal('USD')
      }),
      creator: ref
    }).parse(node(document, 'WebApplication'))
    creator.parse(node(document, 'Person'))
    expect(unresolved(document)).toEqual([])
  })

  it('lists visible breadcrumbs with absolute URLs in the page locale', () => {
    const t = englishTranslator('Breadcrumbs')
    const path = '/blog/why-p-doom-estimates-vary'
    const document = breadcrumbJsonLd(
      breadcrumbTrail(path, t, 'Why P(doom) estimates vary so much')!,
      path,
      'es'
    )
    const list = z
      .strictObject({
        '@context': z.literal('https://schema.org'),
        '@type': z.literal('BreadcrumbList'),
        '@id': z.literal(
          `${site}/es/blog/why-p-doom-estimates-vary#breadcrumb`
        ),
        itemListElement: z.array(
          z.strictObject({
            '@type': z.literal('ListItem'),
            position: z.number().int().positive(),
            name: z.string(),
            item: absolute
          })
        )
      })
      .parse(document)
    expect(list.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${site}/es` },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${site}/es/blog`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Why P(doom) estimates vary so much',
        item: `${site}/es/blog/why-p-doom-estimates-vary`
      }
    ])
  })

  it('describes the about page as a page about the site', () => {
    const page = z
      .strictObject({
        '@context': z.literal('https://schema.org'),
        '@type': z.literal('AboutPage'),
        '@id': z.literal(`${site}/fr/about#webpage`),
        url: z.literal(`${site}/fr/about`),
        name: z.literal('About'),
        description: z.string(),
        inLanguage: z.literal('fr'),
        isPartOf: ref,
        about: ref,
        breadcrumb: z.strictObject({
          '@id': z.literal(`${site}/fr/about#breadcrumb`)
        })
      })
      .parse(
        aboutJsonLd({
          locale: 'fr',
          name: 'About',
          description: 'How it works.'
        })
      )
    expect(page.about).toEqual(page.isPartOf)
    expect(page.about['@id']).toBe(`${site}/#website`)
  })

  it('describes a profile as a page about a real person, disclosing the simulation', () => {
    const document = profile(hinton)
    expect(nodes(document, 'ProfilePage')).toEqual([])
    const page = z
      .strictObject({
        '@type': z.literal('WebPage'),
        '@id': z.literal(`${site}/users/geoffreyhinton#webpage`),
        url: z.literal(`${site}/users/geoffreyhinton`),
        name: z.literal('Geoffrey Hinton on AI safety, risk and P(doom)'),
        description: z.string(),
        inLanguage: z.literal('en'),
        dateModified: z.iso.datetime(),
        isPartOf: ref,
        breadcrumb: ref,
        about: z.array(ref),
        mainEntity: ref,
        citation: z.array(creativeWork)
      })
      .parse(node(document, 'WebPage'))
    // Snippets lead with the page description; the disclosure follows it.
    expect(page.description).toMatch(/^What does Geoffrey Hinton think/)
    expect(page.description).toMatch(/simulation .* public writing/)
    expect(page.description).toContain('not their own assessment')

    const person = z
      .strictObject({
        '@type': z.literal('Person'),
        '@id': z.literal(`${site}/users/geoffreyhinton#person`),
        name: z.literal('Geoffrey Hinton'),
        description: z.literal(hinton.description),
        image: z.literal(`${site}/personas/geoffreyhinton.jpg`),
        sameAs: z.tuple([
          z.literal('https://x.com/geoffreyhinton'),
          z.literal('https://en.wikipedia.org/wiki/Geoffrey_Hinton'),
          z.literal('https://www.wikidata.org/wiki/Q92894')
        ])
      })
      .parse(node(document, 'Person'))
    expect(page.mainEntity['@id']).toBe(person['@id'])
    expect(page.about.map(({ '@id': id }) => id)).toEqual([
      person['@id'],
      ...topicIds
    ])
    // The person is described factually, never by the simulation's result.
    expect(person.description).not.toMatch(/simulat|P\(doom\)|%/iu)

    for (const entry of [
      ...nodes(document, 'Thing'),
      ...nodes(document, 'DefinedTerm')
    ])
      topic.parse(entry)
    z.object({
      name: z.literal('P(doom)'),
      url: z.literal(`${site}/p-doom`),
      description: z.string().startsWith('P(doom) is the probability')
    }).parse(node(document, 'DefinedTerm'))

    // Sources once each; only ISO dates are kept.
    expect(page.citation).toEqual([
      {
        '@type': 'CreativeWork',
        name: 'An interview',
        url: 'https://example.com/interview',
        datePublished: '2024-05-01'
      },
      {
        '@type': 'CreativeWork',
        name: 'A talk',
        url: 'https://example.com/talk',
        datePublished: '2023'
      },
      {
        '@type': 'CreativeWork',
        name: 'An undated essay',
        url: 'https://example.com/essay'
      }
    ])
    expect(unresolved(document)).toEqual([])
  })

  it('links only the profiles it has for people without a Wikipedia article', () => {
    const document = profile({
      slug: 'gwern',
      name: 'Gwern Branwen',
      description: 'Writer and researcher.',
      avatar: '/personas/gwern.jpg',
      xUrl: 'https://x.com/gwern'
    })
    expect(node(document, 'Person')?.sameAs).toEqual(['https://x.com/gwern'])
    expect(node(document, 'WebPage')).not.toHaveProperty('citation')

    // A profile link that is the Wikipedia article is listed once.
    const liang = profile({
      slug: 'liang-wenfeng',
      name: 'Liang Wenfeng',
      description: 'Founder of DeepSeek.',
      avatar: '/personas/liang.jpg',
      xUrl: null,
      profileUrl: 'https://en.wikipedia.org/wiki/Liang_Wenfeng'
    })
    expect(node(liang, 'Person')?.sameAs).toEqual([
      'https://en.wikipedia.org/wiki/Liang_Wenfeng',
      'https://www.wikidata.org/wiki/Q131847088'
    ])
  })

  it('keeps the person and topic ids when a profile is read in another locale', () => {
    const document = profileJsonLd({
      person: hinton,
      locale: 'es',
      title: 'Title',
      description: 'Description.',
      disclosure: 'Disclosure.'
    })
    expect(node(document, 'WebPage')).toMatchObject({
      '@id': `${site}/es/users/geoffreyhinton#webpage`,
      inLanguage: 'es',
      mainEntity: { '@id': `${site}/users/geoffreyhinton#person` }
    })
    expect(node(document, 'Person')?.['@id']).toBe(
      `${site}/users/geoffreyhinton#person`
    )
  })

  it('describes the directory as a collection of profiles', () => {
    const document = usersJsonLd({
      locale: 'de',
      name: 'Directory',
      description: 'Everyone.',
      people: [
        { slug: 'geoffreyhinton', name: 'Geoffrey Hinton' },
        { slug: 'simonw', name: 'Simon Willison' }
      ]
    })
    z.strictObject({
      '@type': z.literal('CollectionPage'),
      '@id': z.literal(`${site}/de/users#webpage`),
      url: z.literal(`${site}/de/users`),
      name: z.literal('Directory'),
      description: z.literal('Everyone.'),
      inLanguage: z.literal('de'),
      isPartOf: ref,
      breadcrumb: ref,
      about: z.array(ref).length(3),
      mainEntity: z.strictObject({
        '@id': z.literal(`${site}/de/users#people`)
      })
    }).parse(node(document, 'CollectionPage'))
    const list = z
      .strictObject({
        '@type': z.literal('ItemList'),
        '@id': absolute,
        name: z.string(),
        numberOfItems: z.literal(2),
        itemListOrder: z.literal('https://schema.org/ItemListOrderAscending'),
        itemListElement: z.array(profileListItem)
      })
      .parse(node(document, 'ItemList'))
    // Items link the English profile and name the person its page is about.
    expect(list.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      url: `${site}/users/geoffreyhinton`,
      item: {
        '@type': 'Person',
        '@id': node(profile(hinton), 'Person')?.['@id'],
        name: 'Geoffrey Hinton'
      }
    })
    expect(unresolved(document)).toEqual([])
  })

  it('describes a blog post as an English BlogPosting and the blog as its posts', () => {
    const post = {
      slug: 'why-p-doom-estimates-vary',
      title: 'Why P(doom) estimates vary so much',
      description: 'A plain guide.',
      date: '2026-10-01',
      words: 1000,
      minutes: 4,
      image: '/blog/why-p-doom-estimates-vary/opengraph-image?v=1'
    }
    const url = `${site}/blog/why-p-doom-estimates-vary`
    z.strictObject({
      '@context': z.literal('https://schema.org'),
      '@type': z.literal('BlogPosting'),
      '@id': z.literal(`${url}#article`),
      headline: z.literal(post.title),
      description: z.string(),
      url: z.literal(url),
      mainEntityOfPage: z.strictObject({
        '@type': z.literal('WebPage'),
        '@id': z.literal(url)
      }),
      image: z.tuple([absolute]),
      datePublished: z.literal('2026-10-01'),
      dateModified: z.literal('2026-10-01'),
      author: creator,
      publisher: creator,
      inLanguage: z.literal('en'),
      isAccessibleForFree: z.literal(true),
      wordCount: z.literal(1000),
      timeRequired: z.literal('PT4M'),
      isPartOf: z.strictObject({
        '@type': z.literal('Blog'),
        '@id': z.literal(`${site}/blog#blog`),
        name: z.string()
      })
    }).parse(articleJsonLd(post))
    expect(articleJsonLd({ ...post, updated: '2026-10-02' })).toMatchObject({
      datePublished: '2026-10-01',
      dateModified: '2026-10-02'
    })

    const blog = z
      .strictObject({
        '@context': z.literal('https://schema.org'),
        '@type': z.literal('Blog'),
        '@id': z.literal(`${site}/blog#blog`),
        url: z.literal(`${site}/blog`),
        name: z.string(),
        description: z.string(),
        inLanguage: z.literal('en'),
        author: creator,
        publisher: creator,
        isPartOf: ref,
        blogPost: z.array(
          z.strictObject({
            '@type': z.literal('BlogPosting'),
            '@id': absolute,
            headline: z.string(),
            description: z.string(),
            url: absolute,
            image: z.tuple([absolute]),
            datePublished: z.iso.date(),
            dateModified: z.iso.date(),
            author: creator,
            inLanguage: z.literal('en')
          })
        )
      })
      .parse(blogJsonLd({ name: 'Blog', description: 'Posts', posts: [post] }))
    expect(blog.blogPost[0]?.['@id']).toBe(`${url}#article`)
  })

  it('describes the P(doom) hub as a page defining the term, a dataset and its people', () => {
    const document = pdoomJsonLd({
      locale: 'en',
      title: 'What is P(doom)?',
      description:
        'P(doom) estimates thought leaders have stated publicly, with sources.',
      tableName: 'P(doom) by thought leader',
      variable: 'Publicly stated P(doom)',
      asOf: '2026-10-01',
      people: [
        { slug: 'geoffreyhinton', name: 'Geoffrey Hinton' },
        { slug: 'simonw', name: 'Simon Willison' }
      ],
      sources: [
        { title: 'Interview', url: 'https://example.com/a', year: 2024 },
        { title: 'Interview', url: 'https://example.com/a', year: 2024 },
        { title: 'Post', url: 'https://example.com/b', year: 2023 }
      ]
    })
    z.object({
      '@type': z.literal('WebPage'),
      url: z.literal(`${site}/p-doom`),
      dateModified: z.iso.date(),
      about: z.tuple([
        z.strictObject({ '@id': z.literal(`${site}/#topic-p-doom`) }),
        ref
      ]),
      mainEntity: z.strictObject({ '@id': z.literal(`${site}/p-doom#dataset`) })
    }).parse(node(document, 'WebPage'))
    z.object({
      '@type': z.literal('Dataset'),
      '@id': z.literal(`${site}/p-doom#dataset`),
      url: z.literal(`${site}/p-doom`),
      name: z.literal('P(doom) by thought leader'),
      // Google requires 50 to 5,000 characters.
      description: z.string().min(50).max(5000),
      isAccessibleForFree: z.literal(true),
      dateModified: z.iso.date(),
      creator,
      variableMeasured: z.strictObject({
        '@type': z.literal('PropertyValue'),
        name: z.literal('Publicly stated P(doom)'),
        description: z.string()
      }),
      temporalCoverage: z.literal('2023/2024'),
      isBasedOn: z.tuple([creativeWork, creativeWork])
    }).parse(node(document, 'Dataset'))
    // No license is stated for the table, so none is claimed.
    expect(node(document, 'Dataset')).not.toHaveProperty('license')
    const list = z
      .object({
        '@type': z.literal('ItemList'),
        numberOfItems: z.literal(2),
        itemListElement: z.array(profileListItem)
      })
      .parse(node(document, 'ItemList'))
    expect(list.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      url: `${site}/users/simonw`,
      item: {
        '@type': 'Person',
        '@id': `${site}/users/simonw#person`,
        name: 'Simon Willison'
      }
    })
    topic.parse(node(document, 'DefinedTerm'))
    expect(unresolved(document)).toEqual([])
  })
})
