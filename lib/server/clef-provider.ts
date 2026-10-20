// Cloudflare Clef as a decision-model provider, evaluated on 2026-10-20 and
// not adopted (docs/research/cloudflare-system-one-spike-2026-10-20.md). Clef
// implements the same System One question types as Jev (noul, choice, score)
// and returns the same answer shapes, so the engine runs unchanged; only the
// transport, question IDs, batching limits and pinned model differ.
//
// Limits that differ from Jev (docs checked 2026-10-20):
// - 64 questions per request (Jev: 96 per stage, batched by bytes here);
// - Score rubrics of 2-10 levels (every authored Score has <= 5);
// - 65,536 tokens of context, and long text state is TRUNCATED silently
//   rather than rejected, so batches stay well under the window.
import { limits, questionSchema } from '@/lib/assessment/schema'
import type { DebugRequest, Question } from '@/lib/assessment/schema'
import { validateEvaluation } from './live-provider'
import {
  EvaluationFailure,
  EvaluationRequestBudgetExhausted,
  type Evaluation,
  type Provider
} from './provider'
import {
  runWorkersAiWithRetry,
  type WorkersAiModel,
  type WorkersAiOptions
} from './workers-ai'

const clefQuestionLimit = 64
// About 25k tokens of JSON, leaving the window for question text.
const clefByteLimit = 100_000

export function createClefProvider(
  model: 'clef' | 'clef-flash' = 'clef',
  {
    onUsage,
    run = runWorkersAiWithRetry
  }: {
    onUsage?: (usage: Evaluation['usage']) => void
    /** Injected for tests. */
    run?: <T>(
      model: WorkersAiModel,
      body: unknown,
      options?: WorkersAiOptions
    ) => Promise<{ output: T; elapsedMs: number; attempts: number }>
  } = {}
): Provider {
  const modelId: WorkersAiModel =
    model === 'clef' ? '@cf/cloudflare/clef' : '@cf/cloudflare/clef-flash'
  return {
    kind: 'live',
    model,
    evaluate: async (
      state,
      questions,
      signal,
      attemptBudget = limits.providerAttempts,
      captureDebug = false
    ) => {
      const entries = Object.entries(questions)
      if (!entries.length || entries.length > limits.questions)
        throw new Error('Question budget exceeded')
      for (const question of Object.values(questions))
        questionSchema.parse(question)
      const batches: Array<Array<[string, Question]>> = []
      let pending: Array<[string, Question]> = []
      for (const entry of entries) {
        const proposed = [...pending, entry]
        const bytes = Buffer.byteLength(
          JSON.stringify({ state, questions: Object.fromEntries(proposed) })
        )
        if (
          pending.length &&
          (bytes > clefByteLimit || proposed.length > clefQuestionLimit)
        ) {
          batches.push(pending)
          pending = []
        }
        pending.push(entry)
      }
      if (pending.length) batches.push(pending)
      let attempts = 0
      const requests: DebugRequest[] = []
      const results: Evaluation[] = []
      try {
        for (const part of batches) {
          signal?.throwIfAborted()
          if (attempts >= Math.min(limits.providerAttempts, attemptBudget))
            throw new EvaluationRequestBudgetExhausted()
          const diagnostic: DebugRequest = {
            attempt: attempts + 1,
            model,
            questionIds: part.map(([id]) => id),
            elapsedMs: 0,
            status: null
          }
          // Clef IDs allow only [A-Za-z0-9_.-]; ours use ':', so alias them.
          const aliases = part.map((_, i) => `q${i}`)
          const response = await run<{
            model: string
            answers: Record<string, unknown>
            usage: Evaluation['usage']
          }>(
            modelId,
            {
              model,
              state,
              questions: Object.fromEntries(
                part.map(([, question], i) => [aliases[i], question])
              )
            },
            { signal, timeoutMs: 30_000 }
          )
          attempts += response.attempts
          const raw = {
            ...response.output,
            answers: Object.fromEntries(
              part.map(([id], i) => [
                id,
                response.output.answers?.[aliases[i]!]
              ])
            )
          }
          onUsage?.(raw.usage)
          if ((raw.usage?.input_tokens ?? 0) > 60_000)
            throw new Error(
              'Clef request near its context window; state may be truncated'
            )
          const result = validateEvaluation(raw, Object.fromEntries(part))
          if (result.model !== model)
            throw new Error('Provider returned a different model version')
          diagnostic.elapsedMs = response.elapsedMs
          diagnostic.status = 200
          diagnostic.response = {
            model: result.model,
            answers: result.answers,
            usage: result.usage
          }
          if (captureDebug) requests.push(diagnostic)
          results.push(result)
        }
      } catch (err) {
        throw new EvaluationFailure(
          err,
          Math.max(1, attempts),
          captureDebug ? requests : undefined
        )
      }
      const evaluation: Evaluation = {
        model,
        answers: Object.assign({}, ...results.map((r) => r.answers)),
        usage: {
          input_tokens: results.reduce((n, r) => n + r.usage.input_tokens, 0),
          output_tokens: results.reduce((n, r) => n + r.usage.output_tokens, 0)
        },
        attempts
      }
      if (captureDebug) evaluation.requests = requests
      return evaluation
    }
  }
}
