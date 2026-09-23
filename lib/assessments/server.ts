import 'server-only'
import { getPool } from '../db'
import { loadBundle } from '../content/loader'
import { runAssessment } from '../server/engine'
import { serverEnv } from '../server/env'
import { createLiveProvider } from '../server/live-provider'
import { EvaluationFailure, createFixtureProvider } from '../server/provider'
import { limitAssessment } from '../server/limits'
import { assessmentRepository, type Evaluator } from './repository'

export function repository() {
  return assessmentRepository(getPool())
}
export const evaluateAssessment: Evaluator = async (
  assessment,
  input,
  signal,
  stats
) => {
  limitAssessment(assessment.id)
  const env = serverEnv()
  const provider =
    env.provider === 'fixture'
      ? createFixtureProvider()
      : createLiveProvider(assessment.versions.model)
  return runAssessment(
    {
      assessment,
      operation: input.operation,
      requestId: input.requestKey,
      debug: input.debug
    },
    {
      kind: provider.kind,
      evaluate: async (state, questions, signal, budget, debug, context) => {
        try {
          const result = await provider.evaluate(
            state,
            questions,
            signal,
            budget,
            true,
            context
          )
          stats.physicalRequestCount += result.attempts
          for (const call of result.requests ?? []) {
            if (call.status !== 200)
              stats.failures.push({
                stage: context?.stage ?? 'evaluation',
                status: call.status,
                attempt: call.attempt
              })
          }
          return { ...result, requests: debug ? result.requests : undefined }
        } catch (err) {
          if (err instanceof EvaluationFailure) {
            stats.physicalRequestCount += err.attempts
            for (const call of err.requests ?? []) {
              if (call.status !== 200)
                stats.failures.push({
                  stage: context?.stage ?? 'evaluation',
                  status: call.status,
                  attempt: call.attempt
                })
            }
          }
          throw err
        }
      }
    },
    loadBundle(assessment.versions.content),
    env.debug,
    signal
  )
}
