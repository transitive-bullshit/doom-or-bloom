import { expect, test } from 'vitest'
import { loadBundle } from '@/lib/content/loader'
import { corpusRelationships, questionRelationships } from './relationships'

test('question graphs preserve exact transitions, shared targets and novelty edges', () => {
  const base = loadBundle().prompts[0]!
  const prompts = [
    {
      ...base,
      id: 'selected',
      family: 'risk',
      permittedAfter: ['horizon'],
      targets: ['risk_landscape', 'human_agency'] as const,
      noveltyGroup: 'risk-group'
    },
    {
      ...base,
      id: 'next',
      family: 'action',
      permittedAfter: ['risk'],
      targets: ['human_agency', 'risk_landscape'] as const,
      noveltyGroup: 'action-group'
    },
    {
      ...base,
      id: 'previous',
      family: 'horizon',
      permittedAfter: [],
      targets: ['capability_trajectory'] as const,
      noveltyGroup: 'risk-group'
    },
    {
      ...base,
      id: 'wildcard',
      family: 'agency',
      permittedAfter: ['*'],
      targets: ['human_agency'] as const,
      noveltyGroup: 'agency-group'
    },
    {
      ...base,
      id: 'root',
      family: 'root',
      permittedAfter: ['*'],
      targets: ['beneficial_potential'] as const,
      noveltyGroup: 'root-group'
    },
    {
      ...base,
      id: 'disconnected',
      family: 'other',
      permittedAfter: [],
      targets: ['beneficial_potential'] as const,
      noveltyGroup: 'other-group'
    }
  ].map((prompt) => ({ ...prompt, targets: [...prompt.targets] }))
  expect(questionRelationships(prompts, 'selected', 'transitions')).toEqual([
    { source: 'selected', target: 'next', label: 'Permitted next family' },
    {
      source: 'previous',
      target: 'selected',
      label: 'Permitted previous family'
    },
    { source: 'selected', target: 'wildcard', label: 'Permitted next family' }
  ])
  expect(questionRelationships(prompts, 'selected', 'targets')).toEqual([
    {
      source: 'selected',
      target: 'next',
      label: 'human_agency, risk_landscape'
    },
    { source: 'selected', target: 'wildcard', label: 'human_agency' }
  ])
  expect(questionRelationships(prompts, 'selected', 'novelty')).toEqual([
    { source: 'selected', target: 'previous', label: 'risk-group' }
  ])
  for (const relation of ['transitions', 'targets', 'novelty'] as const) {
    expect(
      questionRelationships(
        prompts.filter(({ id }) => id === 'disconnected'),
        'disconnected',
        relation
      )
    ).toEqual([])
    expect(questionRelationships(prompts, 'missing', relation)).toEqual([])
  }
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
