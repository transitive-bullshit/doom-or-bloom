import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'

const output = process.env.NEXT_TEST_DIST_DIR || '.next'
const required = path.resolve('eval/development/live-persona-journeys.json')
for (const route of [
  'about/page',
  'users/[username]/page',
  'prototypes/landing/personas/[id]/page',
  'users/[username]/opengraph-image/route'
]) {
  const trace = path.join(output, 'server/app', `${route}.js.nft.json`)
  const { files } = JSON.parse(await readFile(trace, 'utf8'))
  assert(
    files.some((file) => path.resolve(path.dirname(trace), file) === required),
    `${route}: canonical persona journeys are missing from the server bundle`
  )
}
await access(required)
console.log('Production persona bundles include canonical journey data')
