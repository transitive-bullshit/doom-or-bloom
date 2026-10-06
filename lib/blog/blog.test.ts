import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { load } from 'cheerio'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { personas } from '@/lib/journeys/catalog'
import { publicPdoomStatements } from '@/lib/journeys/public-pdoom-statements'
import { locales } from '@/i18n/config'
import englishMessages from '@/messages/en.json'
import { pdoomGuidePath, pdoomMethodPath } from '@/lib/p-doom/copy'
import { googleTitleLimit, googleTitleWidth } from '@/lib/seo/title-width'
import { siteTitle } from '@/lib/site'
import {
  blogCardPath,
  blogSocialImageResponse,
  fitTitle,
  renderBlogSocialImage
} from '@/lib/sharing/blog-social-card'
import { wrappable } from '@/lib/sharing/card-renderer'
import { headingId, headingIds, postHeadings } from './headings'
import {
  dataStrings,
  dataTranslationProblems,
  digitRuns,
  postTranslationProblems,
  translateData
} from './l10n'
import {
  participantAggregatesSchema,
  participantCharts,
  referrersSchema
} from './participant-charts'
import { movedPosts } from './moved-posts'
import {
  blogDirectory,
  blogPost,
  blogPosts,
  postHeadingIds,
  postTranslation
} from './posts'
import { blogFeed } from './rss'
import {
  barsDataSchema,
  blogDataSchema,
  countWords,
  dataProvenances,
  mapDataSchema,
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
    const guide = blogPost('why-p-doom-estimates-vary')!
    expect(guide).toMatchObject({
      title: 'Why P(doom) estimates vary so much',
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
      readFileSync(
        path.join(blogDirectory, 'why-p-doom-estimates-vary.mdx'),
        'utf8'
      )
    ).toContain('](/p-doom)')
  })

  it('give section headings unique ids from the English, in every language', () => {
    expect(headingId('How Doom or Bloom estimates P(doom)')).toBe(
      'how-doom-or-bloom-estimates-pdoom'
    )
    expect(headingId('What the number is, and what it isn’t')).toBe(
      'what-the-number-is-and-what-it-isnt'
    )
    expect(headingId('Où les sondages divergent')).toBe(
      'ou-les-sondages-divergent'
    )
    expect(
      postHeadings(
        '# Title\n## One [link](/a)\n```\n## Not a heading\n```\n### Two **bold**'
      )
    ).toEqual(['One link', 'Two bold'])
    // A translation's headings take the English ids by position.
    expect(headingIds('## Uno\n### Dos', '## One\n### Two')).toEqual({
      Uno: ['one'],
      Dos: ['two']
    })
    // Repeated headings keep one id each, numbered in order.
    expect(
      headingIds(
        '## Resultados\n### Datos\n## Resultados',
        '## Results\n### Data\n## Results'
      )
    ).toEqual({ Resultados: ['results', 'results-1'], Datos: ['data'] })
    for (const post of blogPosts())
      for (const locale of locales) {
        const ids = Object.values(postHeadingIds(post.slug, locale)).flat()
        const english = Object.values(postHeadingIds(post.slug, 'en')).flat()
        expect({ post: post.slug, locale, ids }).toEqual({
          post: post.slug,
          locale,
          ids: english
        })
        expect({ post: post.slug, unique: new Set(ids).size }).toEqual({
          post: post.slug,
          unique: ids.length
        })
      }
  })

  it('redirect moved slugs to posts that exist', () => {
    for (const [from, to] of Object.entries(movedPosts))
      expect({
        from: Boolean(blogPost(from)),
        to: Boolean(blogPost(to))
      }).toEqual({ from: false, to: true })
  })

  it('link result cards to the guide’s section on how we estimate P(doom)', () => {
    const [guidePath, section] = pdoomMethodPath.split('#')
    expect(guidePath).toBe(pdoomGuidePath)
    const slug = guidePath!.replace('/blog/', '')
    expect(blogPost(slug)).not.toBeNull()
    expect(Object.values(postHeadingIds(slug, 'en')).flat()).toContain(section)
  })

  it('title the hub within Google’s width', () => {
    const title = siteTitle(englishMessages.Pages.pdoom.title)
    expect(title).toBe(
      'What is P(doom)? Hinton, Musk, LeCun and more | Doom or Bloom'
    )
    expect(googleTitleWidth(title)).toBeLessThanOrEqual(googleTitleLimit)
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
    // Languages written without spaces count words, not runs of letters.
    expect(countWords('人工智能会改变世界', 'zh-Hans')).toBeGreaterThan(2)
  })
})

