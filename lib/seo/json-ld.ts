import {
  defaultLocale,
  languageTag,
  localizedPath,
  locales,
  type Locale
} from '@/i18n/config'
import type { Trail } from '@/lib/breadcrumbs'
import { pdoomDefinition } from '@/lib/p-doom/copy'
import { siteCreator, siteUrl } from '@/lib/site'
import personIdentities from './person-identities.json'

// Schema.org structured data, rendered by components/json-ld.tsx. Builders are
// pure so unit tests can validate every shape. See docs/SEO.md.

type Node = { '@type': string | string[]; '@id'?: string } & Record<
  string,
  unknown
>
export type JsonLdDocument =
  | ({ '@context': 'https://schema.org' } & Node)
  | { '@context': 'https://schema.org'; '@graph': Node[] }

const context = 'https://schema.org' as const
const siteName = 'Doom or Bloom'

// Stable @ids shared by every page, so search engines can join the nodes
// different pages describe: the site, its creator, the real people simulated
// users are about and the topics pages are about.
const websiteId = `${siteUrl}/#website`
const creatorId = `${siteUrl}/#creator`
/** The real person a simulated user is about, on every page that lists them. */
const personId = (slug: string) => `${siteUrl}/users/${slug}#person`

/** An absolute URL for a route path in a locale. */
const pageUrl = (path: string, locale: Locale = defaultLocale) =>
  `${siteUrl}${localizedPath(path, locale)}`
/** An absolute URL for a site asset such as a portrait. */
const absolute = (path: string) =>
  /^https?:\/\//u.test(path) ? path : `${siteUrl}${path}`
const ref = (id: string) => ({ '@id': id })
const unique = (links: (string | null | undefined)[]) => [
  ...new Set(links.filter((link): link is string => Boolean(link)))
]
/** ISO 8601 dates as sources record them: a year, a month or a day. */
const isoDate = /^\d{4}(?:-\d{2}){0,2}$/u

/** Hand-checked English Wikipedia and Wikidata pages, keyed by profile slug. */
const identities: Record<
  string,
  { wikipedia: string; wikidata: string } | undefined
> = personIdentities

const creator = (): Node => ({
  '@type': 'Person',
  '@id': creatorId,
  name: siteCreator.name,
  url: siteCreator.url,
  sameAs: [...siteCreator.sameAs]
})

/**
 * Topics pages are about, each identified by its Wikipedia and Wikidata
 * pages. P(doom) is a term the site defines on /p-doom.
 */
const topics = {
  aiSafety: {
    '@type': 'Thing',
    '@id': `${siteUrl}/#topic-ai-safety`,
    name: 'AI safety',
    sameAs: [
      'https://en.wikipedia.org/wiki/AI_safety',
      'https://www.wikidata.org/wiki/Q116291231'
    ]
  },
  existentialRisk: {
    '@type': 'Thing',
    '@id': `${siteUrl}/#topic-ai-existential-risk`,
    name: 'Existential risk from artificial intelligence',
    sameAs: [
      'https://en.wikipedia.org/wiki/Existential_risk_from_artificial_intelligence',
      'https://www.wikidata.org/wiki/Q21715237'
    ]
  },
  pdoom: {
    '@type': 'DefinedTerm',
    '@id': `${siteUrl}/#topic-p-doom`,
    name: 'P(doom)',
    alternateName: ['p doom', 'pdoom', 'probability of doom'],
    description: pdoomDefinition,
    url: `${siteUrl}/p-doom`,
    sameAs: [
      'https://en.wikipedia.org/wiki/P(doom)',
      'https://www.wikidata.org/wiki/Q126735145'
    ]
  }
} as const satisfies Record<string, Node>

/** A cited source: a page someone can follow, dated when the date is known. */
const creativeWork = ({
  title,
  url,
  published
}: {
  title: string
  url: string
  published?: string
}): Node => ({
  '@type': 'CreativeWork',
  name: title,
  url,
  ...(published && isoDate.test(published) && { datePublished: published })
})
const uniqueByUrl = <T extends { url: string }>(items: T[]) => [
  ...new Map(items.map((item) => [item.url, item])).values()
]

/** A list entry that links to a profile and names the person it is about. */
const profileListItem = (
  person: { slug: string; name: string },
  index: number
): Node => ({
  '@type': 'ListItem',
  position: index + 1,
  url: pageUrl(`/users/${person.slug}`),
  item: { '@type': 'Person', '@id': personId(person.slug), name: person.name }
})

/** Escapes `<` so text can never close the surrounding script element. */
export function serializeJsonLd(document: JsonLdDocument) {
  return JSON.stringify(document).replace(/</g, '\\u003c')
}

