import type { Rubric } from '@/lib/content/schema'
import { epistemicIds } from './schema'
import type { Assessment, ModelAnswer, Question } from './schema'

// Exact substrings, with offsets; bounded candidates never masquerade as a full transcript.
export function evidenceExcerpts(state: Assessment, maximum = 96) {
  const perAnswer = Math.max(
    1,
    Math.floor(maximum / Math.max(1, state.answers.length))
  )
  const all = state.answers.flatMap((answer) => {
    const spans: Array<{
      answerId: string
      text: string
      start: number
      end: number
    }> = []
    const matches = answer.text.matchAll(/[^.!?;]+[.!?;]*\s*/g)
    for (const match of matches) {
      const start = match.index
      for (let offset = 0; offset < match[0].length; offset += 350) {
        const text = match[0].slice(offset, offset + 350)
        if (text.trim().length >= 12)
          spans.push({
            answerId: answer.id,
            text,
            start: start + offset,
            end: start + offset + text.length
          })
      }
    }
    if (spans.length <= perAnswer) return spans
    return Array.from(
      { length: perAnswer },
      (_, i) =>
        spans[
          Math.round((i * (spans.length - 1)) / Math.max(1, perAnswer - 1))
        ]!
    )
  })
  return Object.fromEntries(
    all.map((span, index) => [`excerpt_${index}`, span])
  )
}

export function reasoningEvidenceQuestions(
  answers: Record<string, ModelAnswer>,
  excerpts: ReturnType<typeof evidenceExcerpts>,
  rubric: Rubric
): Record<string, Question> {
  return Object.fromEntries(
    epistemicIds.flatMap((vector) => {
      const score = answers[`${vector}:score`]
      if (score?.type !== 'score' || score.score / 3 >= 0.85) return []
      const dimension = rubric.dimensions.find((d) => d.id === vector)!
      const level = Number(
        Object.entries(score.probabilities).sort((a, b) => b[1] - a[1])[0]![0]
      )
      const reading = dimension.levels[level]!
      return [
        [
          `${vector}:excerpt`,
          {
            type: 'choice',
            instructions: `Does a supplied exact excerpt substantiate this authored reading of ${dimension.label}: ${reading} Check the complete transcript, conditions and corrections. Do not rationalize a score. A passage must demonstrate the reading, not simply mention the topic. Missing discussion, dictation errors and writing polish are not defects. For a negative reading, select none unless the passage demonstrates the defect; for a positive reading, select actual supporting reasoning. None is required if no candidate substantiates the reading.`,
            criteria: {
              none: 'No supplied excerpt substantiates this reading.',
              ...Object.fromEntries(
                Object.keys(excerpts).map((id) => [
                  id,
                  `Exact source passage in excerpts.${id}`
                ])
              )
            }
          } satisfies Question
        ]
      ]
    })
  )
}
