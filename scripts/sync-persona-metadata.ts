// Updates simulated users' profile metadata (the one-liner, name, portrait,
// featured flag and the rest of people.ts) in a target database, for example
// production, without importing runs or touching source briefs. No inference
// runs. `plan` opens the target read-only and prints each changed field;
// `write` updates the profiles that differ through the persona repository in
// one transaction, then verifies them. Profiles the target lacks are skipped:
// they arrive with their run through personas:import.
// See docs/user-journeys.md#sync-profile-metadata.
//
//   personas:sync-metadata plan --env <file> (--ids slug,slug | --all)
//   personas:sync-metadata write --env <file> (--ids slug,slug | --all)
import { isDeepStrictEqual, parseArgs } from 'node:util'
import { catalogMetadata } from '../lib/personas/catalog-metadata'
import {
  personaMetadataSchema,
  type PersonaMetadata
} from '../lib/personas/payload'
import { personaRepository } from '../lib/personas/repository'
import { targetPool } from './persona-target'

const { positionals, values: args } = parseArgs({
  allowPositionals: true,
  options: {
    env: { type: 'string' },
    ids: { type: 'string' },
    all: { type: 'boolean', default: false }
  }
})
const mode = positionals[0]
if (mode !== 'plan' && mode !== 'write')
  throw new Error('Choose plan or write.')
if (!args.env) throw new Error('Pass --env with the target database settings.')
if (!args.ids === !args.all) throw new Error('Pass either --ids or --all.')
const catalog = catalogMetadata()
const slugs = args.all
  ? catalog.map((profile) => profile.slug)
  : [...new Set(args.ids!.split(','))]
const desired = slugs.map((slug) => {
  const metadata = catalog.find((profile) => profile.slug === slug)
  if (!metadata) throw new Error(`${slug}: not in components/landing/people.ts`)
  // As jsonb stores it: no undefined fields.
  return JSON.parse(JSON.stringify(metadata)) as PersonaMetadata
})

const show = (value: unknown) => JSON.stringify(value) ?? 'missing'
function changedFields(before: PersonaMetadata, after: PersonaMetadata) {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(
      (key) =>
        !isDeepStrictEqual(
          before[key as keyof PersonaMetadata],
          after[key as keyof PersonaMetadata]
        )
    )
    .map(
      (key) =>
        `  ${key}: ${show(before[key as keyof PersonaMetadata])}\n  ${' '.repeat(key.length)}→ ${show(after[key as keyof PersonaMetadata])}`
    )
}

const target = targetPool(args.env, mode === 'write')
async function current() {
  const { rows } = await target.query<{ slug: string; metadata: unknown }>(
    'SELECT slug, metadata FROM personas WHERE slug = ANY($1)',
    [slugs]
  )
  return new Map(
    rows.map((row) => [row.slug, personaMetadataSchema.parse(row.metadata)])
  )
}
try {
  const before = await current()
  const missing = desired.filter((profile) => !before.has(profile.slug))
  const changes = desired.filter(
    (profile) =>
      before.has(profile.slug) &&
      changedFields(before.get(profile.slug)!, profile).length
  )
  for (const profile of changes)
    console.log(
      `${profile.slug}:\n${changedFields(before.get(profile.slug)!, profile).join('\n')}`
    )
  for (const profile of missing)
    console.log(`${profile.slug}: not in the target; import it with its run`)
  console.log(
    `${changes.length} to update, ${desired.length - changes.length - missing.length} unchanged, ${missing.length} not in the target.`
  )
  if (mode === 'write' && changes.length) {
    const updated = await personaRepository(target).updateProfiles(changes)
    const after = await current()
    for (const profile of changes)
      if (
        !updated.includes(profile.slug) ||
        !isDeepStrictEqual(after.get(profile.slug), profile)
      )
        throw new Error(`${profile.slug}: the target did not keep the update`)
    console.log(`Updated and verified ${updated.length} profiles.`)
  }
} finally {
  await target.end()
}
