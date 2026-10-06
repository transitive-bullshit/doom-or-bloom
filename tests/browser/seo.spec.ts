import { readFileSync } from 'node:fs'
import type { Page } from '@playwright/test'
import matter from 'gray-matter'
import { expect, test } from './fixtures'

const site = 'https://www.doom-or-bloom.com'
const spanish = JSON.parse(readFileSync('messages/es.json', 'utf8')) as {
  Blog: { englishOnly: string; inEnglish: string }
}
const spanishPost = matter(
  readFileSync('content/l10n/es/blog/hacker-news-vs-x.mdx', 'utf8')
).data as { title: string }

type Node = Record<string, unknown> & {
  '@type': string
  '@id'?: string
  description?: string
  sameAs?: string[]
  numberOfItems?: number
  itemListElement?: { url?: string; item?: { '@id'?: string } }[]
}

/** Every JSON-LD node on the page, flattening @graph documents. */
async function structuredData(page: Page): Promise<Node[]> {
  const scripts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
  return scripts.flatMap((text) => {
    const document = JSON.parse(text)
    return document['@graph'] ?? [document]
  })
}
const ofType = (nodes: Node[], type: string) =>
  nodes.filter((node) => node['@type'] === type)

async function canonicalAndRobots(page: Page) {
  const head = page.locator('head')
  return {
    canonical: await head.locator('link[rel="canonical"]').getAttribute('href'),
    robots: await head.locator('meta[name="robots"]').getAttribute('content')
  }
}

test('the home page names the P(doom) search and describes a free web app', async ({
  page
}) => {
  await page.goto('/')
  await expect(page).toHaveTitle(
    'How will AI change our future? Take the 3-minute quiz | Doom or Bloom'
  )
  const nodes = await structuredData(page)
  expect(ofType(nodes, 'WebSite')).toHaveLength(1)
  expect(ofType(nodes, 'WebApplication')[0]).toMatchObject({
    name: 'Doom or Bloom',
    isAccessibleForFree: true,
    offers: { price: '0' },
    creator: { '@id': `${site}/#creator` }
  })
  expect(ofType(nodes, 'Person')[0]).toMatchObject({
    '@id': `${site}/#creator`,
    name: 'Travis Fischer',
    url: 'https://x.com/transitive_bs',
    sameAs: expect.arrayContaining(['https://github.com/transitive-bullshit'])
  })
  // No URL-addressable site search, so no SearchAction.
  expect(ofType(nodes, 'WebSite')[0]).not.toHaveProperty('potentialAction')
  // Footer links make the directory, the hub, the blog and its featured posts
  // crawlable from every page.
  const footer = page.locator('footer')
  for (const [name, href] of [
    ['Thought leaders', '/users'],
    ['P(doom) estimates', '/p-doom'],
    ['All posts', '/blog'],
    ['Hacker News is gloomier about AI than X', '/blog/hacker-news-vs-x'],
    ['Why polls on AI disagree', '/blog/why-polls-on-ai-disagree']
  ] as const)
    await expect(
      footer.getByRole('link', { name, exact: true })
    ).toHaveAttribute('href', href)
  // Starting an interview is not a page for search engines.
  await expect(
    footer.getByRole('link', { name: 'Map your worldview', exact: true })
  ).toHaveAttribute('rel', 'nofollow')
})