/** The home page: the site and the free assessment it offers. */
export function homeJsonLd({
  locale,
  siteDescription,
  appDescription
}: {
  locale: Locale
  siteDescription: string
  appDescription: string
}): JsonLdDocument {
  const languages = locales.map(languageTag)
  return {
    '@context': context,
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: `${siteUrl}/`,
        name: siteName,
        description: siteDescription,
        inLanguage: languages,
        creator: ref(creatorId),
        publisher: ref(creatorId)
      },
      {
        '@type': 'WebApplication',
        '@id': `${siteUrl}/#app`,
        name: siteName,
        url: pageUrl('/', locale),
        description: appDescription,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        inLanguage: languages,
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        creator: ref(creatorId),
        isPartOf: ref(websiteId)
      },
      creator()
    ]
  }
}

/** A BreadcrumbList matching the visible breadcrumbs. */
export function breadcrumbJsonLd(
  { crumbs, label }: Trail,
  path: string,
  locale: Locale
): JsonLdDocument {
  return {
    '@context': context,
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl(path, locale)}#breadcrumb`,
    itemListElement: [...crumbs, { href: path, label }].map(
      ({ href, label }, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: label,
        item: pageUrl(href, locale)
      })
    )
  }
}

/** The about page, about the site itself. */
export function aboutJsonLd({
  locale,
  name,
  description
}: {
  locale: Locale
  name: string
  description: string
}): JsonLdDocument {
  const url = pageUrl('/about', locale)
  return {
    '@context': context,
    '@type': 'AboutPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: languageTag(locale),
    isPartOf: ref(websiteId),
    about: ref(websiteId),
    breadcrumb: ref(`${url}#breadcrumb`)
  }
}

/**
 * A simulated user's profile: a page about the real person it simulates. The
 * person is described in neutral, factual terms; the page says the worldview
 * is a simulation built from their public writing.
 */
export function profileJsonLd({
  person,
  locale,
  title,
  description,
  disclosure,
  dateModified
}: {
  person: {
    slug: string
    name: string
    /** The neutral one-liner shown under their name. */
    description: string
    avatar: string
    xUrl?: string | null
    profileUrl?: string
    sources?: { title: string; url: string; publishedAt?: string }[]
  }
  locale: Locale
  title: string
  description: string
  /** That the worldview is a simulation from public writing, not theirs. */
  disclosure: string
  dateModified?: string
}): JsonLdDocument {
  const url = pageUrl(`/users/${person.slug}`, locale)
  const id = personId(person.slug)
  const identity = identities[person.slug]
  const citation = uniqueByUrl(person.sources ?? []).map((source) =>
    creativeWork({ ...source, published: source.publishedAt })
  )
  const sameAs = unique([
    person.xUrl,
    person.profileUrl,
    identity?.wikipedia,
    identity?.wikidata
  ])
  return {
    '@context': context,
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description: `${description} ${disclosure}`,
        inLanguage: languageTag(locale),
        ...(dateModified && { dateModified }),
        isPartOf: ref(websiteId),
        breadcrumb: ref(`${url}#breadcrumb`),
        about: [
          ref(id),
          ref(topics.aiSafety['@id']),
          ref(topics.existentialRisk['@id']),
          ref(topics.pdoom['@id'])
        ],
        mainEntity: ref(id),
        ...(citation.length && { citation })
      },
      {
        '@type': 'Person',
        '@id': id,
        name: person.name,
        description: person.description,
        image: absolute(person.avatar),
        ...(sameAs.length && { sameAs })
      },
      topics.aiSafety,
      topics.existentialRisk,
      topics.pdoom
    ]
  }
}

/** The directory of every simulated user, in its default order by name. */
export function usersJsonLd({
  locale,
  name,
  description,
  people
}: {
  locale: Locale
  name: string
  description: string
  people: { slug: string; name: string }[]
}): JsonLdDocument {
  const url = pageUrl('/users', locale)
  return {
    '@context': context,
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#webpage`,
        url,
        name,
        description,
        inLanguage: languageTag(locale),
        isPartOf: ref(websiteId),
        breadcrumb: ref(`${url}#breadcrumb`),
        about: [
          ref(topics.aiSafety['@id']),
          ref(topics.existentialRisk['@id']),
          ref(topics.pdoom['@id'])
        ],
        mainEntity: ref(`${url}#people`)
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#people`,
        name,
        numberOfItems: people.length,
        itemListOrder: 'https://schema.org/ItemListOrderAscending',
        itemListElement: people.map(profileListItem)
      },
      topics.aiSafety,
      topics.existentialRisk,
      topics.pdoom
    ]
  }
}

export type ArticleInput = {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  words: number
  minutes: number
  image: string
  /** The post's language: a translation describes its own URL. */
  locale?: Locale
}

