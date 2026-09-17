import { expect, test } from 'vitest'
import {
  bundleHashes,
  loadBundle,
  retrieveReferences,
  validateBundle
} from './loader'
test('representative bundle is validated but remains draft', () => {
  const bundle = loadBundle()
  expect(bundle.manifest.status).toBe('draft')
  expect(bundle.references).toHaveLength(24)
  expect(() =>
    validateBundle({
      ...bundle,
      prompts: [...bundle.prompts, bundle.prompts[0]!]
    })
  ).toThrow('Duplicate')
  expect(() =>
    validateBundle({
      ...bundle,
      manifest: { ...bundle.manifest, status: 'reviewed', reviewer: 'someone' }
    })
  ).toThrow('review')
})
test('freeze requires complete hashes and graph rejects disconnected cycles and impossible conditions', () => {
  const bundle = loadBundle()
  const reviewed = {
    ...bundle,
    questionTemplates: {
      ...bundle.questionTemplates,
      status: 'reviewed' as const
    },
    rubric: { ...bundle.rubric, status: 'reviewed' as const },
    prompts: bundle.prompts.map((p) => ({ ...p, status: 'reviewed' as const })),
    references: bundle.references.map((r) => ({
      ...r,
      status: 'reviewed' as const,
      reviewer: 'test-only'
    })),
    findings: bundle.findings.map((f) => ({
      ...f,
      status: 'reviewed' as const
    })),
    resources: bundle.resources.map((r) => ({
      ...r,
      status: 'reviewed' as const
    })),
    manifest: {
      ...bundle.manifest,
      status: 'reviewed' as const,
      reviewer: 'test-only',
      hashes: bundleHashes(bundle)
    }
  }
  expect(() => validateBundle(reviewed)).not.toThrow()
  expect(() =>
    validateBundle({
      ...reviewed,
      manifest: { ...reviewed.manifest, hashes: {} }
    })
  ).toThrow('every asset')
  const prompts = structuredClone(bundle.prompts)
  prompts[1]!.permittedAfter = ['disconnected']
  prompts[1]!.family = 'disconnected'
  expect(() => validateBundle({ ...bundle, prompts })).toThrow('Unreachable')
  const findings = structuredClone(bundle.findings)
  findings[0]!.conditions[0]!.min = 0.9
  findings[0]!.conditions[0]!.max = 0.1
  expect(() => validateBundle({ ...bundle, findings })).toThrow('Impossible')
})
test('alias boundaries avoid accidental matches and topic retrieval is not a mention', () => {
  const bundle = loadBundle()
  expect(
    retrieveReferences(bundle, 'OpenAI and GPT-4').filter((r) => r.matched)
      .length
  ).toBe(2)
  expect(retrieveReferences(bundle, 'notopenai')).toHaveLength(0)
  expect(
    retrieveReferences(bundle, 'protein structure advances', ['science'])[0]
      ?.matched
  ).toBe(false)
  expect(retrieveReferences(bundle, 'unknown incident')).toHaveLength(0)
})
