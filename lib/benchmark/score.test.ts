import { expect, test } from 'vitest'
import { versions } from '@/lib/assessment/schema'
import type { JobRecord, Step } from './interview'
import { logit } from './metrics'
import { findPersona } from './personas'
import type { AnswerStyle } from './personas'
import { briefHash } from './references'
import type { ReferenceStore } from './references'
import {
  compareRuns,
  renderComparison,
  renderScore,
  resultStep,
  scoreRun
} from './score'
import type { Shown } from './shown'

// Consensus references: casual-unsure (0.4, 0.6, 20%) and casual-doomer
// (0.1, 0.9, 50%), each the mean of one judge and one self-placement sample.
// The doomer's were built from an earlier brief.
const reference = (x: number, y: number, pdoom: number, hash: string) => ({
  name: 'Test',
  r2: {
    provenance: 'judge',
    briefHash: hash,
    samples: [{ x: x - 0.1, y, pdoom, evidence: 1 }]
  },
  r3: {
    provenance: 'self',
    briefHash: hash,
    samples: [{ x: x + 0.1, y, pdoom, wouldAnswer: true }]
  }
})
const store: ReferenceStore = {
  schemaVersion: 1,
  description: 'test',
  provenance: {
    judge: { reference: 'r2', method: 'm', createdAt: 'd', versions: {} },
    self: { reference: 'r3', method: 'm', createdAt: 'd', versions: {} }
  },
  personas: {
    'casual-unsure': reference(
      0.4,
      0.6,
      0.2,
      briefHash(findPersona('casual-unsure'))
    ),
    'casual-doomer': reference(0.1, 0.9, 0.5, 'earlier')
  }
}

const step = (
  answers: number,
  shown: Partial<Shown> | null,
  shownFrom: Step['shownFrom'] = shown ? 'inspection' : null
): Step => ({
  answers,
  promptId: `p${answers}`,
  question: 'q',
  replies: [{ text: 'three short words', disposition: 'usable' }],
  accepted: true,
  status: shownFrom === 'automatic' ? 'results' : 'answering',
  readiness: 50,
  ready: shown !== null,
  shown: shown && {
    x: null,
    y: null,
    pdoom: null,
    pdoomToken: null,
    pdoomSource: null,
    insufficient: false,
    ...shown
  },
  shownFrom
})
const record = (
  persona: string,
  style: AnswerStyle,
  steps: Step[],
  { repeat = 1, failed = false } = {}
): JobRecord => ({
  job: {
    key: `${persona}__${style}__${repeat}`,
    persona,
    group: 'casual',
    style,
    repeat
  },
  status: failed ? 'failed' : 'complete',
  startedAt: '2026-09-27T00:00:00.000Z',
  finishedAt: '2026-09-27T00:01:00.000Z',
  interview: {
    steps,
    firstReadyAt: steps.find((s) => s.ready)?.answers ?? null,
    autoStopAt: steps.find((s) => s.shownFrom === 'automatic')?.answers ?? null,
    stopReason: 'test'
  }
})
const plan = { id: 'test', set: 'core', maxAnswers: 4, versions }

// Automatic result at answer 4 with a stated 10% (vs 20%: about 2.25× off).
const unsure = record('casual-unsure', 'terse', [
  step(1, { x: 0.9, y: 0.1 }),
  step(2, null),
  step(3, { x: 0.45 }),
  step(4, { x: 0.3, y: 0.7, pdoom: 0.1, pdoomSource: 'stated' }, 'automatic')
])
// No automatic result: the last available result is scored (P(doom) 45%).
const doomer = record('casual-doomer', 'brief', [
  step(1, null),
  step(2, { x: 0.2, y: 0.8, pdoom: 0.45, pdoomSource: 'inferred' })
])
const failed = record('casual-doomer', 'terse', [], { failed: true })

test('the scored result is the automatic one, else the last one available', () => {
  expect(resultStep(unsure.interview)?.answers).toBe(4)
  expect(resultStep(doomer.interview)?.answers).toBe(2)
  expect(resultStep(failed.interview)).toBeUndefined()
})