test('the P(doom) hub defines the term, then cites curated estimates, scenarios and readings', async ({
  page
}) => {
  await page.goto('/p-doom')
  await expect(page).toHaveTitle(
    'What is P(doom)? Hinton, Musk, LeCun and more | Doom or Bloom'
  )
  await expect(
    page.getByRole('heading', { level: 1, name: 'What is P(doom)?' })
  ).toBeVisible()
  await expect(page.locator('main header p').first()).toHaveText(
    /^P\(doom\) is the probability a person assigns to advanced AI causing an existential catastrophe/
  )
  await expect(page.getByText(/^As of .+\d{4}$/)).toBeVisible()
  await expect(
    page.getByRole('link', {
      name: 'Why P(doom) estimates vary so much, and how to read one'
    })
  ).toHaveAttribute('href', '/blog/why-p-doom-estimates-vary')

  // A curated table, not the whole catalog: stated numbers as written, each
  // with a footnote, then refusals quoted instead of a number.
  const table = page.locator('[data-slot="pdoom-table"]')
  const rows = table.locator('tbody tr')
  const count = await rows.count()
  expect(count).toBeGreaterThanOrEqual(10)
  expect(count).toBeLessThanOrEqual(25)
  await expect(table.getByRole('button')).toHaveCount(0)
  const hinton = rows.filter({ hasText: 'Geoffrey Hinton' })
  await expect(hinton.getByRole('cell').nth(1)).toContainText('10–20%')
  await expect(
    hinton.getByRole('link', { name: 'Geoffrey Hinton' })
  ).toHaveAttribute('href', '/users/geoffreyhinton')
  const marker = hinton.getByRole('link', { name: /^Source \d+$/ })
  const footnote = (await marker.getAttribute('href'))!
  expect(footnote).toMatch(/^#source-\d+$/)
  await expect(
    page.locator(footnote).getByRole('link', {
      name: 'The Godfather of AI says we cannot afford to get it wrong'
    })
  ).toHaveAttribute('href', /^https:\/\/www\.wbur\.org\//)
  await expect(page.locator(footnote).locator('img')).toHaveAttribute(
    'src',
    /^\/resource-previews\/[\w-]+\.webp$/
  )
  const bengio = rows.filter({ hasText: 'Yoshua Bengio' })
  await expect(bengio).toContainText('No number')
  await expect(bengio.locator('q')).toHaveText(
    'I’d rather stay out of the p(doom) game.'
  )
  await expect(rows.last()).toContainText('No number')
  await expect(
    page.getByRole('link', { name: /^See all \d+ simulated thought leaders$/ })
  ).toHaveAttribute('href', '/users')

  // Six scenarios cite numbered sources; a reading list closes the page.
  const scenarios = page.locator(
    'section[aria-labelledby="pdoom-scenarios-title"]'
  )
  await expect(
    scenarios.getByRole('heading', { name: 'How it could happen' })
  ).toBeVisible()
  await expect(scenarios.locator('h3')).toHaveCount(6)
  // Mentions of people with a profile link to it.
  await expect(
    scenarios.getByRole('link', { name: 'Noah Smith' }).first()
  ).toHaveAttribute('href', '/users/noahpinion')
  const sources = page.locator(
    'section[aria-labelledby="pdoom-sources-title"] li'
  )
  expect(await sources.count()).toBeGreaterThan(count + 20)
  await expect(sources.last()).toHaveAttribute('id', /^source-\d+$/)
  const reading = page.locator('section[aria-labelledby="pdoom-reading-title"]')
  await expect(reading.locator('h3')).toHaveText([
    'Start here',
    'The core argument',
    'Forecasts and surveys',
    'Critiques'
  ])
  await expect(
    reading.getByRole('link', { name: /^AI as Normal Technology$/ })
  ).toHaveAttribute(
    'href',
    'https://www.normaltech.ai/p/ai-as-normal-technology'
  )

  const nodes = await structuredData(page)
  expect(ofType(nodes, 'WebPage')[0]).toMatchObject({
    url: `${site}/p-doom`,
    about: expect.arrayContaining([{ '@id': `${site}/#topic-p-doom` }]),
    breadcrumb: { '@id': `${site}/p-doom#breadcrumb` }
  })
  expect(ofType(nodes, 'DefinedTerm')[0]).toMatchObject({
    '@id': `${site}/#topic-p-doom`,
    name: 'P(doom)',
    sameAs: expect.arrayContaining(['https://en.wikipedia.org/wiki/P(doom)'])
  })
  expect(ofType(nodes, 'Dataset')[0]).toMatchObject({
    url: `${site}/p-doom`,
    isAccessibleForFree: true,
    creator: { '@id': `${site}/#creator` },
    variableMeasured: {
      '@type': 'PropertyValue',
      name: 'Publicly stated P(doom)'
    },
    isBasedOn: expect.arrayContaining([
      expect.objectContaining({
        '@type': 'CreativeWork',
        url: expect.stringMatching(/^https:\/\/www\.wbur\.org\//)
      })
    ])
  })
  const list = ofType(nodes, 'ItemList')[0]!
  expect(list.numberOfItems).toBe(count)
  // Rows link to the profile and name the person that profile is about.
  const first = list.itemListElement?.[0]
  expect(first?.url).toMatch(`${site}/users/`)
  expect(first?.item?.['@id']).toBe(`${first?.url}#person`)
  expect(ofType(nodes, 'BreadcrumbList')[0]).toMatchObject({
    '@id': `${site}/p-doom#breadcrumb`
  })
  expect(ofType(nodes, 'BreadcrumbList')).toHaveLength(1)
  await expect(
    page.getByRole('link', { name: 'Map my worldview' })
  ).toHaveAttribute('href', '/assessments?start=1')
  expect(await canonicalAndRobots(page)).toEqual({
    canonical: `${site}/p-doom`,
    robots: 'index, follow'
  })

  // The explainer stays English; other locales translate the chrome and defer
  // to the English page in search.
  await page.goto('/es/p-doom')
  await expect(page.locator('main header[lang="en"] h1')).toHaveText(
    'What is P(doom)?'
  )
  await expect(
    page.getByRole('heading', { name: 'P(doom) por líder de opinión' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Cómo podría ocurrir' })
  ).toBeVisible()
  expect(await canonicalAndRobots(page)).toEqual({
    canonical: `${site}/p-doom`,
    robots: 'noindex, follow'
  })
})

test('the blog lists posts, and a post carries article data, a card and a feed', async ({
  page,
  request
}) => {
  await page.goto('/blog')
  await expect(page).toHaveTitle('Blog | Doom or Bloom')
  const blog = ofType(await structuredData(page), 'Blog')[0]!
  expect(blog.blogPost).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        '@type': 'BlogPosting',
        url: `${site}/blog/why-p-doom-estimates-vary`,
        author: expect.objectContaining({ '@id': `${site}/#creator` })
      })
    ])
  )
  await page
    .getByRole('link', { name: 'Why P(doom) estimates vary so much' })
    .click()
  await expect(page).toHaveURL(/\/blog\/why-p-doom-estimates-vary$/)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Why P(doom) estimates vary so much'
    })
  ).toBeVisible()
  await expect(page.locator('main article header')).toContainText(
    /By Travis Fischer · .+ · \d+ min read/
  )
  const body = page.locator('[data-slot="blog-post-body"]')
  await expect(body).toHaveAttribute('lang', 'en')
  // Headings never end with a period, and the chart cites each number.
  for (const heading of await body.locator('h2').allTextContents())
    expect(heading).not.toMatch(/\.$/)
  // Sections are addressable, so result cards can link to the method.
  await expect(body.locator('h2#how-doom-or-bloom-estimates-pdoom')).toHaveText(
    'How Doom or Bloom estimates P(doom)'
  )
  // Names link to simulated profiles; the numbers are not links.
  const chart = page.locator('[data-slot="blog-data-ranges"]')
  await expect(chart.getByRole('rowheader')).toHaveCount(8)
  await expect(
    chart.getByRole('link', { name: 'Geoffrey Hinton' })
  ).toHaveAttribute('href', '/users/geoffreyhinton')
  await expect(chart.getByRole('link')).toHaveCount(8)
  // It opens by sending the definition and sourced table to the hub.
  await expect(
    body.locator('p').first().getByRole('link', { name: 'the P(doom) page' })
  ).toHaveAttribute('href', '/p-doom')
  await expect(
    body.getByRole('link', { name: 'P(doom) table of thought leaders' })
  ).toHaveAttribute('href', '/p-doom')

  const nodes = await structuredData(page)
  expect(ofType(nodes, 'BlogPosting')[0]).toMatchObject({
    headline: 'Why P(doom) estimates vary so much',
    url: `${site}/blog/why-p-doom-estimates-vary`,
    mainEntityOfPage: { '@id': `${site}/blog/why-p-doom-estimates-vary` },
    datePublished: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    dateModified: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    image: [
      expect.stringMatching(
        `${site}/blog/why-p-doom-estimates-vary/opengraph-image`
      )
    ],
    inLanguage: 'en',
    author: { name: 'Travis Fischer', url: 'https://x.com/transitive_bs' }
  })
  expect(ofType(nodes, 'BreadcrumbList')[0]?.itemListElement).toHaveLength(3)
  const head = page.locator('head')
  await expect(head.locator('meta[property="og:type"]')).toHaveAttribute(
    'content',
    'article'
  )
  await expect(
    head.locator('link[rel="alternate"][type="application/rss+xml"]')
  ).toHaveAttribute('href', `${site}/blog/rss.xml`)
  const image = new URL(
    (await head.locator('meta[property="og:image"]').getAttribute('content'))!
  )
  expect(image.pathname).toBe('/blog/why-p-doom-estimates-vary/opengraph-image')
  const card = await request.get(image.pathname + image.search)
  expect(card.status()).toBe(200)
  expect(card.headers()['content-type']).toBe('image/png')
  const png = await card.body()
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])

  const feed = await request.get('/blog/rss.xml')
  expect(feed.headers()['content-type']).toContain('application/rss+xml')
  expect(await feed.text()).toContain(
    `<link>${site}/blog/why-p-doom-estimates-vary</link>`
  )

  // An English-only post: other locales translate the chrome only.
  await page.goto('/es/blog/why-p-doom-estimates-vary')
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page.getByText(spanish.Blog.englishOnly)).toBeVisible()
  expect(await canonicalAndRobots(page)).toEqual({
    canonical: `${site}/blog/why-p-doom-estimates-vary`,
    robots: 'noindex, follow'
  })
  expect((await page.goto('/blog/no-such-post'))?.status()).toBe(404)
})