const blogId = `${pageUrl('/blog')}#blog`
const postUrl = (slug: string, locale?: Locale) =>
  pageUrl(`/blog/${slug}`, locale)
/** A post as both its page and the blog index describe it. */
const blogPosting = (post: Omit<ArticleInput, 'words' | 'minutes'>): Node => ({
  '@type': 'BlogPosting',
  '@id': `${postUrl(post.slug, post.locale)}#article`,
  headline: post.title,
  description: post.description,
  url: postUrl(post.slug, post.locale),
  image: [absolute(post.image)],
  datePublished: post.date,
  dateModified: post.updated ?? post.date,
  author: creator(),
  inLanguage: languageTag(post.locale ?? defaultLocale),
  ...(post.locale &&
    post.locale !== defaultLocale && {
      translationOfWork: ref(`${postUrl(post.slug)}#article`)
    })
})

/**
 * A blog post, written in English by the site's creator, or its translation.
 */
export function articleJsonLd(post: ArticleInput): JsonLdDocument {
  const url = postUrl(post.slug, post.locale)
  return {
    '@context': context,
    ...blogPosting(post),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: creator(),
    isAccessibleForFree: true,
    wordCount: post.words,
    timeRequired: `PT${post.minutes}M`,
    isPartOf: { '@type': 'Blog', '@id': blogId, name: 'Doom or Bloom blog' }
  }
}

/** The blog index: the blog and the posts it contains. */
export function blogJsonLd({
  name,
  description,
  posts
}: {
  name: string
  description: string
  posts: Omit<ArticleInput, 'words' | 'minutes'>[]
}): JsonLdDocument {
  return {
    '@context': context,
    '@type': 'Blog',
    '@id': blogId,
    url: pageUrl('/blog'),
    name,
    description,
    inLanguage: 'en',
    author: creator(),
    publisher: creator(),
    isPartOf: ref(websiteId),
    blogPost: posts.map(blogPosting)
  }
}

/**
 * The P(doom) hub: a page defining the term, the table of publicly stated
 * estimates as a dataset, and the list of thought leaders whose simulated
 * profiles it links to.
 */
export function pdoomJsonLd({
  locale,
  title,
  description,
  tableName,
  variable,
  asOf,
  people,
  sources
}: {
  locale: Locale
  title: string
  description: string
  tableName: string
  /** What the table records, such as "Publicly stated P(doom)". */
  variable: string
  /** ISO date (YYYY-MM-DD) the table was read. */
  asOf: string
  people: { slug: string; name: string }[]
  /** Where each stated number or quoted refusal was said. */
  sources: { title: string; url: string; year?: number }[]
}): JsonLdDocument {
  const url = pageUrl('/p-doom', locale)
  const datasetId = `${pageUrl('/p-doom')}#dataset`
  const basedOn = uniqueByUrl(sources)
  const years = basedOn.flatMap(({ year }) => (year ? [year] : []))
  return {
    '@context': context,
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: languageTag(locale),
        dateModified: asOf,
        isPartOf: ref(websiteId),
        breadcrumb: ref(`${url}#breadcrumb`),
        about: [ref(topics.pdoom['@id']), ref(topics.existentialRisk['@id'])],
        mainEntity: ref(datasetId)
      },
      {
        '@type': 'Dataset',
        '@id': datasetId,
        url: pageUrl('/p-doom'),
        name: tableName,
        description:
          'P(doom) estimates that prominent thought leaders on AI have stated in public, each quoted exactly as written and linked to its source, with the quoted reasons of well-known people who decline to give a number.',
        inLanguage: 'en',
        isAccessibleForFree: true,
        dateModified: asOf,
        creator: creator(),
        about: ref(topics.pdoom['@id']),
        variableMeasured: {
          '@type': 'PropertyValue',
          name: variable,
          description: pdoomDefinition
        },
        measurementTechnique:
          'Estimates stated in public, quoted as written and linked to their sources; prominent refusals to give a number are quoted instead',
        keywords: ['P(doom)', 'AI risk', 'AI safety', 'existential risk'],
        ...(years.length && {
          temporalCoverage: `${Math.min(...years)}/${Math.max(...years)}`
        }),
        ...(basedOn.length && {
          isBasedOn: basedOn.map(({ title, url, year }) =>
            creativeWork({ title, url, published: year?.toString() })
          )
        }),
        isPartOf: ref(websiteId)
      },
      {
        '@type': 'ItemList',
        '@id': `${pageUrl('/p-doom')}#people`,
        name: tableName,
        numberOfItems: people.length,
        itemListElement: people.map(profileListItem)
      },
      topics.pdoom,
      topics.existentialRisk
    ]
  }
}
