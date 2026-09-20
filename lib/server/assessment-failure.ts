import type { DebugTrace } from '@/lib/assessment/schema'

// Only the sanitized trace crosses the HTTP boundary; never serialize causes.
export class AssessmentFailure extends Error {
  constructor(
    readonly trace: DebugTrace,
    cause: unknown
  ) {
    super(
      'The evaluator could not complete this step. Your answer is saved; please retry.',
      { cause }
    )
  }
}