test('the renamed P(doom) post redirects permanently to its new URL', async ({
  page,
  request
}) => {
  for (const [path, location] of [
    ['/blog/what-is-p-doom', '/blog/why-p-doom-estimates-vary'],
    ['/ja/blog/what-is-p-doom', '/ja/blog/why-p-doom-estimates-vary'],
    [
      '/blog/what-is-p-doom/opengraph-image',
      '/blog/why-p-doom-estimates-vary/opengraph-image'
    ]
  ] as const) {
    const response = await request.get(path, { maxRedirects: 0 })
    expect(response.status(), path).toBe(308)
    expect(response.headers()['location'], path).toBe(location)
  }
  await page.goto('/blog/what-is-p-doom')
  await expect(page).toHaveURL(/\/blog\/why-p-doom-estimates-vary$/)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Why P(doom) estimates vary so much'
    })
  ).toBeVisible()
})

test('a data post charts participant aggregates with their date', async ({
  page
}) => {
  await page.goto('/blog/hacker-news-vs-x')
  const body = page.locator('[data-slot="blog-post-body"]')
  // Group-size suppression itself is covered by the data schema's unit tests.
  await expect(body.locator('[data-slot="blog-data-bars"]')).toHaveCount(3)
  await expect(
    body
      .locator('[data-slot="blog-data-bars"]')
      .filter({ hasText: 'Each wave by outlook level' })
      .getByText(/As of October 3, 2026/)
  ).toBeVisible()
  await expect(body.locator('[data-slot="blog-data-intervals"]')).toHaveCount(1)
  for (const heading of await body.locator('h2').allTextContents())
    expect(heading).not.toMatch(/\.$/)
})

