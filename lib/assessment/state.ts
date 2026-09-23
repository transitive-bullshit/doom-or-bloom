import { evidenceReadiness } from './readiness'
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
    promptCeiling: limits.prompts,
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
  return evidenceReadiness(state).ready
}
export function promptLimit(state: Pick<Assessment, 'promptCeiling'>) {
  return state.promptCeiling ?? limits.prompts
}
export function atCap(state: Assessment) {
  return state.prompts.length >= promptLimit(state)
}
export function forkAssessment(source: Assessment, id: string): Assessment {
  if (source.prompts.length >= limits.maxPrompts)
    throw new Error(
      'This conversation has reached 30 questions. Start a new assessment.'
    )
  return {
    ...structuredClone(source),
    id,
    revision: 0,
    draft: '',
    eventMarkers: [],
    promptCeiling: Math.min(
      source.prompts.length + limits.prompts,
      limits.maxPrompts
    ),
    status: 'results',
    recovery: { ...source.recovery, paperclipActive: false }
  }
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
  nonAnswerThreshold = 0.85,
  paperclipRequested = false
): Assessment {
  const prompt = currentPrompt(state)
  if (state.attempts.some((a) => a.id === requestId)) return state
  if (disposition === 'non_answer' && confidence < nonAnswerThreshold)
    disposition = 'needs_clarification'
  const clearMisses =
    disposition === 'non_answer'
      ? state.recovery.clearMisses + 1
      : disposition === 'navigation'
        ? state.recovery.clearMisses
        : 0
  const paperclip =
    (paperclipRequested || clearMisses >= 2) &&
    !state.recovery.paperclipShown &&
    disposition === 'non_answer'
  const countsAsEvaluation = disposition !== 'navigation' && !paperclip
  const evaluated = state.recovery.evaluated + Number(countsAsEvaluation)
  const status =
    disposition === 'usable'
      ? 'answering'
      : evaluated >= limits.recovery || disposition === 'navigation'
        ? 'recovery'
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
        evaluated: countsAsEvaluation
      }
    ],
    recovery: {
      evaluated,
      clearMisses,
      paperclipShown: state.recovery.paperclipShown || paperclip,
      paperclipActive: paperclip,
      reason: paperclip
        ? 'paperclips'
        : disposition === 'usable'
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
    result: null,
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
