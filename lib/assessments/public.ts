import { currentAssessmentSchema, type Assessment } from '../assessment/schema'

// Deliberate allowlist: adding a private engine field must not publish it.
export const publicAssessmentSchema = currentAssessmentSchema.pick({
  schemaVersion: true,
  id: true,
  revision: true,
  evidenceRevision: true,
  promptCeiling: true,
  versions: true,
  status: true,
  prompts: true,
  answers: true,
  attempts: true,
  interactionHistory: true,
  judgments: true,
  evidence: true,
  referenceClaims: true,
  familiarity: true,
  coverage: true,
  unresolved: true,
  recovery: true,
  result: true
})
export function publicAssessment(state: Assessment) {
  return publicAssessmentSchema.parse({
    schemaVersion: state.schemaVersion,
    id: state.id,
    revision: state.revision,
    evidenceRevision: state.evidenceRevision,
    promptCeiling: state.promptCeiling,
    versions: state.versions,
    status: state.status,
    prompts: state.prompts,
    answers: state.answers,
    attempts: state.attempts,
    interactionHistory: state.interactionHistory,
    judgments: state.judgments,
    evidence: state.evidence,
    referenceClaims: state.referenceClaims,
    familiarity: state.familiarity,
    coverage: state.coverage,
    unresolved: state.unresolved,
    recovery: state.recovery,
    result: state.result
  })
}
