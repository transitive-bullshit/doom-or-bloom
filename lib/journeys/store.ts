import 'server-only'
import { randomUUID } from 'node:crypto'
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile
} from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { runIndex, suiteSchema } from './schema'
import type { JourneySuite, RunIndex } from './schema'

const runId = z.string().regex(/^(baseline|[0-9]{13}-[a-f0-9-]{36})$/)
const indexSchema = suiteSchema
  .omit({
    schemaVersion: true,
    authoring: true,
    requestBudget: true,
    journeys: true
  })
  .extend({ personaIds: z.array(z.string()).max(10) })

export function createJourneyStore(root: string) {
  const directory = path.join(root, 'eval/runs/journeys')
  const baseline = path.join(
    root,
    'eval/development/mechanical-journey-baseline.json'
  )
  async function read(id: string): Promise<JourneySuite> {
    runId.parse(id)
    const file =
      id === 'baseline' ? baseline : path.join(directory, id, 'suite.json')
    if ((await stat(file)).size > 32_000_000)
      throw new Error('Journey artifact exceeds local read bound')
    const suite = suiteSchema.parse(JSON.parse(await readFile(file, 'utf8')))
    if (suite.id !== id) throw new Error('Journey artifact identity mismatch')
    return suite
  }
  async function list(): Promise<RunIndex[]> {
    let directories: string[] = []
    try {
      directories = (await readdir(directory))
        .filter((id) => runId.safeParse(id).success && id !== 'baseline')
        .sort()
        .reverse()
        .slice(0, 40)
    } catch (err) {
      if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT'))
        throw err
    }
    const runs = await Promise.all(
      directories.map(async (id) => {
        const file = path.join(directory, id, 'index.json')
        if ((await stat(file)).size > 20_000)
          throw new Error('Journey index exceeds read bound')
        const record = indexSchema.parse(
          JSON.parse(await readFile(file, 'utf8'))
        )
        if (record.id !== id) throw new Error('Journey index identity mismatch')
        return record
      })
    )
    try {
      runs.push(runIndex(await read('baseline')))
    } catch (err) {
      if (!(err instanceof Error && 'code' in err && err.code === 'ENOENT'))
        throw err
    }
    return runs
  }
  async function save(value: JourneySuite) {
    const suite = suiteSchema.parse(value)
    if (suite.id === 'baseline')
      throw new Error('Baseline updates require the explicit CLI flag')
    const temporary = path.join(directory, `.pending-${randomUUID()}`)
    await mkdir(temporary, { recursive: true })
    try {
      const serialized = JSON.stringify(suite, null, 2) + '\n'
      if (Buffer.byteLength(serialized) > 32_000_000)
        throw new Error('Journey artifact exceeds write bound')
      await writeFile(path.join(temporary, 'suite.json'), serialized, {
        flag: 'wx'
      })
      await writeFile(
        path.join(temporary, 'index.json'),
        JSON.stringify(runIndex(suite), null, 2) + '\n',
        { flag: 'wx' }
      )
      // Publish a complete immutable directory. Earlier runs are never deleted
      // or overwritten; the inspector lists the 40 most recent plus baseline.
      await rename(temporary, path.join(directory, suite.id))
      return suite
    } finally {
      await rm(temporary, { recursive: true, force: true })
    }
  }
  return { read, list, save }
}

export function projectJourneyStore() {
  return createJourneyStore(process.cwd())
}
