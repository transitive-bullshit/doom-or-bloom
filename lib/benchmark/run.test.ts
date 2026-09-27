import { expect, test } from 'vitest'
import { versions } from '@/lib/assessment/schema'
import { estimateReferenceCost, estimateRunCost } from './cost'
import { loadPersonaSets } from './personas'
import { planRun } from './run'

const options = {
  set: 'core',
  maxAnswers: 12,
  continueAfterResult: false,
  inspect: true
}

test('a plan fixes the interviews, versions and hashes a run is resumed against', () => {
  const plan = planRun(loadPersonaSets(), options, 'test-plan')
  expect(plan).toMatchObject({
    id: 'test-plan',
    personaSets: 'benchmark-personas-v1',
    versions,
    participantModel: 'gpt-5.6-sol'
  })
  expect(plan.jobs).toHaveLength(86)
  expect(Object.keys(plan.hashes).sort()).toEqual([
    'contentHash',
    'engineHash',
    'inputHash',
    'participantHash'
  ])
  const narrowed = planRun(
    loadPersonaSets(),
    { ...options, personas: ['casual-unsure'], styles: ['terse'] },
    'smoke'
  )
  expect(narrowed.jobs.map((job) => job.key)).toEqual([
    'casual-unsure__terse__1'
  ])
  expect(narrowed.hashes.inputHash).not.toBe(plan.hashes.inputHash)
  expect(narrowed.hashes.engineHash).toBe(plan.hashes.engineHash)
})

test('the dry-run estimate covers a typical and a worst-case run', () => {
  const jobs = planRun(loadPersonaSets(), options, 'estimate').jobs
  // 64 terse or brief and 22 detailed interviews of about five answers.
  expect(estimateRunCost(jobs, options)).toEqual({
    interviews: 86,
    typicalAnswers: 5,
    typicalUsd: expect.closeTo(6.551, 3),
    maximumUsd: expect.closeTo(15.722, 3)
  })
  const smoke = estimateRunCost([{ style: 'terse' }], {
    ...options,
    maxAnswers: 3
  })
  expect(smoke.typicalUsd).toBeCloseTo(0.0411, 4)
  expect(smoke.maximumUsd).toBe(smoke.typicalUsd)
  expect(
    estimateRunCost(jobs, { ...options, inspect: false }).typicalUsd
  ).toBeLessThan(6.551)
  expect(
    estimateRunCost(jobs, { ...options, continueAfterResult: true }).typicalUsd
  ).toBeCloseTo(15.722, 3)
  expect(estimateReferenceCost(163, { r1: 3, r2: 2, r3: 3 })).toBeCloseTo(
    163 * (3 * 0.004 + 2 * 0.009 + 3 * 0.008)
  )
  expect(estimateReferenceCost(163, {})).toBe(0)
})