test('a run is scored against the consensus by style and group', () => {
  const score = scoreRun(plan, [unsure, doomer, failed], store)
  expect(score.overall).toMatchObject({
    interviews: 3,
    failed: 1,
    wordsPerAnswer: 3,
    rejectedReplies: 0,
    answersToResult: { median: 4, mean: 4, withoutResult: 1 },
    firstReady: { median: 1.5, never: 0 },
    x: { placed: 2, n: 2, mae: expect.closeTo(0.1), bias: expect.closeTo(0) },
    y: { placed: 2, n: 2, mae: expect.closeTo(0.1), bias: expect.closeTo(0) },
    pdoom: {
      shown: 2,
      stated: 1,
      n: 2,
      mae: expect.closeTo(
        (Math.abs(logit(0.1) - logit(0.2)) +
          Math.abs(logit(0.45) - logit(0.5))) /
          2
      ),
      within2x: 1
    }
  })
  expect(Object.keys(score.byStyle).sort()).toEqual(['brief', 'terse'])
  expect(score.byStyle.terse).toMatchObject({ interviews: 2, failed: 1 })
  expect(score.byGroup.casual!.interviews).toBe(3)
  // After answer 1 only casual-unsure had a result, 0.5 from its reference.
  expect(score.byAnswer[0]).toMatchObject({
    answers: 1,
    n: 1,
    x: expect.closeTo(0.5)
  })
  expect(score.byAnswer.map((point) => point.answers)).toEqual([1, 2, 3, 4])
  expect(score.byReference.r2!.x.mae).toBeCloseTo(0.1)
  expect(score.byReference.r4!.pdoom.n).toBe(0)
  expect(score.references).toMatchObject({
    missing: [],
    stale: ['casual-doomer r2', 'casual-doomer r3']
  })
  expect(score.retest.x).toBeNull()
  expect(renderScore(score)).toContain('| style: terse | 2 (1 failed) |')
})

test('repeated interviews report retest variability', () => {
  const retake = (persona: string, repeat: number, x: number) =>
    record(
      persona,
      'brief',
      [step(1, { x, y: 0.5, pdoom: 0.2 }, 'automatic')],
      {
        repeat
      }
    )
  const score = scoreRun(
    plan,
    [
      retake('casual-unsure', 1, 0.4),
      retake('casual-unsure', 2, 0.5),
      retake('casual-doomer', 1, 0.1),
      retake('casual-doomer', 2, 0.2)
    ],
    store
  )
  expect(score.retest.x).toMatchObject({
    personas: 2,
    withinSd: expect.closeTo(Math.sqrt(0.005)),
    maxRange: expect.closeTo(0.1)
  })
  expect(score.retest.pdoom).toMatchObject({ withinSd: 0 })
})

test('two runs are compared pairwise with a seeded bootstrap interval', () => {
  const better = record('casual-unsure', 'terse', [
    step(1, { x: 0.4, y: 0.6, pdoom: 0.2 }, 'automatic')
  ])
  const extra = record('casual-doomer', 'detailed', [
    step(1, { x: 0.1 }, 'automatic')
  ])
  const comparison = compareRuns([unsure, doomer], [better, extra], store)
  expect(comparison.unpaired).toBe(2)
  expect(comparison.overall).toMatchObject({
    pairs: 1,
    x: {
      a: expect.closeTo(0.1),
      b: expect.closeTo(0),
      n: 1,
      diff: expect.closeTo(-0.1),
      better: 1,
      worse: 0
    },
    answersToResult: { a: 4, b: 1, diff: -3 },
    within2x: { a: 0, b: 1 },
    withoutResult: { a: 0, b: 0 }
  })
  expect(comparison.overall.x.ci).toEqual([
    expect.closeTo(-0.1),
    expect.closeTo(-0.1)
  ])
  expect(compareRuns([unsure, doomer], [better, extra], store)).toEqual(
    comparison
  )
  expect(renderComparison(comparison, { a: 'base', b: 'next' })).toContain(
    '| overall | x | 0.100 | 0.000 | 1 | -0.100 |'
  )
})
