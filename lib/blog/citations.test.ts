import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { describe, expect, it } from 'vitest'
import { sourceIcon } from '@/lib/sources/favicons'
import {
  externalLinks,
  inlineLinkPosts,
  postCitationProblems,
  postCitations
} from './citations'
import { postTranslationProblems } from './l10n'
import { blogDirectory, blogPosts, postSources } from './posts'
import { countWords, postFrontmatterSchema } from './schema'
import { blogSourceUrls } from './sources'

const sources = {
  'bostrom-2002': {
    title: 'Existential Risks',
    url: 'https://nickbostrom.com/papers/existential-risks/',
    by: 'Nick Bostrom',
    year: 2002
  },
  'good-1965': {
    title: 'Speculations Concerning the First Ultraintelligent Machine',
    url: 'http://incompleteideas.net/papers/Good65ultraintelligent.pdf',
    by: 'I. J. Good',
    year: 1965
  }
}

describe('blog citations', () => {
  it('number sources by first citation in the English post', () => {
    const body =
      'An explosion.[^good-1965] A risk,[^bostrom-2002] and again.[^good-1965]'
    const { numbers, footnotes } = postCitations(body, sources, (text) => [
      { text, slug: 'nick-bostrom' }
    ])
    expect(numbers).toEqual({ 'good-1965': 1, 'bostrom-2002': 2 })
    expect(footnotes.map(({ number, title }) => `${number} ${title}`)).toEqual([
      '1 Speculations Concerning the First Ultraintelligent Machine',
      '2 Existential Risks'
    ])
    expect(footnotes[1]!.byline).toEqual([
      { text: 'Nick Bostrom', slug: 'nick-bostrom' }
    ])
    expect(() => postCitations('Oops.[^missing]', sources)).toThrow(
      'Unknown source [^missing]'
    )
    expect(postCitations('No citations.')).toEqual({
      numbers: {},
      footnotes: []
    })
  })

  it('flag unlisted, unused and misplaced citations, and inline sources', () => {
    const body = [
      '## Risk[^bostrom-2002]',
      'See [Good](http://incompleteideas.net/x.pdf) and [the hub](/p-doom).[^nope]',
      '## Sources'
    ].join('\n')
    expect(postCitationProblems('new-post', body, sources)).toEqual([
      '[^nope] cites no listed source',
      'source good-1965 is never cited',
      'a heading cites: ## Risk[^bostrom-2002]',
      'the page adds the Sources section; remove this heading',
      'cite http://incompleteideas.net/x.pdf with a [^key] marker instead of a link'
    ])
    // Posts published before citations may keep their inline links.
    expect(
      postCitationProblems(
        [...inlineLinkPosts][0]!,
        'See [Pew](https://www.pewresearch.org/).'
      )
    ).toEqual([])
    expect(
      externalLinks(
        'A [site](/users), <https://a.example> and <a href="http://b.example">b</a>.'
      )
    ).toEqual(['https://a.example', 'http://b.example'])
  })

  it('validate sources in frontmatter', () => {
    const post = {
      title: 'A post',
      description: 'A description long enough to show in search results here.',
      date: '2026-10-06'
    }
    expect(postFrontmatterSchema.safeParse({ ...post, sources }).success).toBe(
      true
    )
    expect(
      postFrontmatterSchema.safeParse({
        ...post,
        sources: { Bostrom: sources['bostrom-2002'] }
      }).success
    ).toBe(false)
    expect(
      postFrontmatterSchema.safeParse({
        ...post,
        sources: {
          bostrom: { ...sources['bostrom-2002'], url: 'ftp://example.com' }
        }
      }).success
    ).toBe(false)
  })

  it('keep markers out of word counts and in translations', () => {
    expect(countWords('A risk.[^bostrom-2002]')).toBe(2)
    expect(
      postTranslationProblems(
        'A risk.[^bostrom-2002] An explosion.[^good-1965]',
        'Un riesgo.[^bostrom-2002] Una explosión.'
      )
    ).toEqual(['citation markers differ from the English'])
  })

  it('cite every committed post’s sources with markers and favicons', async () => {
    const posts = blogPosts()
    for (const post of posts) {
      const { content } = matter(
        await readFile(path.join(blogDirectory, `${post.slug}.mdx`), 'utf8')
      )
      expect({
        post: post.slug,
        problems: postCitationProblems(post.slug, content, post.sources)
      }).toEqual({ post: post.slug, problems: [] })
    }
    for (const slug of inlineLinkPosts)
      expect(posts.map((post) => post.slug)).toContain(slug)
    const citing = posts.filter((post) => post.sources)
    expect(citing.length).toBeGreaterThan(0)
    for (const post of citing) {
      const { footnotes } = postSources(post.slug)
      expect(footnotes).toHaveLength(Object.keys(post.sources!).length)
    }
    const icons = blogSourceUrls().map((url) => ({
      url,
      icon: sourceIcon(url)
    }))
    expect(
      icons.filter(
        ({ icon }) => !/^\/resource-previews\/[\w-]+\.webp$/.test(icon ?? '')
      )
    ).toEqual([])
    await Promise.all(icons.map(({ icon }) => access(`public${icon}`)))
  })
})
