import 'server-only'
import { TypeSafeClient } from '@typesafe-ai/sdk'
import type { EntryType, Questions } from '@typesafe-ai/sdk'
import { z } from 'zod'
import {
  limits,
  modelAnswerSchema,
  questionSchema
} from '@/lib/assessment/schema'
import type { ModelAnswer, Question } from '@/lib/assessment/schema'
import type { Evaluation, Provider } from './provider'

export function validateEvaluation(
  raw: unknown,
  questions: Record<string, Question>,
  attempts = 1
): Evaluation {
  const result = z
    .object({
      model: z.string().min(1).max(80),
      answers: z.record(z.string(), modelAnswerSchema),
      usage: z.strictObject({
        input_tokens: z.number().int().min(0),
        output_tokens: z.number().int().min(0)
      })
    })
    .parse(raw)
  if (Object.keys(result.answers).length !== Object.keys(questions).length)
    throw new Error('Unexpected number of provider answers')
  for (const [id, question] of Object.entries(questions)) {
    const answer = result.answers[id]
    if (!answer || answer.type !== question.type)
      throw new Error('Provider answer does not match its question')
    if (answer.type === 'choice' && question.type === 'choice') {
      if (
        !(answer.choice in question.criteria) ||
        Object.keys(answer.probabilities).sort().join() !==
          Object.keys(question.criteria).sort().join()
      )
        throw new Error('Provider returned an unknown option')
    }
    if (answer.type === 'score' && question.type === 'score') {
      const keys = question.criteria
        .map((_, i) => String(i))
        .sort()
        .join()
      if (
        answer.score > question.criteria.length - 1 ||
        Object.keys(answer.probabilities).sort().join() !== keys ||
        Object.keys(answer.legend).sort().join() !== keys
      )
        throw new Error('Provider returned an invalid score scale')
      const expected = Object.entries(answer.probabilities).reduce(
        (sum, [level, p]) => sum + Number(level) * p,
        0
      )
      if (Math.abs(expected - answer.score) > 0.03)
        throw new Error('Provider score disagrees with distribution')
    }
  }
  return { ...result, attempts }
}
export function createLiveProvider(model: string): Provider {
  return {
    kind: 'live',
    evaluate: async (state, questions, signal) => {
      if (!process.env.TYPESAFE_API_KEY?.trim())
        throw new Error(
          'Add TYPESAFE_API_KEY to .env.local to run real assessments'
        )
      if (
        Object.keys(questions).length === 0 ||
        Object.keys(questions).length > limits.questions
      )
        throw new Error('Question budget exceeded')
      for (const question of Object.values(questions))
        questionSchema.parse(question)
      let attempts = 0
      const client = new TypeSafeClient({
        apiKey: process.env.TYPESAFE_API_KEY,
        baseURL: 'https://api.typesafe.ai',
        defaultModel: model,
        logLevel: 'off',
        timeout: 15_000,
        retry: {
          maxRetries: 2,
          httpStatuses: new Set([429, 529, 502, 503, 504]),
          backoffMaxMs: 2000,
          maxRetryAfterMs: 5000
        },
        fetch: async (url, init) => {
          attempts++
          return fetch(url, { ...init, cache: 'no-store' })
        }
      })
      const boundedSignal = signal
        ? AbortSignal.any([signal, AbortSignal.timeout(45_000)])
        : AbortSignal.timeout(45_000)
      const typedQuestions: Questions = Object.fromEntries(
        Object.entries(questions).map(([id, question]) => [
          id,
          question.type === 'score'
            ? {
                ...question,
                criteria: [
                  question.criteria[0]!,
                  question.criteria[1]!,
                  ...question.criteria.slice(2)
                ] as const
              }
            : question
        ])
      )
      const raw = await client.systemOne(
        { state: state as EntryType, model, questions: typedQuestions },
        { signal: boundedSignal }
      )
      return validateEvaluation(raw, questions, attempts)
    }
  }
}
export function choiceValue(answer: ModelAnswer | undefined) {
  return answer?.type === 'choice' ? answer.choice : null
}
