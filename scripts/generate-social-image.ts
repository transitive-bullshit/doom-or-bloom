// Regenerate the approved site-wide social image offline with Takumi.
// Optional database refreshes read only public simulated-user profiles.
import { writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import { Pool } from 'pg'
import { personaRepository } from '../lib/personas/repository'
import {
  renderSiteSocialImage,
  siteSocialPoints
} from '../lib/sharing/render-site-social'
import { loadSocialPortrait } from '../lib/sharing/portraits'
import snapshot from '../lib/sharing/site-social-points.json'
import { siteSocialAlt, siteSocialFaces } from '../lib/sharing/site-social-card'
import { inspectionDatabaseUrl } from './inspection-env'

const usage =
  'Usage: pnpm social-image:generate [--local | --production]\nDefaults to the approved, checked-in public map snapshot; flags refresh from a read-only database.'
function fail(message: string): never {
  console.error(`${message}\n${usage}`)
  process.exit(1)
}
const { values } = (() => {
  try {
    return parseArgs({
      options: {
        local: { type: 'boolean' },
        production: { type: 'boolean' },
        help: { type: 'boolean' }
      }
    })
  } catch (err) {
    return fail(err instanceof Error ? err.message : 'Invalid options')
  }
})()

if (values.help) {
  console.log(usage)
  process.exit(0)
}
if (values.local && values.production) fail('Choose only one database source')

async function databasePoints(target: 'local' | 'production') {
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
    return points
  } finally {
    await pool.end()
  }
}

const target = values.local
  ? 'local'
  : values.production
    ? 'production'
    : 'snapshot'
const points =
  target === 'snapshot'
    ? await Promise.all(
        snapshot.map(async ({ slug, avatar, outlook, transformation }) => ({
          slug,
          outlook,
          transformation,
          portrait: siteSocialFaces.includes(slug)
            ? await loadSocialPortrait(avatar)
            : undefined
        }))
      )
    : await databasePoints(target)
await writeFile('app/opengraph-image.png', await renderSiteSocialImage(points))
await writeFile('app/opengraph-image.alt.txt', `${siteSocialAlt}\n`)
console.log(
  `Wrote app/opengraph-image.png from ${target} data: ${points.length} featured users, ${siteSocialFaces.length} portraits`
)
