import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { corpusRelationships, questionRelationships } from './relationships'

test('question graphs distinguish family transitions, shared targets and novelty with retired destinations excluded', () => {
  const { prompts } = loadBundle()
  const transitions = questionRelationships(prompts, 'root', 'transitions')
  expect(transitions.length).toBeGreaterThan(0)
  expect(
    transitions.every(
      (edge) => edge.source === 'root' && edge.target !== 'root'
    )
  ).toBe(true)
  expect(transitions.some((edge) => edge.target === 'grounding.source')).toBe(
    false
  )
  const shared = questionRelationships(prompts, 'root', 'targets')
  const root = prompts.find((prompt) => prompt.id === 'root')!
  expect(
    shared.every((edge) =>
      prompts
        .find((prompt) => prompt.id === edge.target)!
        .targets.some((target) => root.targets.includes(target))
    )
  ).toBe(true)
  expect(questionRelationships(prompts, 'missing', 'novelty')).toEqual([])
})
test('corpus graph retains direction and authored relationship types on both sides of an entry', () => {
  const { references } = loadBundle()
  const connected = references.find(
    (reference) => reference.entities.length && reference.related.length
  )!
  const edges = corpusRelationships(references, connected.id)
  expect(edges).toContainEqual({
    source: connected.id,
    target: connected.entities[0],
    label: 'Associated entity'
  })
  expect(edges).toContainEqual({
    source: connected.id,
    target: connected.related[0],
    label: 'Authored related entry'
  })
  const incoming = corpusRelationships(references, connected.entities[0]!)
  expect(incoming).toContainEqual({
    source: connected.id,
    target: connected.entities[0],
    label: 'Associated entity'
  })
  expect(
    edges.every(
      (edge) => edge.source === connected.id || edge.target === connected.id
    )
  ).toBe(true)
})
