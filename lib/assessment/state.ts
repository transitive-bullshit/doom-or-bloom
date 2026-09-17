import type { Answer, Assessment, Disposition, PromptInstance } from './schema'
import { limits, rootPrompt, vectorIds, versions } from './schema'

export function createAssessment(
  id: string,
  model = versions.model
): Assessment {
  return {
    schemaVersion: 2,
    id,
    revision: 0,
    evidenceRevision: 0,
    versions: { ...versions, model },
    status: 'answering',
    prompts: [
      {
        id: `${id}:p1`,
        promptId: 'root',
        text: rootPrompt,
        family: 'root',
        ordinal: 1,
        variant: 'original',
        sourceEvidenceIds: []
      }
    ],
    answers: [],
    attempts: [],
    interactionHistory: [],
    judgments: [],
    evidence: [],
    referenceClaims: [],
    familiarity: { level: 'unknown', answerId: null, judgmentId: null },
    coverage: Object.fromEntries(
      vectorIds.map((v) => [v, 'unassessed'])
    ) as Assessment['coverage'],
    unresolved: [],
    recovery: {
      evaluated: 0,
      clearMisses: 0,
      paperclipShown: false,
      paperclipActive: false,
      reason: null
    },
    draft: '',
    result: null,
    eventMarkers: []
  }
}
export function currentPrompt(state: Assessment) {
  return state.prompts[state.prompts.length - 1]!
}
export function eligible(state: Assessment) {
  return state.answers.filter((a) => a.substantive).length >= 3
}
export function atCap(state: Assessment) {
  return state.prompts.length >= limits.prompts
}
export function hasAnswered(state: Assessment) {
  return state.answers.some(
    (a) => a.promptInstanceId === currentPrompt(state).id
  )
}
export function canSubmit(state: Assessment) {
  return (
    !hasAnswered(state) &&
    ['answering', 'recovery'].includes(state.status) &&
    state.recovery.evaluated < limits.recovery
  )
}
export function issuePrompt(
  state: Assessment,
  prompt: Omit<PromptInstance, 'id' | 'ordinal'>
): Assessment {
  if (atCap(state)) throw new Error('The assessment has reached its prompt cap')
  const ordinal = state.prompts.length + 1
  return {
    ...state,
    status: 'answering',
    draft: '',
    prompts: [
      ...state.prompts,
      { ...prompt, id: `${state.id}:p${ordinal}`, ordinal }
    ],
    recovery: {
      ...state.recovery,
      evaluated: 0,
      paperclipActive: false,
      reason: null
    }
  }
}
export function recordDisposition(
  state: Assessment,
  disposition: Disposition,
  confidence: number,
  requestId: string,
  nonAnswerThreshold = 0.85
): Assessment {
  const prompt = currentPrompt(state)
  if (state.attempts.some((a) => a.id === requestId)) return state
  if (disposition === 'non_answer' && confidence < nonAnswerThreshold)
    disposition = 'needs_clarification'
  const evaluated =
    state.recovery.evaluated + (disposition === 'navigation' ? 0 : 1)
  const clearMisses =
    disposition === 'non_answer'
      ? state.recovery.clearMisses + 1
      : disposition === 'navigation'
        ? state.recovery.clearMisses
        : 0
  const paperclip =
    clearMisses >= 2 &&
    !state.recovery.paperclipShown &&
    disposition === 'non_answer'
  const status =
    disposition === 'usable'
      ? 'answering'
      : paperclip ||
          evaluated >= limits.recovery ||
          disposition === 'navigation'
        ? 'paused'
        : 'recovery'
  return {
    ...state,
    status,
    attempts: [
      ...state.attempts,
      {
        id: requestId,
        promptInstanceId: prompt.id,
        variant: prompt.variant,
        disposition,
        confidence,
        evaluated: disposition !== 'navigation'
      }
    ],
    recovery: {
      evaluated,
      clearMisses,
      paperclipShown: state.recovery.paperclipShown || paperclip,
      paperclipActive: paperclip,
      reason:
        disposition === 'usable'
          ? null
          : evaluated >= limits.recovery
            ? 'exhausted'
            : disposition
    }
  }
}
export function acceptAnswer(state: Assessment, answer: Answer): Assessment {
  if (hasAnswered(state))
    throw new Error('This prompt already has an accepted answer')
  return {
    ...state,
    answers: [...state.answers, answer],
    evidenceRevision: state.evidenceRevision + 1,
    draft: '',
    recovery: {
      ...state.recovery,
      clearMisses: 0,
      paperclipActive: false,
      reason: null
    }
  }
}
export function matchesResponse(
  state: Assessment,
  response: { assessmentId: string; baseRevision: number; requestId: string },
  activeRequestId: string
) {
  return (
    state.id === response.assessmentId &&
    state.revision === response.baseRevision &&
    response.requestId === activeRequestId
  )
}
