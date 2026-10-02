import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { load } from 'cheerio'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { personas } from '@/lib/journeys/catalog'
import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import { renderBlogSocialImage } from '@/lib/sharing/blog-social-card'
import { blogDirectory, blogPost, blogPosts } from './posts'
import { blogFeed } from './rss'
import {
  blogDataSchema,
  countWords,
  periodHeadings,
  postFrontmatterSchema,
  rangeDataSchema,
  readingMinutes
} from './schema'

const dataDirectory = path.join(blogDirectory, 'data')
const dataFiles = readdirSync(dataDirectory).filter((file) =>
  file.endsWith('.json')
)
const readData = (file: string): unknown =>
  JSON.parse(readFileSync(path.join(dataDirectory, file), 'utf8'))

describe('blog posts', () => {
  it('parse with valid frontmatter, newest first, and a reading time', () => {
    const posts = blogPosts()
    expect(posts.length).toBeGreaterThan(0)
    expect(posts.map((post) => post.date)).toEqual(
      posts
        .map((post) => post.date)
        .toSorted()
        .toReversed()
    )
    const guide = blogPost('what-is-p-doom')!
    expect(guide).toMatchObject({
      title: 'What is P(doom)?',
      author: 'Travis Fischer',
      authorUrl: 'https://x.com/transitive_bs'
    })
    expect(guide.words).toBeGreaterThan(600)
    expect(guide.minutes).toBe(readingMinutes(guide.words))
    expect(blogPost('missing')).toBeNull()
  })

  it('keep headings without trailing periods and link to the P(doom) hub', () => {
    for (const post of blogPosts()) {
      const source = readFileSync(
        path.join(blogDirectory, `${post.slug}.mdx`),
        'utf8'
      )
      expect({ post: post.slug, headings: periodHeadings(source) }).toEqual({
        post: post.slug,
        headings: []
      })
    }
    expect(
      readFileSync(path.join(blogDirectory, 'what-is-p-doom.mdx'), 'utf8')
    ).toContain('](/p-doom)')
  })

  it('reject titles with trailing periods and short descriptions', () => {
    const valid = {
      title: 'A post',
      description: 'A description long enough to show in search results here.',
      date: new Date('2026-10-01T00:00:00Z')
    }
    expect(postFrontmatterSchema.parse(valid).date).toBe('2026-10-01')
    expect(
      postFrontmatterSchema.safeParse({ ...valid, title: 'A post.' }).success
    ).toBe(false)
    expect(
      postFrontmatterSchema.safeParse({ ...valid, description: 'Short' })
        .success
    ).toBe(false)
    expect(periodHeadings('## Fine\n## Not fine.\nText.')).toEqual([
      '## Not fine.'
    ])
  })

  it('count prose words, not frontmatter, imports, components or URLs', () => {
    expect(
      countWords(
        "---\ntitle: Skip me\n---\nimport x from './x.json'\n\n<DataRanges data={x} />\n\nP(doom) is 10% [here](https://example.com/a-b)."
      )
    ).toBe(4)
    expect(readingMinutes(0)).toBe(1)
    expect(readingMinutes(1150)).toBe(5)
  })
})

describe('blog data', () => {
  it('validates every committed data file and never holds participant data', () => {
    expect(dataFiles.length).toBeGreaterThan(0)
    for (const file of dataFiles)
      expect(['public-statements', 'simulated-users']).toContain(
        blogDataSchema.parse(readData(file)).provenance
      )
  })

  it('matches the verified public P(doom) statements it charts', () => {
    const chart = rangeDataSchema.parse(
      readData('public-pdoom-statements.json')
    )
    for (const row of chart.rows) {
      const [id, statement] = Object.entries(publicPdoomStatements).find(
        ([, statement]) => statement.url === row.href
      )!
      expect({ token: row.token, bounds: [row.low, row.high] }).toEqual({
        token: statement.token,
        bounds: statement.bounds
      })
      expect(personas.find((persona) => persona.id === id)?.proxy).toMatch(
        new RegExp(`^${row.label} · `)
      )
    }
  })
})

describe('feed and social image', () => {
  it('lists post summaries in RSS with escaped text', () => {
    const xml = blogFeed({
      title: 'Doom or Bloom blog',
      description: 'Notes & essays',
      posts: [
        {
          slug: 'a-post',
          title: 'P(doom) < 1%?',
          description: 'A <b>bold</b> claim',
          date: '2026-10-01',
          author: 'Travis Fischer'
        }
      ]
    })
    const feed = load(xml, { xmlMode: true })
    expect(feed('channel > description').text()).toBe('Notes & essays')
    expect(feed('item')).toHaveLength(1)
    expect(feed('item > title').text()).toBe('P(doom) < 1%?')
    expect(feed('item > link').text()).toBe(
      'https://www.doom-or-bloom.com/blog/a-post'
    )
    expect(feed('item > pubDate').text()).toBe('Thu, 01 Oct 2026 00:00:00 GMT')
    expect(xml).not.toContain('<b>')
  })

  it('renders each post card as a 1200 × 630 PNG', async () => {
    const bytes = await renderBlogSocialImage({
      title: 'What is P(doom)?',
      meta: 'October 1, 2026 · 4 min read'
    })
    expect(await sharp(bytes).metadata()).toMatchObject({
      format: 'png',
      width: 1200,
      height: 630
    })
  })
})
