import { expect, test } from 'vitest'
import { createAssessment } from './state'
import { tensionCandidates } from './tension'

test('pair candidates refer to exact claims once instead of duplicating long quotes quadratically', () => {
  const state = createAssessment('long-dictation')
  for (let i = 0; i < 4; i++)
    state.answers.push({
      id: `answer-${i}`,
      promptInstanceId: state.prompts[0]!.id,
      promptText: 'Question',
      text: Array.from(
        { length: 18 },
        (_, n) =>
          `Claim ${i}-${n}: ${'A meaningful conditional argument '.repeat(8)}.`
      ).join(' '),
      substantive: true,
      hasHorizon: false,
      hasConviction: false
    })
  const { pairs, indexedClaims, indexedPairs } = tensionCandidates(state)
  expect(
    new Set(Object.values(indexedClaims).map((c) => c.answerId)).size
  ).toBe(4)
  for (const [id, claimIds] of Object.entries(indexedPairs))
    expect(claimIds.map((id) => indexedClaims[id])).toEqual(pairs[id])
  const compact = JSON.stringify({
    claims: indexedClaims,
    claimPairs: indexedPairs
  }).length
  expect(compact).toBeLessThan(JSON.stringify(pairs).length / 3)
  for (const claim of Object.values(indexedClaims))
    expect(state.answers.find((a) => a.id === claim.answerId)!.text).toContain(
      claim.text
    )
})
