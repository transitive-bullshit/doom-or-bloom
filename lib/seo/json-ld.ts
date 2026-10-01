import {
  defaultLocale,
  languageTag,
  localizedPath,
  locales,
  type Locale
} from '@/i18n/config'
import type { Trail } from '@/lib/breadcrumbs'
import { siteCreator, siteUrl } from '@/lib/site'

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
const websiteId = `${siteUrl}/#website`
const creatorId = `${siteUrl}/#creator`

/** An absolute URL for a route path in a locale. */
const pageUrl = (path: string, locale: Locale = defaultLocale) =>
  `${siteUrl}${localizedPath(path, locale)}`
/** An absolute URL for a site asset such as a portrait. */
const absolute = (path: string) =>
  /^https?:\/\//u.test(path) ? path : `${siteUrl}${path}`

const creator = (): Node => ({
  '@type': 'Person',
  '@id': creatorId,
  name: siteCreator.name,
  url: siteCreator.url,
  sameAs: [siteCreator.url]
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
        creator: { '@id': creatorId },
        publisher: { '@id': creatorId }
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
        creator: { '@id': creatorId },
        isPartOf: { '@id': websiteId }
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

/** A simulated user's profile, about the real person it simulates. */
export function profileJsonLd({
  person,
  locale,
  title,
  description,
  personDescription,
  dateModified
}: {
  person: {
    slug: string
    name: string
    avatar: string
    xUrl?: string | null
    profileUrl?: string
  }
  locale: Locale
  title: string
  description: string
  personDescription: string
  dateModified?: string
}): JsonLdDocument {
  const url = pageUrl(`/users/${person.slug}`, locale)
  const sameAs = [person.xUrl, person.profileUrl].filter(
    (link, index, all): link is string =>
      Boolean(link) && all.indexOf(link) === index
  )
  return {
    '@context': context,
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${url}#page`,
        url,
        name: title,
        description,
        inLanguage: languageTag(locale),
        ...(dateModified && { dateModified }),
        isPartOf: { '@id': websiteId },
        mainEntity: { '@id': `${url}#person` }
      },
      {
        '@type': 'Person',
        '@id': `${url}#person`,
        name: person.name,
        description: personDescription,
        image: absolute(person.avatar),
        ...(sameAs.length && { sameAs })
      }
    ]
  }
}

export type ArticleInput = {
  slug: string
  title: string
  description: string
  date: string
  updated?: string
  author: string
  authorUrl: string
  words: number
  minutes: number
  image: string
}

/** A blog post. Posts are written in English. */
export function articleJsonLd(post: ArticleInput): JsonLdDocument {
  const url = pageUrl(`/blog/${post.slug}`)
  return {
    '@context': context,
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    mainEntityOfPage: url,
    image: [absolute(post.image)],
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { '@type': 'Person', name: post.author, url: post.authorUrl },
    publisher: {
      '@type': 'Person',
      name: siteCreator.name,
      url: siteCreator.url
    },
    inLanguage: 'en',
    isAccessibleForFree: true,
    wordCount: post.words,
    timeRequired: `PT${post.minutes}M`,
    isPartOf: { '@id': `${pageUrl('/blog')}#blog` }
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
  posts: Pick<ArticleInput, 'slug' | 'title' | 'date'>[]
}): JsonLdDocument {
  const url = pageUrl('/blog')
  return {
    '@context': context,
    '@type': 'Blog',
    '@id': `${url}#blog`,
    url,
    name,
    description,
    inLanguage: 'en',
    publisher: {
      '@type': 'Person',
      name: siteCreator.name,
      url: siteCreator.url
    },
    isPartOf: { '@id': websiteId },
    hasPart: posts.map((post) => ({
      '@type': 'Article',
      '@id': `${pageUrl(`/blog/${post.slug}`)}#article`,
      headline: post.title,
      url: pageUrl(`/blog/${post.slug}`),
      datePublished: post.date
    }))
  }
}

/**
 * The P(doom) hub's table: a dataset of stated and simulated estimates, and the
 * list of simulated users it links to.
 */
export function pdoomJsonLd({
  name,
  description,
  variables,
  asOf,
  people,
  citations
}: {
  name: string
  description: string
  variables: string[]
  /** ISO date (YYYY-MM-DD) the table was read. */
  asOf: string
  people: { slug: string; name: string }[]
  /** Sources of publicly stated numbers. */
  citations: string[]
}): JsonLdDocument {
  const url = pageUrl('/p-doom')
  return {
    '@context': context,
    '@graph': [
      {
        '@type': 'Dataset',
        '@id': `${url}#dataset`,
        url,
        name,
        description,
        inLanguage: 'en',
        isAccessibleForFree: true,
        dateModified: asOf,
        creator: creator(),
        variableMeasured: variables,
        measurementTechnique:
          'Publicly stated estimates with source links; rough estimates inferred from simulated interviews grounded in public writing',
        keywords: ['P(doom)', 'AI risk', 'AI safety', 'existential risk'],
        ...(citations.length && { citation: citations }),
        isPartOf: { '@id': websiteId }
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#people`,
        name,
        numberOfItems: people.length,
        itemListElement: people.map((person, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: person.name,
          url: pageUrl(`/users/${person.slug}`)
        }))
      }
    ]
  }
}
