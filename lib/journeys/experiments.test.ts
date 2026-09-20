import { expect, test } from 'vitest'
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { suiteSchema } from './schema'
import { experimentInputHash, withJourneyExperiments } from './experiments'
import {
  experimentCandidates,
  experimentInputSchema,
  buildWorldviewExperiment
} from '@/lib/assessment/worldview-experiment'

test('replayed experiments attach only to the same run, answer state and evidence revision', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'doom-experiment-overlay-'))
  try {
    const source = suiteSchema.parse(
      JSON.parse(
        await readFile('eval/development/live-persona-journeys.json', 'utf8')
      )
    )
    const journey = source.journeys[0]!
    const step = journey.steps[0]!
    const input = experimentInputSchema.parse(step.resultState)
    const experiment = buildWorldviewExperiment(
      input,
      experimentCandidates(input),
      {},
      step.result!.evidenceRevision,
      'fixture-v1'
    )
    const record = {
      personaId: journey.personaId,
      ordinal: step.ordinal,
      inputHash: experimentInputHash(input),
      experiment
    }
    const replay = {
      version: 'worldview-v1',
      sourceRunId: source.id,
      records: [record]
    }
    await mkdir(path.join(root, 'eval/development'), { recursive: true })
    const file = path.join(root, 'eval/development/worldview-experiments.json')
    await writeFile(file, JSON.stringify(replay))
    const enriched = await withJourneyExperiments(root, structuredClone(source))
    expect(enriched.journeys[0]!.steps[0]!.result!.experiment).toEqual(
      experiment
    )
    expect(enriched.journeys[0]!.steps[0]!.result!.horizontal).toEqual(
      step.result!.horizontal
    )
    expect(enriched.journeys[0]!.steps[1]!.result!.experiment).toEqual(
      source.journeys[0]!.steps[1]!.result!.experiment
    )
    for (const changed of [
      { ...replay, sourceRunId: 'a-different-run' },
      {
        ...replay,
        records: [{ ...record, inputHash: 'different-answer-state' }]
      },
      {
        ...replay,
        records: [
          { ...record, experiment: { ...experiment, evidenceRevision: 999 } }
        ]
      }
    ]) {
      await writeFile(file, JSON.stringify(changed))
      const ignored = await withJourneyExperiments(
        root,
        structuredClone(source)
      )
      expect(ignored.journeys[0]!.steps[0]!.result!.experiment).toEqual(
        step.result!.experiment
      )
    }
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