test('a translated post renders, indexes and shares in each language', async ({
  page,
  request
}) => {
  const path = '/blog/hacker-news-vs-x'
  await page.goto(`/es${path}`)
  const { title } = spanishPost
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
  await expect(page.getByRole('heading', { level: 1 })).toHaveAttribute(
    'lang',
    'es'
  )
  await expect(page.locator('[data-slot="blog-post-body"]')).toHaveAttribute(
    'lang',
    'es'
  )
  await expect(page.getByText(spanish.Blog.englishOnly)).toHaveCount(0)
  // Charts take their text from the translated data and chrome.
  await expect(
    page.locator('[data-slot="blog-data-bars"]').first()
  ).toContainText(/A fecha de 3 de octubre de 2026/)
  const head = page.locator('head')
  expect(await canonicalAndRobots(page)).toEqual({
    canonical: `${site}/es${path}`,
    robots: 'index, follow'
  })
  for (const [hreflang, href] of [
    ['en', `${site}${path}`],
    ['ja', `${site}/ja${path}`],
    ['x-default', `${site}${path}`]
  ] as const)
    await expect(
      head.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)
    ).toHaveAttribute('href', href)
  expect(ofType(await structuredData(page), 'BlogPosting')[0]).toMatchObject({
    headline: title,
    url: `${site}/es${path}`,
    inLanguage: 'es',
    translationOfWork: { '@id': `${site}${path}#article` }
  })
  const image = new URL(
    (await head.locator('meta[property="og:image"]').getAttribute('content'))!
  )
  expect(image.pathname).toBe(`/es${path}/opengraph-image`)
  const card = await request.get(image.pathname + image.search)
  expect(card.status()).toBe(200)
  expect(card.headers()['content-type']).toBe('image/png')

  // The index lists it in Spanish, and English-only posts as such.
  await page.goto('/es/blog')
  await expect(
    page.getByRole('main').getByRole('link', { name: title })
  ).toHaveAttribute('href', `/es${path}`)
  await expect(page.getByText(spanish.Blog.inEnglish).first()).toBeVisible()
})

