import 'server-only'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { suiteSchema, runIndex } from './schema'
import { withJourneyExperiments } from './experiments'
import { createLocalJourneyStore } from './local-store'

export function createJourneyStore(root: string) {
  const local = createLocalJourneyStore(root)
  async function read(id: string, personaId?: string) {
    if (id !== 'baseline')
      return withJourneyExperiments(root, await local.read(id, personaId))
    const file = path.join(
      root,
      'eval/development/mechanical-journey-baseline.json'
    )
    if ((await stat(file)).size > 256_000_000)
      throw new Error('Journey artifact exceeds local read bound')
    const suite = suiteSchema.parse(JSON.parse(await readFile(file, 'utf8')))
    if (personaId)
      suite.journeys = suite.journeys.filter((j) => j.personaId === personaId)
    return suite
  }
  async function list() {
    const runs = await local.list()
    try {
      runs.push(runIndex(await read('baseline')))
    } catch (err) {
      if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT'))
        throw err
    }
    return runs
  }
  return { read, list, save: local.save }
}

export function projectJourneyStore() {
  return createJourneyStore(process.cwd())
}
