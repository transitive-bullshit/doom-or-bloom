import { reportServerError } from './error-reporting'
import { upstreamFetch } from './upstream-fetch'
import 'server-only'
import { TypeSafeClient } from '@typesafe-ai/sdk'
import type { EntryType, Questions } from '@typesafe-ai/sdk'
import { z } from 'zod'
import {
  limits,
  modelAnswerSchema,
  questionSchema
} from '@/lib/assessment/schema'
import type { DebugRequest, Question } from '@/lib/assessment/schema'
import { EvaluationFailure } from './provider'
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
      // The API rounds scores/distributions. Include the intended boundary:
      // e.g. 0.49 - (0.36 + 2 * 0.05) is 0.030000000000000027 in JS.
      if (Math.abs(expected - answer.score) > 0.03 + 1e-9)
        throw new Error('Provider score disagrees with distribution')
    }
  }
  return { ...result, attempts }
}
export function createLiveProvider(model: string): Provider {
  return {
    kind: 'live',
    evaluate: async (
      state,
      questions,
      signal,
      attemptBudget = limits.providerAttempts,
      captureDebug = false,
      diagnosticContext = {}
    ) => {
      if (!process.env.TYPESAFE_API_KEY?.trim())
        throw new Error(
          'Add TYPESAFE_API_KEY to .env.development.local to run real assessments'
        )
      if (
        Object.keys(questions).length === 0 ||
        Object.keys(questions).length > limits.questions
      )
        throw new Error('Question budget exceeded')
      for (const question of Object.values(questions))
        questionSchema.parse(question)
      let attempts = 0
      const requests: DebugRequest[] = []
      let batchQuestionIds: string[] = []
      const requestBudget = new AbortController()
      const client = new TypeSafeClient({
        apiKey: process.env.TYPESAFE_API_KEY,
        baseURL: 'https://api.typesafe.ai',
        defaultModel: model,
        logLevel: 'off',
        timeout: 15_000,
        retry: {
          maxRetries: 1,
          httpStatuses: new Set([429, 529, 502, 503, 504]),
          backoffMaxMs: 2000,
          maxRetryAfterMs: 5000
        },
        fetch: async (url, init) => {
          if (attempts >= Math.min(limits.providerAttempts, attemptBudget)) {
            requestBudget.abort()
            requestBudget.signal.throwIfAborted()
          }
          attempts++
          const diagnostic: DebugRequest | undefined = captureDebug
            ? {
                attempt: attempts,
                model,
                questionIds: batchQuestionIds,
                elapsedMs: 0,
                status: null
              }
            : undefined
          if (diagnostic) requests.push(diagnostic)
          const started = performance.now()
          try {
            const response = await upstreamFetch(
              url,
              { ...init, cache: 'no-store' },
              {
                ...diagnosticContext,
                provider: 'TypeSafe',
                event: 'jev_call_failed',
                attempt: attempts,
                model
              }
            )
            if (diagnostic) diagnostic.status = response.status
            return response
          } finally {
            if (diagnostic)
              diagnostic.elapsedMs = Math.round(performance.now() - started)
          }
        }
      })
      const signals = [requestBudget.signal, AbortSignal.timeout(45_000)]
      if (signal) signals.push(signal)
      const boundedSignal = AbortSignal.any(signals)
      const entries = Object.entries(questions)
      // Pack questions to the byte budget instead of turning a request just
      // above the boundary into dozens of eight-question round trips.
      const oversizedState = Buffer.byteLength(JSON.stringify(state)) > 90_000
      const batches: Array<typeof entries> = []
      let pending: typeof entries = []
      for (const entry of entries) {
        const proposed = [...pending, entry]
        const bytes = Buffer.byteLength(
          JSON.stringify({ state, questions: Object.fromEntries(proposed) })
        )
        if (
          pending.length &&
          (oversizedState
            ? proposed.length > 8
            : bytes > 100_000 || proposed.length > limits.questions)
        ) {
          batches.push(pending)
          pending = []
        }
        pending.push(entry)
      }
      if (pending.length) batches.push(pending)
      const results: Evaluation[] = []
      const evaluateBatch = async (
        part: Array<[string, Question]>
      ): Promise<void> => {
        boundedSignal.throwIfAborted()
        batchQuestionIds = part.map(([id]) => id)
        const typedQuestions: Questions = Object.fromEntries(
          part.map(([id, question]) => [
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
        try {
          const raw = await client.systemOne(
            { state: state as EntryType, model, questions: typedQuestions },
            { signal: boundedSignal }
          )
          const result = validateEvaluation(raw, Object.fromEntries(part))
          if (result.model !== model)
            throw new Error('Provider returned a different model version')
          const diagnostic = requests.at(-1)
          if (diagnostic)
            diagnostic.response = {
              model: result.model,
              answers: result.answers,
              usage: result.usage
            }
          results.push(result)
        } catch (err) {
          reportServerError('jev_batch_failed', err, {
            ...diagnosticContext,
            model,
            attempts,
            stateBytes: Buffer.byteLength(JSON.stringify(state)),
            questionCount: part.length
          })
          // Batches are planned before calling Jev. A permanent overflow fails
          // the operation; recursively splitting it would add another retry layer.
          throw err
        }
      }
      try {
        for (const batch of batches) await evaluateBatch(batch)
      } catch (err) {
        throw new EvaluationFailure(
          err,
          attempts,
          captureDebug ? requests : undefined
        )
      }
      const evaluation: Evaluation = {
        model,
        answers: Object.assign({}, ...results.map((result) => result.answers)),
        usage: {
          input_tokens: results.reduce(
            (sum, result) => sum + result.usage.input_tokens,
            0
          ),
          output_tokens: results.reduce(
            (sum, result) => sum + result.usage.output_tokens,
            0
          )
        },
        attempts
      }
      if (captureDebug) evaluation.requests = requests
      return evaluation
    }
  }
}