test('profiles link similar worldviews and describe the simulated person', async ({
  page
}) => {
  await page.goto('/users/geoffreyhinton')
  await expect(page).toHaveTitle(
    'Geoffrey Hinton on AI safety, risk and P(doom) | Doom or Bloom'
  )
  const similar = page.locator('[data-slot="similar-worldviews"]')
  await expect(
    similar.getByRole('heading', { name: 'Similar worldviews' })
  ).toBeVisible()
  const links = similar.getByRole('link')
  const count = await links.count()
  expect(count).toBeGreaterThanOrEqual(3)
  expect(count).toBeLessThanOrEqual(6)
  for (const href of await links.evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute('href'))
  ))
    expect(href).toMatch(/^\/users\/(?!geoffreyhinton$)[^/]+$/)
  // After the compare prompt come Similar worldviews, then what Hinton has
  // said himself, then the simulated answers, closed until asked for.
  const statements = page.locator('[data-slot="public-statements"]')
  await expect(
    statements.getByRole('heading', {
      level: 2,
      name: 'What Geoffrey Hinton has said about AI'
    })
  ).toBeVisible()
  await expect(statements.locator('blockquote')).toHaveCount(5)
  await expect(statements.getByRole('link').first()).toHaveAttribute(
    'href',
    /^https:\/\//
  )
  const assessment = page.getByRole('region', {
    name: 'Simulated Assessment',
    exact: true
  })
  const positions = await Promise.all(
    [
      page.getByText('Where do you land vs Geoffrey Hinton?'),
      similar,
      statements,
      assessment
    ].map((locator) => locator.boundingBox())
  )
  for (let i = 1; i < positions.length; i++)
    expect(positions[i]!.y).toBeGreaterThan(positions[i - 1]!.y)
  const answers = assessment.getByRole('button', {
    name: /View questions and simulated answers/
  })
  await expect(answers).toHaveAttribute('aria-expanded', 'false')
  // Closed, but still in the pregenerated HTML.
  await expect(assessment.locator('article').first()).toBeHidden()
  await answers.click()
  await expect(answers).toHaveAttribute('aria-expanded', 'true')
  await expect(assessment.locator('article').first()).toBeVisible()
  await links.first().click()
  await expect(page).toHaveURL(/\/users\/(?!geoffreyhinton$)[^/]+$/)

  await page.goto('/users/geoffreyhinton')
  const nodes = await structuredData(page)
  // Google reserves ProfilePage for people affiliated with the site.
  expect(ofType(nodes, 'ProfilePage')).toHaveLength(0)
  const profile = ofType(nodes, 'WebPage')[0]!
  expect(profile).toMatchObject({
    url: `${site}/users/geoffreyhinton`,
    mainEntity: { '@id': `${site}/users/geoffreyhinton#person` },
    about: [
      { '@id': `${site}/users/geoffreyhinton#person` },
      { '@id': `${site}/#topic-ai-safety` },
      { '@id': `${site}/#topic-ai-existential-risk` },
      { '@id': `${site}/#topic-p-doom` }
    ],
    citation: expect.arrayContaining([
      expect.objectContaining({ '@type': 'CreativeWork' })
    ])
  })
  // The page, not the person, says the worldview is simulated.
  expect(profile.description).toMatch(/simulation .* public writing/)
  expect(profile.description).toContain('not their own assessment')
  const person = ofType(nodes, 'Person')[0]!
  expect(person).toMatchObject({
    name: 'Geoffrey Hinton',
    sameAs: expect.arrayContaining([
      expect.stringMatching(/^https:\/\/x\.com\//),
      'https://en.wikipedia.org/wiki/Geoffrey_Hinton',
      'https://www.wikidata.org/wiki/Q92894'
    ])
  })
  // The visible one-liner under their name: factual, not the simulation.
  await expect(page.getByText(person.description!)).toBeVisible()
  expect(ofType(nodes, 'Thing').map((topic) => topic.name)).toEqual([
    'AI safety',
    'Existential risk from artificial intelligence'
  ])
  expect(ofType(nodes, 'BreadcrumbList')[0]?.itemListElement).toHaveLength(3)
})