describe('post translations', () => {
  const english = [
    "import x from './data/x.json'",
    '',
    'See [the map](/users) and <DataBars data={x} />.',
    '',
    '## Why P(doom) varies',
    '',
    '- 48% of 1,221 people, median 0.34'
  ].join('\n')

  it('keep imports, components, site links, headings and numbers', () => {
    const spanish = english
      .replace('See [the map]', 'Mira [el mapa]')
      .replace('Why P(doom) varies', 'Por qué varía P(doom)')
      .replace(
        '48% of 1,221 people, median 0.34',
        '48 % de 1.221 personas, mediana 0,34'
      )
    expect(postTranslationProblems(english, spanish)).toEqual([])
    expect(digitRuns(spanish)).toEqual(digitRuns(english))
    expect(
      postTranslationProblems(
        english,
        spanish.replace('(/users)', '(/es/users)')
      )
    ).toEqual(['site links differ from the English'])
    expect(
      postTranslationProblems(english, spanish.replace('## Por', 'Por'))
    ).toEqual(['heading levels differ from the English'])
    expect(
      postTranslationProblems(
        english,
        spanish.replace('P(doom)', 'P(perdición)')
      )
    ).toEqual(['"P(doom)" must stay untranslated'])
  })

  it('translate only the text of a data file', () => {
    const data = readData('launch-week-outlook-by-wave.json')
    const strings = dataStrings(data)
    expect(strings.map(([at]) => at)).toContain('.title')
    expect(strings.map(([at]) => at)).toContain('.rows[0].label')
    const translated = translateData(
      data,
      new Map(strings.map(([at, text]) => [at, `«${text}»`]))
    )
    expect(dataTranslationProblems(data, translated)).toEqual([])
    const changed = structuredClone(translated) as {
      rows: { values: { hn: { share: number } } }[]
    }
    changed.rows[0]!.values.hn.share = 0.5
    expect(dataTranslationProblems(data, changed)).toEqual([
      '.rows[0].values.hn.share: 0.5 differs'
    ])
  })

  it('advertise a card in the post’s language', () => {
    const post = {
      slug: 'a-post',
      title: 'A post',
      author: 'Travis Fischer',
      date: '2026-10-01',
      minutes: 4
    }
    expect(blogCardPath(post)).toMatch(/^\/blog\/a-post\/opengraph-image\?v=/u)
    expect(blogCardPath(post, 'ja')).toMatch(
      /^\/ja\/blog\/a-post\/opengraph-image\?v=/u
    )
  })

  it('version the card URL by everything the card shows', () => {
    const post = {
      slug: 'a-post',
      title: 'A post',
      author: 'Travis Fischer',
      date: '2026-10-01',
      minutes: 4
    }
    const urls = new Set([
      blogCardPath(post),
      blogCardPath({ ...post, title: 'Another post' }),
      blogCardPath({ ...post, author: 'Another author' }),
      blogCardPath({ ...post, date: '2026-10-02' }),
      blogCardPath({ ...post, minutes: 5 })
    ])
    expect(urls.size).toBe(5)
  })
})

