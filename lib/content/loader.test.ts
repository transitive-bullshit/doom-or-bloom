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
test('content releases are pinned and unsupported paths are rejected', () => {
  const previous = loadBundle('0.2.0-draft')
  const expanded = loadBundle('0.3.0-draft')
  const current = loadBundle()
  expect(previous.manifest.contentVersion).toBe('0.2.0-draft')
  expect(current.manifest.contentVersion).toBe('0.4.0-draft')
  expect(
    expanded.references.some((r) => r.id === 'event.openai-hugging-face-2026')
  ).toBe(false)
  expect(
    current.references.find((r) => r.id === 'event.openai-hugging-face-2026')
  ).toEqual(
    expect.objectContaining({ kind: 'event', date: '2026-07', status: 'draft' })
  )
  expect(
    previous.references.some(
      (r) => r.id === 'publication.ai-as-normal-technology-2025'
    )
  ).toBe(false)
  expect(
    current.references.some(
      (r) => r.id === 'publication.ai-as-normal-technology-2025'
    )
  ).toBe(true)
  expect(() => loadBundle('../manifest')).toThrow('unavailable')
  expect(() => loadBundle('0.1.0-draft')).toThrow('unavailable')
  expect(Object.keys(bundleHashes(current))).toContain(
    'releases/0.4.0-draft/provenance.json'
  )
  expect(Object.keys(bundleHashes(current))).not.toContain(
    'releases/0.4.0-draft/manifest.json'
  )
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
  expect(
    retrieveReferences(bundle, 'Hugging Face incident')
      .filter((entry) => entry.matched)
      .map((entry) => entry.reference.id)
      .sort()
  ).toEqual([
    'event.openai-hugging-face-2026',
    'report.metr-hugging-face-investigation-2026',
    'report.openai-hugging-face-road-ahead-2026'
  ])
  expect(
    retrieveReferences(loadBundle('0.3.0-draft'), 'Hugging Face incident')
      .filter((entry) => entry.matched)
      .map((entry) => entry.reference.id)
      .sort()
  ).toEqual([
    'report.metr-hugging-face-investigation-2026',
    'report.openai-hugging-face-road-ahead-2026'
  ])
  expect(
    retrieveReferences(bundle, 'an unnamed risk', ['risk'])[0]?.reference.id
  ).toMatch(/2026$/)
  expect(
    retrieveReferences(bundle, 'The Off-Switch Game', ['risk'])[0]?.matched
  ).toBe(true)
})