test('the directory lists every profile, and About describes the site', async ({
  page
}) => {
  await page.goto('/users')
  const nodes = await structuredData(page)
  expect(ofType(nodes, 'CollectionPage')[0]).toMatchObject({
    url: `${site}/users`,
    mainEntity: { '@id': `${site}/users#people` },
    breadcrumb: { '@id': `${site}/users#breadcrumb` }
  })
  // Every profile in the full grid, listed alphabetically by name.
  await page.getByLabel('Sort by', { exact: true }).selectOption('name')
  await page.getByLabel('Order', { exact: true }).selectOption('asc')
  await page.getByRole('button', { name: /^Show all/ }).click()
  const links = await page
    .locator('.study-legend a')
    .evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href'))
    )
  const list = ofType(nodes, 'ItemList')[0]!
  expect(list.numberOfItems).toBe(links.length)
  expect(list.itemListElement?.map(({ url }) => url)).toEqual(
    links.map((href) => `${site}${href}`)
  )
  for (const { url, item } of list.itemListElement!)
    expect(item?.['@id']).toBe(`${url}#person`)
  expect(ofType(nodes, 'BreadcrumbList')).toHaveLength(1)

  await page.goto('/about')
  expect(ofType(await structuredData(page), 'AboutPage')[0]).toMatchObject({
    url: `${site}/about`,
    about: { '@id': `${site}/#website` }
  })
})

test('the sitemap lists English-only pages in English and translated posts in every language', async ({
  request
}) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of ['/p-doom', '/blog', '/blog/why-p-doom-estimates-vary'])
    expect(sitemap).toContain(`<loc>${site}${path}</loc>`)
  expect(sitemap).not.toContain(`${site}/es/p-doom`)
  expect(sitemap).not.toContain(`<loc>${site}/es/blog</loc>`)
  expect(sitemap).not.toContain(`${site}/es/blog/why-p-doom-estimates-vary`)
  for (const code of ['', '/es', '/ja'])
    expect(sitemap).toContain(`<loc>${site}${code}/blog/hacker-news-vs-x</loc>`)
  const llms = await (await request.get('/llms.txt')).text()
  expect(llms).toContain('## Blog')
  expect(llms).toContain(
    `- [Why P(doom) estimates vary so much](${site}/blog/why-p-doom-estimates-vary)`
  )
  expect(llms).toContain(`(${site}/p-doom)`)
})
