import { describe, expect, test } from 'vitest'
import { versions } from '@/lib/assessment/schema'
import {
  l10nProblems,
  releaseSources,
  rubricSources,
  sourceHash,
  translated,
  type L10nFile
} from './l10n'
import {
  authoredText,
  authoredTextFor,
  readRelease,
  readRubric,
  recoveryCopy
} from './l10n-loader'

const release = readRelease(versions.content)
const entry = (text: string, source: string) => ({
  text,
  sourceHash: sourceHash(source),
  model: 'test',
  translatedAt: '2026-10-01',
  reviewStatus: 'machine' as const
})

describe('authored-content translation files', () => {
  test('enumerate exact visible source keys and review requirements', () => {
    const prompt = release.prompts[0]!
    const sources = releaseSources({
      prompts: [
        {
          ...prompt,
          id: 'root',
          family: 'root',
          text: 'Root question',
          recoveryVariants: {
            reask: 'Root reask',
            clarification: 'Root clarification',
            exhausted: 'Root exhausted'
          }
        },
        {
          ...prompt,
          id: 'followup',
          family: 'risk',
          text: 'Risk question',
          recoveryVariants: {
            reask: 'Risk reask',
            clarification: 'Risk clarification',
            exhausted: 'Risk exhausted'
          }
        }
      ],
      findings: [
        { ...release.findings[0]!, id: 'finding-one', text: 'Finding text' }
      ],
      resources: [
        {
          ...release.resources[0]!,
          id: 'resource-one',
          title: 'Resource title',
          purpose: 'Resource purpose',
          question: 'Resource question',
          effort: 'Resource effort'
        },
        {
          ...release.resources[0]!,
          id: 'resource-optional',
          title: 'Optional title',
          purpose: 'Optional purpose',
          question: undefined,
          effort: 'Optional effort'
        }
      ]
    })
    expect(sources).toEqual([
      { key: 'prompt:root:text', source: 'Root question', review: true },
      { key: 'prompt:root:reask', source: 'Root reask', review: true },
      {
        key: 'prompt:root:clarification',
        source: 'Root clarification',
        review: true
      },
      { key: 'prompt:root:exhausted', source: 'Root exhausted', review: true },
      { key: 'prompt:followup:text', source: 'Risk question', review: false },
      { key: 'prompt:followup:reask', source: 'Risk reask', review: true },
      {
        key: 'prompt:followup:clarification',
        source: 'Risk clarification',
        review: true
      },
      {
        key: 'prompt:followup:exhausted',
        source: 'Risk exhausted',
        review: true
      },
      { key: 'finding:finding-one', source: 'Finding text', review: false },
      {
        key: 'resource:resource-one:title',
        source: 'Resource title',
        review: false
      },
      {
        key: 'resource:resource-one:purpose',
        source: 'Resource purpose',
        review: false
      },
      {
        key: 'resource:resource-one:question',
        source: 'Resource question',
        review: false
      },
      {
        key: 'resource:resource-one:effort',
        source: 'Resource effort',
        review: false
      },
      {
        key: 'resource:resource-optional:title',
        source: 'Optional title',
        review: false
      },
      {
        key: 'resource:resource-optional:purpose',
        source: 'Optional purpose',
        review: false
      },
      {
        key: 'resource:resource-optional:effort',
        source: 'Optional effort',
        review: false
      }
    ])
    const rubric = readRubric(versions.rubric)
    expect(
      rubricSources({
        ...rubric,
        dimensions: [
          {
            ...rubric.dimensions[0]!,
            id: 'human_agency',
            levels: ['Limited agency', 'Strong agency']
          }
        ],
        catastrophicRisk: {
          ...rubric.catastrophicRisk,
          levels: ['Low risk', 'High risk']
        }
      })
    ).toEqual([
      { key: 'level:human_agency:0', source: 'Limited agency', review: true },
      { key: 'level:human_agency:1', source: 'Strong agency', review: true },
      { key: 'level:catastrophic_risk:0', source: 'Low risk', review: true },
      { key: 'level:catastrophic_risk:1', source: 'High risk', review: true }
    ])
  })

  test('report missing, stale, extra and placeholder problems', () => {
    const sources = [
      { key: 'a', source: 'One', review: false },
      { key: 'b', source: 'Two {count}', review: false },
      { key: 'c', source: 'Three', review: false }
    ]
    const file: L10nFile = {
      locale: 'es',
      kind: 'release',
      version: 'x',
      entries: {
        a: entry('Uno', 'One (old)'),
        b: entry('Dos', 'Two {count}'),
        d: entry('Cuatro', 'Four')
      }
    }
    expect(l10nProblems(null, sources)).toEqual(['missing file'])
    expect(l10nProblems(file, sources)).toEqual([
      'stale a',
      'placeholders differ in b',
      'missing c',
      'extra d'
    ])
    // Stale translations fall back to English.
    expect(translated(file, 'a', 'One')).toBe('One')
    expect(translated(file, 'b', 'Two {count}')).toBe('Dos')
    expect(translated(null, 'b', 'Two {count}')).toBe('Two {count}')
  })

  test('load Spanish text for a pinned release and nothing in English', () => {
    expect(authoredText('en', versions)).toBeNull()
    expect(
      authoredText('es', { content: '0.1.0-draft', rubric: versions.rubric })
    ).toBeNull()
    const spanish = authoredText('es', versions)!
    expect(spanish.prompts.root).toEqual({
      source: release.prompts[0]!.text,
      text: '¿Qué crees que significa la IA para nuestro futuro y por qué?'
    })
    const trimmed = authoredTextFor('es', versions, {
      promptIds: ['root'],
      findingIds: [release.findings[0]!.id]
    })!
    expect(Object.keys(trimmed.prompts)).toEqual(['root'])
    expect(Object.keys(trimmed.findings)).toEqual([release.findings[0]!.id])
    expect(trimmed.resources).toEqual({})
    expect(trimmed.levels).toEqual(spanish.levels)
    expect(recoveryCopy('en', versions.content).root).toEqual(
      release.prompts[0]!.recoveryVariants
    )
    expect(recoveryCopy('es', versions.content).root!.reask).not.toBe(
      release.prompts[0]!.recoveryVariants.reask
    )
  })
})
