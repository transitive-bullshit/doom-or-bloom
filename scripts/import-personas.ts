// Copies selected simulated users from the local development database to a
// target database (for example production) through the persona repository.
// No inference runs. Each selected `simulation_v1` snapshot keeps its
// generation key, so repeating an import is idempotent, and the repository's
// generation ordering means an older run never replaces a newer selection.
// `plan` opens the target read-only and writes nothing; `write` upserts each
// profile, publishes its run and verifies the target's selected digest.
// See docs/user-journeys.md#import-selected-simulated-users.
//
//   personas:import plan --env <file> --ids slug,slug
//   personas:import write --env <file> --ids slug,slug
import { readFileSync } from 'node:fs'
import { parseArgs, parseEnv } from 'node:util'
import { Pool } from 'pg'
import { databaseUrl } from '../lib/db/config'
import {
  personaMetadataSchema,
  simulationPayload
} from '../lib/personas/payload'
import { personaRepository } from '../lib/personas/repository'

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

function sourcePool() {
  const saved = parseEnv(readFileSync('.env.development.local', 'utf8'))
  const url = new URL(databaseUrl(saved.DATABASE_URL))
  if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    throw new Error('The import source must be the local development database.')
  url.searchParams.set('options', '-c default_transaction_read_only=on')
  return new Pool({ connectionString: url.toString(), max: 2 })
}

function targetPool(write: boolean) {
  // Only database settings are read, never auth or app flags.
  const saved = parseEnv(readFileSync(args.env!, 'utf8'))
  const value = write
    ? saved.DATABASE_URL
    : saved.ADMIN_DATABASE_URL ||
      saved.DATABASE_MIGRATION_URL ||
      saved.DATABASE_URL
  if (!value) throw new Error(`${args.env} has no database URL.`)
  const url = new URL(databaseUrl(value))
  if (!write && !url.hostname.includes('-pooler.'))
    url.searchParams.set(
      'options',
      '-c default_transaction_read_only=on -c statement_timeout=60000'
    )
  return new Pool({ connectionString: url.toString(), max: 2 })
}

const selectedQuery = `
  SELECT p.slug, p.metadata, p.source_brief, a.seed_key, s.format, s.digest, s.payload
  FROM personas p
  JOIN assessments a ON a.id = p.selected_assessment_id
  JOIN assessment_snapshots s ON s.id = a.final_snapshot_id
  WHERE p.slug = $1`

const source = sourcePool()
const target = targetPool(mode === 'write')
try {
  for (const slug of slugs) {
    const { rows } = await source.query(selectedQuery, [slug])
    const local = rows[0]
    if (!local) throw new Error(`${slug}: no selected local simulation`)
    if (local.format !== 'simulation_v1')
      throw new Error(`${slug}: only simulation_v1 snapshots are imported`)
    const payload = simulationPayload.parse(local.payload)
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
    const personaId = await repo.upsertProfile(
      personaMetadataSchema.parse(local.metadata),
      local.source_brief
    )
    await repo.publish(personaId, local.seed_key, payload)
    const after = (await target.query(selectedQuery, [slug])).rows[0]
    if (after?.digest !== local.digest)
      throw new Error(`${slug}: the target selected a different run`)
    console.log(`${slug}: ${state}; verified selected digest`)
  }
} finally {
  await Promise.all([source.end(), target.end()])
}
