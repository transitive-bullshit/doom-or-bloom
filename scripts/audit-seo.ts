import assert from 'node:assert/strict'
import sharp from 'sharp'
import http from 'node:http'
import { load } from 'cheerio'
import { writeFile, mkdir } from 'node:fs/promises'
import { people } from '../components/landing/people'

const origin = process.argv[2] ?? 'https://www.doom-or-bloom.com'
const output = process.argv[3] ?? '/tmp/doom-seo-audit/production.json'
// Portless hostnames resolve in Chrome; Node needs an explicit loopback lookup.
async function fetchPage(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const parsed = new URL(url)
  if (!parsed.hostname.endsWith('.localhost')) return fetch(url, options)
  return new Promise((resolve, reject) => {
    http
      .get(
        {
          hostname: '127.0.0.1',
          port: parsed.port,
          path: parsed.pathname + parsed.search,
          headers: {
            ...(options?.headers as Record<string, string>),
            host: parsed.host
          }
        },
        (response) => {
          const chunks: Buffer[] = []
          response.on('data', (chunk: Buffer) => chunks.push(chunk))
          response.on('end', () =>
            resolve(
              new Response(Buffer.concat(chunks), {
                status: response.statusCode,
                headers: response.headers as Record<string, string>
              })
            )
          )
          response.on('error', reject)
        }
      )
      .on('error', reject)
  })
}
const paths = [
  '/',
  '/assessment',
  '/about',
  '/privacy',
  ...people.map((p) => `/users/${p.slug}`)
]
const pages = []
for (const path of paths) {
  const response = await fetchPage(`${origin}${path}`, {
    headers: { 'User-Agent': 'Twitterbot/1.0' }
  })
  const html = await response.text()
  const $ = load(html)
  const meta = Object.fromEntries(
    $('head meta')
      .toArray()
      .map((element) => [
        $(element).attr('name') ?? $(element).attr('property'),
        $(element).attr('content')
      ])
  )
  pages.push({
    path,
    status: response.status,
    url: response.url,
    title: $('title').text(),
    canonical: $('link[rel=canonical]').attr('href'),
    h1: $('h1')
      .map((_, el) => $(el).text())
      .get(),
    meta,
    bytes: Buffer.byteLength(html)
  })
}
const files = []
for (const path of ['/robots.txt', '/sitemap.xml', '/llms.txt']) {
  const response = await fetchPage(`${origin}${path}`)
  files.push({
    path,
    status: response.status,
    type: response.headers.get('content-type'),
    text: await response.text()
  })
}
const images = []
for (const url of new Set(
  pages
    .flatMap((p) => [p.meta['og:image'], p.meta['twitter:image']])
    .filter(Boolean)
)) {
  const response = await fetchPage(
    url!
      .replace('https://doom-or-bloom.com', origin)
      .replace('https://www.doom-or-bloom.com', origin)
  )
  const bytes = Buffer.from(await response.arrayBuffer())
  const decoded = response.ok
    ? await sharp(bytes)
        .metadata()
        .catch(() => null)
    : null
  images.push({
    url,
    status: response.status,
    type: response.headers.get('content-type'),
    bytes: bytes.length,
    format: decoded?.format,
    width: decoded?.width,
    height: decoded?.height
  })
}
await mkdir(output.slice(0, output.lastIndexOf('/')), { recursive: true })
await writeFile(
  output,
  JSON.stringify(
    { origin, at: new Date().toISOString(), pages, files, images },
    null,
    2
  )
)
console.log(
  JSON.stringify(
    {
      output,
      pages: pages.length,
      statuses: [...new Set(pages.map((p) => p.status))],
      titles: [...new Set(pages.map((p) => p.title))],
      missingCanonicals: pages.filter((p) => !p.canonical).length,
      images,
      files: files.map(({ path, status, type }) => ({ path, status, type }))
    },
    null,
    2
  )
)

if (process.argv.includes('--check')) {
  const canonicalOrigin = 'https://www.doom-or-bloom.com'
  for (const page of pages) {
    assert.equal(page.status, 200, page.path)
    assert.equal(
      new URL(page.canonical!).href,
      canonicalOrigin + page.path,
      page.path
    )
    assert.equal(page.meta['og:url'], page.canonical, page.path)
    assert.equal(page.meta['og:title'], page.title, page.path)
    assert.equal(page.meta['twitter:title'], page.title, page.path)
    assert.equal(page.meta['og:description'], page.meta.description, page.path)
    assert.equal(
      page.meta['twitter:description'],
      page.meta.description,
      page.path
    )
    assert.equal(page.meta['twitter:card'], 'summary_large_image', page.path)
    assert.equal(page.meta.robots, 'index, follow', page.path)
    assert(
      page.meta.description &&
        page.meta['og:image:alt'] &&
        page.meta['twitter:image:alt'],
      page.path
    )
    const ogImage = new URL(page.meta['og:image']!)
    assert.equal(ogImage.origin, canonicalOrigin, page.path)
    if (page.path.startsWith('/users/')) {
      assert.equal(ogImage.pathname, `${page.path}/opengraph-image`, page.path)
    } else {
      assert.match(
        ogImage.pathname,
        /^\/_next\/static\/media\/opengraph-image\.[a-z0-9]+\.jpg$/,
        page.path
      )
    }
    assert.equal(page.meta['twitter:image'], page.meta['og:image'], page.path)
  }
  assert.equal(new Set(pages.map((page) => page.title)).size, pages.length)
  for (const image of images) {
    assert.equal(image.status, 200, image.url)
    const isPersona = new URL(image.url!).pathname.startsWith('/users/')
    assert.equal(image.type, isPersona ? 'image/webp' : 'image/jpeg', image.url)
    assert.equal(image.format, isPersona ? 'webp' : 'jpeg', image.url)
    assert.equal(image.width, 1200, image.url)
    assert.equal(image.height, 630, image.url)
  }
  for (const file of files) assert.equal(file.status, 200, file.path)
  const sitemap = load(
    files.find((file) => file.path === '/sitemap.xml')!.text,
    { xmlMode: true }
  )
  assert.deepEqual(
    sitemap('loc')
      .map((_, el) => sitemap(el).text())
      .get()
      .sort(),
    paths.map((path) => canonicalOrigin + path).sort()
  )
  const robots = files.find((file) => file.path === '/robots.txt')!.text
  assert(robots.includes('Allow: /'))
  assert.deepEqual(
    robots.split('\n').filter((line) => line.startsWith('Disallow:')),
    ['Disallow: /api/', 'Disallow: /api$']
  )
  console.log(
    'All public metadata, social images, sitemap and crawler checks passed'
  )
}
