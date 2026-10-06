import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { locales } from '@/i18n/config'
import { footerPosts } from './footer-posts'
import { blogPost, isTranslated, postTranslation } from './posts'

const footer = (locale: string) =>
  JSON.parse(readFileSync(`messages/${locale}.json`, 'utf8')).Footer.posts

describe('footer posts', () => {
  it('names published posts and knows which are translated', () => {
    expect(
      footerPosts.map(({ slug }) => ({
        slug,
        published: blogPost(slug) !== null,
        translated: isTranslated(slug)
      }))
    ).toEqual(
      footerPosts.map(({ slug, translated }) => ({
        slug,
        published: true,
        translated
      }))
    )
  })

  it('labels each post with its title in every language', () => {
    for (const locale of locales)
      expect(
        Object.fromEntries(
          footerPosts.map(({ label }) => [label, footer(locale)[label]])
        )
      ).toEqual(
        Object.fromEntries(
          footerPosts.map(({ slug, label }) => [
            label,
            postTranslation(slug, locale)?.title ?? blogPost(slug)?.title
          ])
        )
      )
  })
})
