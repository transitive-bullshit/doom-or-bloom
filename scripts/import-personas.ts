// Copies selected simulated users from the local development database to a
// target database (for example production) through the persona repository.
// No inference runs. Each selected `simulation_v1` snapshot keeps its
// generation key, so repeating an import is idempotent, and the repository's
// generation ordering means an older run never replaces a newer selection.
// `plan` opens the target read-only and writes nothing; `write` upserts each
// profile, publishes its run and verifies the target's selected digest.
// Profile metadata, including the one-liner, comes from people.ts rather than
// the local database, so an import never restores an older description.
// See docs/user-journeys.md#import-selected-simulated-users.
//
//   personas:import plan --env <file> --ids slug,slug
//   personas:import write --env <file> --ids slug,slug
import { parseArgs } from 'node:util'
import { catalogMetadata } from '../lib/personas/catalog-metadata'
import { simulationPayload } from '../lib/personas/payload'
import { personaRepository } from '../lib/personas/repository'
import { localSourcePool, targetPool } from './persona-target'

const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: { env: { type: 'string' }, ids: { type: 'string' } }
})
const mode = positionals[0]
if (mode !== 'plan' && mode !== 'write')
  throw new Error('Choose plan or write.')
if (!args.env) throw new Error('Pass --env with the target database settings.')
if (!args.ids) throw new Error('Pass --ids with the simulated users to import.')
const slugs = [...new Set(args.ids.split(','))]

const selectedQuery = `
  SELECT p.slug, p.metadata, p.source_brief, a.seed_key, s.format, s.digest, s.payload
  FROM personas p
  JOIN assessments a ON a.id = p.selected_assessment_id
  JOIN assessment_snapshots s ON s.id = a.final_snapshot_id
  WHERE p.slug = $1`

const source = localSourcePool()
const target = targetPool(args.env, mode === 'write')
const catalog = catalogMetadata()
try {
  for (const slug of slugs) {
    const { rows } = await source.query(selectedQuery, [slug])
    const local = rows[0]
    if (!local) throw new Error(`${slug}: no selected local simulation`)
    if (local.format !== 'simulation_v1')
      throw new Error(`${slug}: only simulation_v1 snapshots are imported`)
    const payload = simulationPayload.parse(local.payload)
    const metadata = catalog.find((profile) => profile.slug === slug)
    if (!metadata)
      throw new Error(`${slug}: not in components/landing/people.ts`)
    const before = (await target.query(selectedQuery, [slug])).rows[0]
    const state = !before
      ? 'new profile'
      : before.digest === local.digest
        ? 'already selected'
        : 'new selected run'
    if (mode === 'plan') {
      console.log(`${slug}: ${state} (${local.seed_key})`)
      continue
    }
    const repo = personaRepository(target)
    const personaId = await repo.upsertProfile(metadata, local.source_brief)
    await repo.publish(personaId, local.seed_key, payload)
    const after = (await target.query(selectedQuery, [slug])).rows[0]
    if (after?.digest !== local.digest)
      throw new Error(`${slug}: the target selected a different run`)
    console.log(`${slug}: ${state}; verified selected digest`)
  }
} finally {
  await Promise.all([source.end(), target.end()])
}
