import { setTimeout as sleep } from 'node:timers/promises'
import { evidenceReadiness } from '@/lib/assessment/readiness'
import { limits, versions } from '@/lib/assessment/schema'
import type { Assessment, Operation } from '@/lib/assessment/schema'
import {
  atCap,
  canSubmit,
  createAssessment,
  currentPrompt
} from '@/lib/assessment/state'
import type { Bundle } from '@/lib/content/loader'
import type { Persona } from '@/lib/journeys/catalog'
import { JourneyFailure } from '@/lib/journeys/failure'
import { runAssessment } from '@/lib/server/engine'
import type { Provider } from '@/lib/server/provider'
import type { ParticipantTurn } from './participant'
import type { AnswerStyle, Job } from './personas'
import { shownResult } from './shown'
import type { Shown } from './shown'

export type Step = {
  /** Accepted answers once this question is done. */
  answers: number
  promptId: string
  question: string
  /** Every reply to this question; only the last can have been accepted. */
  replies: Array<{ text: string; disposition: string }>
  accepted: boolean
  status: Assessment['status']
  readiness: number
  ready: boolean
  /** The engine's automatic result, or what "View my results" would show. */
  shown: Shown | null
  shownFrom: 'automatic' | 'inspection' | null
}

export type Interview = {
  steps: Step[]
  firstReadyAt: number | null
  autoStopAt: number | null
  stopReason: string
}

export type JobRecord = {
  job: Job
  status: 'complete' | 'failed'
  error?: string
  startedAt: string
  finishedAt: string
  interview: Interview
}

/** The run's cost cap was reached; nothing is retried after this. */
export const isBudgetExhausted = (err: unknown) =>
  err instanceof JourneyFailure && /budget/i.test(err.message)

// Only local messages are saved or printed: journey failures are already
// categorized, and anything else is summarized rather than serialized.
export const failureMessage = (err: unknown) =>
  err instanceof JourneyFailure
    ? err.message
    : err instanceof Error && err.constructor === Error
      ? err.message.slice(0, 300)
      : 'Unexpected failure; rerun it to reproduce locally.'

// Mirrors the participant UI: clarification copy for an ambiguous reply,
// otherwise the re-ask.
function recoveryGuidance(bundle: Bundle, promptId: string, reason: string) {
  const prompt =
    bundle.prompts.find((p) => p.id === promptId) ??
    bundle.prompts.find((p) => p.id === 'root')!
  return reason === 'needs_clarification'
    ? prompt.recoveryVariants.clarification
    : prompt.recoveryVariants.reask
}

/**
 * One simulated interview through the unmodified engine in runtime mode, as
 * the assessment route runs it. Stops at the automatic result unless asked to
 * continue with the engine's own `continue` operation. After each accepted
 * answer that permits a result, an inspection projection on a copy records
 * what "View my results" would show; the interview itself is unaffected.
 */
export async function runInterview({
  id,
  persona,
  style,
  bundle,
  provider,
  answer,
  maxAnswers,
  continueAfterResult = false,
  inspect = true,
  onStep
}: {
  id: string
  persona: Persona
  style: AnswerStyle
  bundle: Bundle
  provider: Provider
  answer: (turn: ParticipantTurn) => Promise<string>
  maxAnswers: number
  continueAfterResult?: boolean
  inspect?: boolean
  onStep?: (step: Step) => void
}): Promise<Interview> {
  let state = createAssessment(id, versions.model)
  state.versions.content = bundle.manifest.contentVersion
  state.versions.rubric = bundle.manifest.rubricVersion
  let operations = 0
  // A failed operation is retried on the same saved state, like the app's
  // retry. A spent budget is final.
  const call = async (operation: Operation, assessment = state) => {
    const requestId = `${id}:op${++operations}`
    for (let attempt = 1; ; attempt++) {
      try {
        const response = await runAssessment(
          { requestId, assessment, operation, debug: false },
          provider,
          bundle,
          false,
          undefined,
          undefined,
          'runtime'
        )
        return response.assessment
      } catch (err) {
        if (attempt >= 3 || isBudgetExhausted(err)) throw err
        await sleep(2000 * attempt)
      }
    }
  }
  const interview: Interview = {
    steps: [],
    firstReadyAt: null,
    autoStopAt: null,
    stopReason: 'answer limit'
  }
  while (state.answers.length < maxAnswers) {
    if (
      state.status === 'capped' ||
      (state.status === 'results' && atCap(state))
    ) {
      interview.stopReason = 'question cap'
      break
    }
    if (state.status === 'results') {
      if (!continueAfterResult) {
        interview.stopReason = 'automatic result'
        break
      }
      state = await call({ type: 'continue' })
      if (state.status !== 'answering') {
        interview.stopReason = 'no further question'
        break
      }
    }
    const prompt = currentPrompt(state)
    const history = state.answers.map((a) => ({
      question: a.promptText,
      answer: a.text
    }))
    const before = state.answers.length
    const replies: Step['replies'] = []
    let guidance: string | null = null
    while (
      state.answers.length === before &&
      replies.length < limits.recovery &&
      canSubmit(state)
    ) {
      const text = await answer({
        persona,
        style,
        prompt: { id: prompt.id, text: prompt.text },
        history,
        recoveryGuidance: guidance
      })
      state = await call({ type: 'answer', text })
      replies.push({
        text,
        disposition: state.attempts.at(-1)?.disposition ?? 'unknown'
      })
      guidance = recoveryGuidance(
        bundle,
        prompt.promptId,
        state.recovery.reason ?? ''
      )
    }
    const accepted = state.answers.length > before
    const readiness = evidenceReadiness(state)
    if (readiness.ready) interview.firstReadyAt ??= state.answers.length
    const automatic =
      ['results', 'capped'].includes(state.status) &&
      state.result?.evidenceRevision === state.evidenceRevision
    if (automatic) interview.autoStopAt ??= state.answers.length
    let shown = automatic ? shownResult(state.result!) : null
    if (!shown && accepted && inspect && readiness.ready) {
      const inspected = await call({ type: 'project' })
      if (inspected.result) shown = shownResult(inspected.result)
    }
    const step: Step = {
      answers: state.answers.length,
      promptId: prompt.promptId,
      question: prompt.text,
      replies,
      accepted,
      status: state.status,
      readiness: readiness.value,
      ready: readiness.ready,
      shown,
      shownFrom: shown ? (automatic ? 'automatic' : 'inspection') : null
    }
    interview.steps.push(step)
    onStep?.(step)
    if (!accepted) {
      interview.stopReason = 'reply not accepted'
      break
    }
  }
  return interview
}
