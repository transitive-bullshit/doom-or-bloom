import { readFile } from 'node:fs/promises'
import { createLocalJourneyStore } from '../lib/journeys/local-store'
import { suiteSchema } from '../lib/journeys/schema'

const file = process.argv.find((arg) => arg.startsWith('--file='))?.slice(7)
if (!file)
  throw new Error(
    'Pass --file=<saved-suite.json>; the original file is preserved'
  )
const suite = suiteSchema.parse(JSON.parse(await readFile(file, 'utf8')))
const store = createLocalJourneyStore(process.cwd())
await store.save(suite)
const restored = await store.read(suite.id)
for (const journey of suite.journeys) {
  if (
    JSON.stringify(
      restored.journeys.find((j) => j.personaId === journey.personaId)
    ) !== JSON.stringify(journey)
  )
    throw new Error(`Migration verification failed: ${journey.personaId}`)
}
console.log(
  `Migrated and verified ${suite.journeys.length} individual journeys in work/journeys; original preserved`
)
