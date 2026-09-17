import { expect, test } from 'vitest'
import { loadBundle } from './loader'
import { loadAuthoringContext } from './authoring-context'
import { validateRequiredSourceReview } from './release'

test('freezing requires reviewed originals and compatible reviewed snapshots', () => {
  const bundle = loadBundle()
  const { intake } = loadAuthoringContext(bundle)
  expect(() => validateRequiredSourceReview(bundle, intake)).toThrow(
    'incorporation/review is incomplete (114 originals)'
  )
  const source = intake.sources.find((s) => s.referenceIds.length)!
  const reviewed = {
    ...bundle,
    references: bundle.references.map((r) => ({
      ...r,
      status: 'reviewed' as const,
      reviewer: 'test-only'
    }))
  }
  const labeled = {
    ...intake,
    sources: [{ ...source, status: 'reviewed' as const }]
  }
  expect(() => validateRequiredSourceReview(reviewed, labeled)).not.toThrow()
  expect(() =>
    validateRequiredSourceReview(reviewed, {
      ...labeled,
      sources: [{ ...labeled.sources[0]!, referenceIds: ['unknown.reference'] }]
    })
  ).toThrow('incomplete')
  expect(() =>
    validateRequiredSourceReview(reviewed, {
      ...labeled,
      sources: [{ ...labeled.sources[0]!, referenceIds: [] }]
    })
  ).toThrow('incomplete')
})
