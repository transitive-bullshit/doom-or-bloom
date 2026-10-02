import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { englishTranslator } from '@/i18n/translators'
import { breadcrumbTrail } from '@/lib/breadcrumbs'
import {
  articleJsonLd,
  blogJsonLd,
  breadcrumbJsonLd,
  homeJsonLd,
  pdoomJsonLd,
  profileJsonLd,
  serializeJsonLd,
  type JsonLdDocument
} from './json-ld'

const site = 'https://www.doom-or-bloom.com'
const absolute = z.url().startsWith(`${site}/`)
const ref = z.strictObject({ '@id': absolute })
const graph = (document: JsonLdDocument) =>
  z
    .object({
      '@context': z.literal('https://schema.org'),
      '@graph': z.array(z.looseObject({ '@type': z.string() }))
    })
    .parse(document)['@graph']
const node = (document: JsonLdDocument, type: string) =>
  graph(document).find((entry) => entry['@type'] === type)

const creator = z.object({
  '@type': z.literal('Person'),
  name: z.literal('Travis Fischer'),
  url: z.literal('https://x.com/transitive_bs')
})

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
    z.object({
      '@type': z.literal('WebSite'),
      '@id': absolute,
      url: z.literal(`${site}/`),
      name: z.literal('Doom or Bloom'),
      inLanguage: z.array(z.string()).min(10),
      creator: ref
    }).parse(node(document, 'WebSite'))
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
    expect(creator.parse(node(document, 'Person')).name).toBe('Travis Fischer')
  })

  it('lists visible breadcrumbs with absolute URLs in the page locale', () => {
    const t = englishTranslator('Breadcrumbs')
    const path = '/blog/what-is-p-doom'
    const document = breadcrumbJsonLd(
      breadcrumbTrail(path, t, 'What is P(doom)?')!,
      path,
      'es'
    )
    expect(
      z
        .object({
          '@context': z.literal('https://schema.org'),
          '@type': z.literal('BreadcrumbList'),
          itemListElement: z.array(
            z.strictObject({
              '@type': z.literal('ListItem'),
              position: z.number().int().positive(),
              name: z.string(),
              item: absolute
            })
          )
        })
        .parse(document).itemListElement
    ).toEqual([
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
        name: 'What is P(doom)?',
        item: `${site}/es/blog/what-is-p-doom`
      }
    ])
  })

  it('says a profile is a simulation of the person it names', () => {
    const t = englishTranslator('Profiles')
    const document = profileJsonLd({
      person: {
        slug: 'geoffreyhinton',
        name: 'Geoffrey Hinton',
        avatar: '/personas/geoffreyhinton.jpg',
        xUrl: 'https://x.com/geoffreyhinton'
      },
      locale: 'en',
      title: t('userTitle', { name: 'Geoffrey Hinton' }),
      description: t('userDescription', { name: 'Geoffrey Hinton' }),
      personDescription: t('personDescription', { name: 'Geoffrey Hinton' }),
      dateModified: '2026-09-21T21:10:20.265Z'
    })
    const page = z
      .object({
        '@type': z.literal('ProfilePage'),
        url: z.literal(`${site}/users/geoffreyhinton`),
        name: z.literal('Geoffrey Hinton on AI and P(doom)'),
        description: z.string().includes('simulated worldview'),
        mainEntity: ref
      })
      .parse(node(document, 'ProfilePage'))
    const person = z
      .object({
        '@type': z.literal('Person'),
        '@id': absolute,
        name: z.literal('Geoffrey Hinton'),
        sameAs: z.tuple([z.literal('https://x.com/geoffreyhinton')]),
        image: z.literal(`${site}/personas/geoffreyhinton.jpg`),
        description: z.string()
      })
      .parse(node(document, 'Person'))
    expect(page.mainEntity['@id']).toBe(person['@id'])
    expect(person.description).toMatch(/simulation .* public writing/)
    expect(person.description).toContain('not their own assessment')
  })

  it('describes a blog post as an English article and the blog as its parts', () => {
    const post = {
      slug: 'what-is-p-doom',
      title: 'What is P(doom)?',
      description: 'A plain guide.',
      date: '2026-10-01',
      author: 'Travis Fischer',
      authorUrl: 'https://x.com/transitive_bs',
      words: 1000,
      minutes: 4,
      image: '/blog/what-is-p-doom/opengraph-image?v=1'
    }
    z.object({
      '@context': z.literal('https://schema.org'),
      '@type': z.literal('Article'),
      headline: z.literal(post.title),
      description: z.string(),
      url: z.literal(`${site}/blog/what-is-p-doom`),
      mainEntityOfPage: z.literal(`${site}/blog/what-is-p-doom`),
      image: z.tuple([absolute]),
      datePublished: z.literal('2026-10-01'),
      dateModified: z.literal('2026-10-01'),
      author: creator,
      inLanguage: z.literal('en'),
      wordCount: z.literal(1000),
      timeRequired: z.literal('PT4M')
    }).parse(articleJsonLd(post))
    expect(
      z
        .object({
          '@type': z.literal('Blog'),
          url: z.literal(`${site}/blog`),
          hasPart: z.array(
            z.object({ '@type': z.literal('Article'), url: absolute })
          )
        })
        .parse(
          blogJsonLd({ name: 'Blog', description: 'Posts', posts: [post] })
        ).hasPart
    ).toHaveLength(1)
  })

  it('describes the P(doom) table as a dataset and a list of profiles', () => {
    const document = pdoomJsonLd({
      name: 'What is P(doom)?',
      description:
        'P(doom) estimates thought leaders have stated publicly, with sources.',
      variables: ['Publicly stated P(doom)'],
      asOf: '2026-10-01',
      people: [
        { slug: 'geoffreyhinton', name: 'Geoffrey Hinton' },
        { slug: 'simonw', name: 'Simon Willison' }
      ],
      citations: ['https://example.com/source']
    })
    z.object({
      '@type': z.literal('Dataset'),
      url: z.literal(`${site}/p-doom`),
      name: z.string(),
      description: z.string().min(50),
      isAccessibleForFree: z.literal(true),
      dateModified: z.iso.date(),
      creator,
      variableMeasured: z.tuple([z.literal('Publicly stated P(doom)')]),
      citation: z.array(z.url())
    }).parse(node(document, 'Dataset'))
    expect(
      z
        .object({
          '@type': z.literal('ItemList'),
          numberOfItems: z.literal(2),
          itemListElement: z.array(
            z.strictObject({
              '@type': z.literal('ListItem'),
              position: z.number(),
              name: z.string(),
              url: absolute
            })
          )
        })
        .parse(node(document, 'ItemList')).itemListElement[1]
    ).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Simon Willison',
      url: `${site}/users/simonw`
    })
  })
})
