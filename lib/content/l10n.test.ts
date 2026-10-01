import { describe, expect, test } from 'vitest'
import { versions } from '@/lib/assessment/schema'
import {
  l10nKey,
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
  test('list every participant-visible string and flag the ones needing review', () => {
    const sources = releaseSources(release)
    const root = sources.find(
      ({ key }) => key === l10nKey.prompt('root', 'text')
    )!
    expect(root.review).toBe(true)
    expect(
      sources.find(({ key }) => key === l10nKey.prompt('risk.chance', 'text'))
        ?.review
    ).toBe(false)
    expect(
      sources.filter(({ key }) => key.endsWith(':reask')).every((s) => s.review)
    ).toBe(true)
    expect(
      sources.filter(({ key }) => key.startsWith('finding:'))
    ).toHaveLength(release.findings.length)
    const levels = rubricSources(readRubric(versions.rubric))
    expect(levels.every(({ review }) => review)).toBe(true)
    expect(
      levels.some(({ key }) => key.startsWith('level:catastrophic_risk:'))
    ).toBe(true)
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
    expect(Object.keys(trimmed.findings)).toHaveLength(1)
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
