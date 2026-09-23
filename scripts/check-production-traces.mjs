import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

const output = process.env.NEXT_TEST_DIST_DIR || '.next'
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
    !files.some((file) => path.resolve(path.dirname(trace), file) === required),
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
await access(required)
console.log(
  'Production persona bundles read PostgreSQL and include required social portraits'
)