describe('blog data', () => {
  it('validates every committed data file', () => {
    expect(dataFiles.length).toBeGreaterThan(0)
    for (const file of dataFiles)
      expect(dataProvenances(blogDataSchema.parse(readData(file)))).not.toEqual(
        []
      )
  })

  it('builds the participant charts from the committed aggregates', () => {
    const charts = participantCharts(
      participantAggregatesSchema.parse(
        JSON.parse(
          readFileSync('content/blog/aggregates/participants.json', 'utf8')
        )
      ),
      referrersSchema.parse(
        JSON.parse(
          readFileSync('content/blog/aggregates/referrers.json', 'utf8')
        )
      )
    )
    // `pnpm blog:data --charts-only` rewrites them; a hand edit fails here.
    for (const [file, chart] of Object.entries(charts))
      expect({ file, chart: readData(file) }).toEqual({ file, chart })
  })

  it('shows participant numbers only for groups of at least 10', () => {
    const bars = (values: Record<string, unknown>) => ({
      kind: 'bars',
      title: 'A chart',
      source: 'Aggregates.',
      asOf: '2026-10-01',
      provenance: 'participants',
      series: [{ key: 'people', label: 'People' }],
      rows: [{ label: 'A row', values: { people: values } }]
    })
    const valid = (values: Record<string, unknown>) =>
      barsDataSchema.safeParse(bars(values)).success
    expect(valid({ share: 0.4, count: 12 })).toBe(true)
    expect(valid({ share: null })).toBe(true)
    expect(valid({ share: 0.04, count: 9 })).toBe(false)
    expect(valid({ share: 0.4 })).toBe(false)
    expect(valid({ share: null, count: 4 })).toBe(false)
    // Simulated profiles are public and need no minimum.
    expect(
      barsDataSchema.safeParse({
        ...bars({ share: 0.04, count: 5 }),
        provenance: 'simulated-users'
      }).success
    ).toBe(true)
    const map = {
      kind: 'map',
      title: 'A map',
      source: 'Aggregates.',
      asOf: '2026-10-01',
      provenance: 'participants',
      cells: [
        { outlook: [0, 0.5], transformation: [0, 1], share: 0.6, count: 30 },
        { outlook: [0.5, 1], transformation: [0, 1], share: null }
      ]
    }
    expect(mapDataSchema.safeParse(map).success).toBe(true)
    expect(
      mapDataSchema.safeParse({
        ...map,
        cells: [{ ...map.cells[0], count: 3 }]
      }).success
    ).toBe(false)
    // Shapes without a group size cannot carry participant numbers.
    const points = [{ outlook: 0.2, transformation: 0.8 }]
    expect(
      mapDataSchema.safeParse({ ...map, cells: undefined, points }).success
    ).toBe(false)
    expect(
      mapDataSchema.safeParse({
        ...map,
        provenance: ['participants', 'simulated-users'],
        points
      }).success
    ).toBe(true)
    const ranges = {
      kind: 'ranges',
      title: 'Ranges',
      source: 'Aggregates.',
      asOf: '2026-10-01',
      rows: [{ label: 'A row', token: '10–20%', low: 0.1, high: 0.2 }]
    }
    expect(
      rangeDataSchema.safeParse({ ...ranges, provenance: 'participants' })
        .success
    ).toBe(false)
    expect(
      rangeDataSchema.safeParse({ ...ranges, provenance: 'public-statements' })
        .success
    ).toBe(true)
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

  it('serves every post’s card, and translated cards only for translations', async () => {
    const [post] = blogPosts()
    const response = await blogSocialImageResponse(post!.slug, 'en')
    expect(response.headers.get('Content-Type')).toBe('image/png')
    expect(
      await sharp(Buffer.from(await response.arrayBuffer())).metadata()
    ).toMatchObject({ format: 'png', width: 1200, height: 630 })
    expect((await blogSocialImageResponse('no-such-post', 'en')).status).toBe(
      404
    )
    for (const { slug } of blogPosts())
      expect((await blogSocialImageResponse(slug, 'ja')).status).toBe(
        postTranslation(slug, 'ja') ? 200 : 404
      )
  })

  it('fits every post title on its card without breaking words', async () => {
    for (const post of blogPosts())
      for (const locale of locales) {
        const { title } = postTranslation(post.slug, locale) ?? post
        expect(
          await fitTitle(wrappable(title, locale), locale),
          `${locale}: ${title}`
        ).not.toHaveProperty('maxLines')
      }
  })

  it('shrinks titles to their longest word, and clamps words that never fit', async () => {
    const compound = await fitTitle(
      'Warum die Sicherheitsforschungsgemeinschaft Umfragen misstraut',
      'de'
    )
    expect(compound.fontSize).toBeLessThan(100)
    expect(compound).not.toHaveProperty('maxLines')
    expect(
      await fitTitle(
        'Antidisestablishmentarianismsupercalifragilisticexpialidociousness',
        'en'
      )
    ).toEqual({ fontSize: 48, maxLines: 5 })
  })

  it('renders each post card as a 1200 × 630 PNG', async () => {
    const bytes = await renderBlogSocialImage({
      title: 'Why P(doom) estimates vary so much',
      meta: 'October 1, 2026 · 4 min read'
    })
    expect(await sharp(bytes).metadata()).toMatchObject({
      format: 'png',
      width: 1200,
      height: 630
    })
  })
})
