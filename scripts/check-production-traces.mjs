import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const output = process.env.NEXT_TEST_DIST_DIR || '.next'
const manifest = JSON.parse(
  await readFile(path.join(output, 'prerender-manifest.json'), 'utf8')
)
const directory = await readFile(
  path.join(output, 'server/app/users.html'),
  'utf8'
)
const profilePaths = new Set(
  Array.from(
    directory.matchAll(/href="(\/users\/[^"?#]+)"/g),
    (match) => match[1]
  )
)
const publicAssessmentPaths = Object.keys(manifest.routes).filter((route) =>
  route.startsWith('/public/assessments/')
)
assert.equal(
  manifest.dynamicRoutes['/public/assessments/[id]'].fallback,
  null,
  'Newly published assessments must support on-demand generation'
)
assert(
  profilePaths.size > 0,
  'Build must contain the selected simulated-user catalog'
)
assert.equal(
  manifest.dynamicRoutes['/users/[username]'].fallback,
  null,
  'New post-build profiles must remain reachable from the revalidated directory'
)
for (const route of [
  '/',
  '/users',
  '/sitemap.xml',
  '/llms.txt',
  ...profilePaths,
  ...publicAssessmentPaths
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
console.log(
  `Verified ${profilePaths.size} pregenerated simulated profiles with server-rendered results and answers, and ${publicAssessmentPaths.length} cached public assessments`
)
const required = path.resolve('eval/development/live-persona-journeys.json')
for (const route of [
  'assessments/[id]/page',
  'about/page',
  'users/[username]/page',
  'prototypes/landing/personas/[id]/page',
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
  'public/assessments/[id]/social-image.webp'
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
console.log(
  'Production persona bundles read PostgreSQL and include required social portraits'
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
