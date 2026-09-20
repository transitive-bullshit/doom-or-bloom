import 'server-only'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import { worldviewExperimentSchema } from '@/lib/assessment/schema'
import { experimentInputSchema } from '@/lib/assessment/worldview-experiment'
import type { JourneySuite } from './schema'

export const experimentReplaySchema = z.object({
  version: z.literal('worldview-v1'),
  sourceRunId: z.string(),
  records: z
    .array(
      z.object({
        personaId: z.string(),
        ordinal: z.number().int(),
        inputHash: z.string(),
        experiment: worldviewExperimentSchema
      })
    )
    .max(240)
})
export function experimentInputHash(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(experimentInputSchema.parse(value)))
    .digest('hex')
}

// Overlay only exact saved snapshots. Historical base scores and provenance stay intact.
export async function withJourneyExperiments(
  root: string,
  suite: JourneySuite
) {
  let replay
  try {
    replay = experimentReplaySchema.parse(
      JSON.parse(
        await readFile(
          path.join(root, 'eval/development/worldview-experiments.json'),
          'utf8'
        )
      )
    )
  } catch (err) {
    if (err instanceof Error && 'code' in err && err.code === 'ENOENT')
      return suite
    throw err
  }
  if (replay.sourceRunId !== suite.id) return suite
  for (const journey of suite.journeys) {
    for (const step of journey.steps) {
      if (
        !step.result ||
        !experimentInputSchema.safeParse(step.resultState).success
      )
        continue
      const record = replay.records.find(
        (r) =>
          r.personaId === journey.personaId &&
          r.ordinal === step.ordinal &&
          r.inputHash === experimentInputHash(step.resultState) &&
          r.experiment.evidenceRevision === step.result!.evidenceRevision
      )
      if (!record) continue
      step.result.experiment = record.experiment
      if (journey.result?.evidenceRevision === step.result.evidenceRevision)
        journey.result.experiment = record.experiment
    }
  }
  return suite
}
