import { expect, test } from 'vitest'
import { loadBundle, retrieveReferences, validateBundle } from './loader'
test('representative bundle is validated but remains draft', () => {
  const bundle = loadBundle()
  expect(bundle.manifest.status).toBe('draft')
  expect(bundle.references).toHaveLength(6)
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
