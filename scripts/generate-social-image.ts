// Regenerate the site-wide social image (app/opengraph-image.png) with Takumi.
// Reads featured simulated users from production over a read-only connection
// (--local for offline work). They are our own public profiles, not participant
// data, so either source is safe; commit images generated from production so
// they match the live map. Writes only the image and its alt text.
import { writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { Pool } from 'pg'
import { personaRepository } from '../lib/personas/repository'
import {
  renderSiteSocialImage,
  siteSocialPoints
} from '../lib/sharing/render-site-social'
import { siteSocialAlt, siteSocialFaces } from '../lib/sharing/site-social-card'
import { inspectionDatabaseUrl } from './inspection-env'

const usage = 'Usage: pnpm social-image:generate [--local]'
function fail(message: string): never {
  console.error(`${message}\n${usage}`)
  process.exit(1)
}
const { values } = (() => {
  try {
    return parseArgs({
      options: { local: { type: 'boolean', default: false } }
    })
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Invalid options')
  }
})()

const target = values.local ? 'local' : 'production'
const url = (() => {
  try {
    return new URL(inspectionDatabaseUrl(target))
  } catch (err) {
    // Local configuration messages name files and keys, never values.
    return fail(err instanceof Error ? err.message : 'Invalid configuration')
  }
})()
url.searchParams.set(
  'options',
  '-c default_transaction_read_only=on -c statement_timeout=15000'
)
const pool = new Pool({
  connectionString: url.toString(),
  max: 1,
  connectionTimeoutMillis: 10_000,
  application_name: 'doom-or-bloom-social-image'
})
try {
  // The same featured users, in the same order, as the landing map.
  const summaries = await personaRepository(pool).selectedSummaries(true)
  const points = await siteSocialPoints(
    summaries.map(({ metadata, result }) => ({
      slug: metadata.slug,
      avatar: metadata.avatar,
      result
    }))
  )
  await writeFile(
    'app/opengraph-image.png',
    await renderSiteSocialImage(points)
  )
  await writeFile('app/opengraph-image.alt.txt', `${siteSocialAlt}\n`)
  console.log(
    `Wrote app/opengraph-image.png from ${target} data: ${points.length} featured users, ${siteSocialFaces.length} portraits`
  )
} finally {
  await pool.end()
}
