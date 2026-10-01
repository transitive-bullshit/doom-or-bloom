import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const output = process.env.NEXT_TEST_DIST_DIR || '.next'
const manifest = JSON.parse(
  await readFile(path.join(output, 'prerender-manifest.json'), 'utf8')
)
// Pages live in app/[locale]; unprefixed English URLs are rewrites to /en.
const directory = await readFile(
  path.join(output, 'server/app/en/users.html'),
  'utf8'
)
const profilePaths = new Set(
  Array.from(
    directory.matchAll(/href="\/(users\/[^"?#]+)"/g),
    (match) => `/en/${match[1]}`
  )
)
// Social images stay outside app/[locale], at the public URL.
const publicImagePaths = Object.keys(manifest.routes).filter(
  (route) =>
    route.startsWith('/public/assessments/') &&
    route.endsWith('/social-image.png')
)
const publicAssessmentPaths = Object.keys(manifest.routes).filter((route) =>
  /^\/en\/public\/assessments\/[^/]+$/.test(route)
)
const publicRoutes = [...publicAssessmentPaths, ...publicImagePaths]
// Only English is pregenerated; other locales render on first request.
assert(
  !Object.keys(manifest.routes).some((route) =>
    /^\/(?!en\/)[^/]+\/(users|public\/assessments)\/[^/]+$/.test(route)
  ),
  'Only English simulated-user and public assessment pages are pregenerated'
)
for (const route of [
  '/[locale]/public/assessments/[id]',
  '/public/assessments/[id]/social-image.png'
])
  assert.equal(
    manifest.dynamicRoutes[route].fallback,
    null,
    `${route}: newly published assessments must support on-demand generation`
  )
assert.deepEqual(
  publicImagePaths.toSorted(),
  publicAssessmentPaths
    .map((route) => `${route.slice('/en'.length)}/social-image.png`)
    .toSorted(),
  'Every pregenerated public assessment must pregenerate its social image'
)
assert(
  profilePaths.size > 0,
  'Build must contain the selected simulated-user catalog'
)
assert.equal(
  manifest.dynamicRoutes['/[locale]/users/[username]'].fallback,
  null,
  'New post-build profiles must remain reachable from the revalidated directory'
)
const localeCodes = ['en', 'es', 'pt', 'hi', 'zh', 'th', 'ja', 'de', 'fr', 'id']
for (const route of [
  ...localeCodes.flatMap((code) => [
    `/${code}`,
    `/${code}/users`,
    `/${code}/p-doom`
  ]),
  '/sitemap.xml',
  '/llms.txt',
  ...profilePaths,
  ...publicRoutes
]) {
  assert.equal(
    manifest.routes[route]?.initialRevalidateSeconds,
    172800,
    `${route}: must be pregenerated with a 48-hour revalidation interval`
  )
}
for (const route of profilePaths) {
  const html = await readFile(
    path.join(output, 'server/app', `${route.slice(1)}.html`),
    'utf8'
  )
  assert(
    html.includes('Simulated Assessment') &&
      html.includes('data-slot="worldview-map"') &&
      html.includes('id="answer-1"'),
    `${route}: results and answers must be rendered into the initial HTML`
  )
}
for (const route of publicImagePaths) {
  const file = path.join(output, 'server/app', route.slice(1))
  const meta = JSON.parse(await readFile(`${file}.meta`, 'utf8'))
  const png = await readFile(`${file}.body`)
  assert(
    meta.headers['content-type'] === 'image/png' &&
      png.toString('latin1', 1, 4) === 'PNG' &&
      png.readUInt32BE(16) === 1200 &&
      png.readUInt32BE(20) === 630,
    `${route}: must be pregenerated as a 1200 × 630 PNG`
  )
}
// Blog posts change only with a deployment: the index and every post render
// at build in every locale, and the feed and post cards render once.
const posts = (await readdir('content/blog')).filter((file) =>
  file.endsWith('.mdx')
)
assert(posts.length > 0, 'Build must contain the blog posts')
for (const route of [
  ...localeCodes.flatMap((code) => [
    `/${code}/blog`,
    ...posts.map((file) => `/${code}/blog/${file.slice(0, -'.mdx'.length)}`)
  ]),
  '/blog/rss.xml',
  ...posts.map(
    (file) => `/blog/${file.slice(0, -'.mdx'.length)}/opengraph-image`
  )
])
  assert(manifest.routes[route], `${route}: must be pregenerated`)
assert.equal(
  manifest.dynamicRoutes['/[locale]/blog/[slug]'].fallback,
  false,
  'Unknown blog slugs must 404 without rendering'
)
console.log(
  `Verified ${profilePaths.size} pregenerated simulated profiles with server-rendered results and answers, and ${publicAssessmentPaths.length} cached public assessments with PNG social images`
)
const required = path.resolve('eval/development/live-persona-journeys.json')
for (const route of [
  '[locale]/(site)/assessments/[id]/page',
  '[locale]/(site)/about/page',
  '[locale]/(site)/users/[username]/page',
  '(internal)/prototypes/landing/personas/[id]/page',
  'users/[username]/opengraph-image/route'
]) {
  const trace = path.join(output, 'server/app', `${route}.js.nft.json`)
  const { files } = JSON.parse(await readFile(trace, 'utf8'))
  assert(
    !files.some(
      (file) =>
        path.resolve(path.dirname(trace), file) === required ||
        path
          .resolve(path.dirname(trace), file)
          .startsWith(path.resolve('work/journeys') + path.sep)
    ),
    `${route}: runtime bundle must read personas from PostgreSQL, not canonical fixture JSON`
  )
}
for (const portraitRoute of [
  'users/[username]/opengraph-image',
  'api/share-card',
  'api/assessments/[id]/results-image',
  'public/assessments/[id]/social-image.png'
]) {
  const portraitTrace = path.join(
    output,
    `server/app/${portraitRoute}/route.js.nft.json`
  )
  const { files: portraitFiles } = JSON.parse(
    await readFile(portraitTrace, 'utf8')
  )
  const bundled = new Set(
    portraitFiles.map((file) => path.resolve(path.dirname(portraitTrace), file))
  )
  for (const file of await readdir('public/personas')) {
    if (!/\.(jpg|png|webp)$/.test(file)) continue
    assert(
      bundled.has(path.resolve('public/personas', file)),
      `Social image bundle is missing portrait ${file}`
    )
  }
}
// Pages that show authored text bundle every release and its translations.
for (const page of [
  '[locale]/(site)/assessments/[id]/page',
  '[locale]/(site)/public/assessments/[id]/page',
  '[locale]/(site)/users/[username]/page'
]) {
  const trace = path.join(output, 'server/app', `${page}.js.nft.json`)
  const { files } = JSON.parse(await readFile(trace, 'utf8'))
  const bundled = new Set(
    files.map((file) => path.resolve(path.dirname(trace), file))
  )
  for (const file of [
    'content/releases/0.4.0-draft/prompts.json',
    'content/rubrics/0.1.0-draft/rubric.json',
    'content/l10n/ja/releases/0.4.0-draft.json',
    'content/l10n/th/rubrics/0.1.0-draft.json'
  ])
    assert(
      bundled.has(path.resolve(file)),
      `${page}: authored content ${file} is missing from the bundle`
    )
}
// The sitemap and llms.txt regenerate at runtime and list blog posts from
// their frontmatter, so they bundle the post files.
for (const route of ['sitemap.xml', 'llms.txt']) {
  const trace = path.join(output, `server/app/${route}/route.js.nft.json`)
  const { files } = JSON.parse(await readFile(trace, 'utf8'))
  const bundled = new Set(
    files.map((file) => path.resolve(path.dirname(trace), file))
  )
  for (const file of posts)
    assert(
      bundled.has(path.resolve('content/blog', file)),
      `${route}: blog post ${file} is missing from the bundle`
    )
}
// Takumi never reads system fonts: card routes bundle the Noto subsets.
const cardFonts = (await readdir('lib/sharing/fonts')).filter((file) =>
  file.endsWith('.woff2')
)
for (const fontRoute of [
  'users/[username]/opengraph-image',
  'api/share-card',
  'api/assessments/[id]/results-image',
  'api/map-png',
  'public/assessments/[id]/social-image.png',
  '[locale]/(site)/public/assessments/[id]/social-image.png'
]) {
  const trace = path.join(output, `server/app/${fontRoute}/route.js.nft.json`)
  const { files } = JSON.parse(await readFile(trace, 'utf8'))
  const bundled = new Set(
    files.map((file) => path.resolve(path.dirname(trace), file))
  )
  for (const file of cardFonts)
    assert(
      bundled.has(path.resolve('lib/sharing/fonts', file)),
      `${fontRoute}: card font ${file} is missing from the bundle`
    )
}
console.log(
  'Production persona bundles read PostgreSQL and include required social portraits and card fonts'
)

const routes = JSON.parse(
  await readFile(path.join(output, 'routes-manifest.json'), 'utf8')
)
assert(
  routes.rewrites.beforeFiles.some(
    (entry) =>
      entry.source === '/admin/:path*' &&
      entry.destination === '/internal-unavailable'
  ),
  'Every production artifact must block admin routes before filesystem routing'
)
console.log('Production routing blocks all local admin paths')

// Locale routing is next.config rewrites/redirects: no proxy function runs
// before cached pages, and no response sets the locale cookie.
const middleware = JSON.parse(
  await readFile(path.join(output, 'server/middleware-manifest.json'), 'utf8')
)
assert.deepEqual(
  Object.keys(middleware.middleware),
  [],
  'Locale routing must not add a proxy function'
)
assert(
  routes.rewrites.afterFiles.some((entry) => entry.destination === '/en'),
  'Unprefixed URLs must be served from the English tree'
)
console.log('Locale routing uses static rewrites without a proxy function')
