import type {
  DebugRequest,
  ModelAnswer,
  Question
} from '@/lib/assessment/schema'
export type Evaluation = {
  model: string
  answers: Record<string, ModelAnswer>
  usage: { input_tokens: number; output_tokens: number }
  attempts: number
  requests?: DebugRequest[]
}
// Carries only typed diagnostics; the original error remains transient and is never serialized.
export class EvaluationFailure extends Error {
  readonly status?: number
  constructor(
    cause: unknown,
    readonly attempts: number,
    readonly requests?: DebugRequest[]
  ) {
    super('Evaluation failed', { cause })
    if (
      cause instanceof Error &&
      'status' in cause &&
      typeof cause.status === 'number'
    )
      this.status = cause.status
  }
}

export interface Provider {
  kind: 'live' | 'fixture'
  evaluate(
    state: unknown,
    questions: Record<string, Question>,
    signal?: AbortSignal,
    attemptBudget?: number,
    captureDebug?: boolean
  ): Promise<Evaluation>
}

export function fixtureAnswer(
  question: Question,
  option?: string,
  level = 2
): ModelAnswer {
  if (question.type === 'noul') return { type: 'noul', noul: 0.8 }
  if (question.type === 'choice') {
    const keys = Object.keys(question.criteria)
    const choice =
      option && keys.includes(option)
        ? option
        : keys.includes('usable')
          ? 'usable'
          : keys.includes('stated')
            ? 'stated'
            : keys.includes('none')
              ? 'none'
              : keys[0]!
    return {
      type: 'choice',
      choice,
      confidence: 1,
      probabilities: Object.fromEntries(
        keys.map((key) => [key, key === choice ? 1 : 0])
      )
    }
  }
  level = Math.min(level, question.criteria.length - 1)
  return {
    type: 'score',
    score: level,
    confidence: 1,
    legend: Object.fromEntries(
      question.criteria.map((text, i) => [String(i), text])
    ),
    probabilities: Object.fromEntries(
      question.criteria.map((_, i) => [String(i), i === level ? 1 : 0])
    )
  }
}
export function createFixtureProvider(): Provider {
  return {
    kind: 'fixture',
    evaluate: async (_state, questions) => ({
      model: 'fixture-v1',
      usage: { input_tokens: 0, output_tokens: 0 },
      attempts: 1,
      answers: Object.fromEntries(
        Object.entries(questions).map(([id, question]) => [
          id,
          ['horizon', 'horizon_unknown', 'conviction'].includes(id) &&
          question.type === 'noul'
            ? { type: 'noul', noul: 0 }
            : fixtureAnswer(question)
        ])
      )
    })
  }
}
