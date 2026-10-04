// Regenerate the approved site-wide social image offline with Takumi.
// Optional database refreshes read only public simulated-user profiles.
import { writeFile } from 'node:fs/promises'
import { parseArgs } from 'node:util'
import path from 'node:path'
import { Pool } from 'pg'
import { personaRepository } from '../lib/personas/repository'
import {
  renderSiteSocialImage,
  siteSocialSnapshot,
  snapshotSocialPoints
} from '../lib/sharing/render-site-social'
import snapshot from '../lib/sharing/site-social-points.json'
import { siteSocialAlt } from '../lib/sharing/site-social-card'
import {
  applySiteSocialReview,
  createSiteSocialReview
} from '../lib/sharing/site-social-review'
import { inspectionDatabaseUrl } from './inspection-env'

const usage =
  'Usage: pnpm social-image:generate [--local | --production] [--out=<new-review-directory>]\n       pnpm social-image:generate --apply=<review-directory>\nDefault: regenerate offline. Database flags capture a before/after review without changing approved files; --apply updates the snapshot and image together.'
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
        out: { type: 'string' },
        apply: { type: 'string' },
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
if (values.apply && (values.local || values.production || values.out))
  fail('--apply cannot be combined with database or output flags')
if (values.out && !values.local && !values.production)
  fail('--out requires --local or --production')

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
    const points = siteSocialSnapshot(
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

if (values.apply) {
  await applySiteSocialReview(path.resolve(values.apply))
  console.log(
    'Applied reviewed snapshot, PNG and alt text. Review the Git diff before committing.'
  )
} else if (values.local || values.production) {
  const target = values.local ? 'local' : 'production'
  const directory = path.resolve(
    values.out ??
      `work/social-images/${new Date().toISOString().replaceAll(/[:.]/g, '-')}`
  )
  const review = await createSiteSocialReview(
    directory,
    await databasePoints(target),
    target
  )
  console.log(
    `Review: ${directory}\n${review.changes.length} changed points. Inspect before.png, after.png and review.json, then apply with --apply=${directory}`
  )
} else {
  const points = await snapshotSocialPoints(snapshot)
  await writeFile(
    'app/opengraph-image.png',
    await renderSiteSocialImage(points)
  )
  await writeFile('app/opengraph-image.alt.txt', `${siteSocialAlt}\n`)
  console.log(
    `Wrote app/opengraph-image.png from the approved snapshot: ${points.length} featured users`
  )
}
