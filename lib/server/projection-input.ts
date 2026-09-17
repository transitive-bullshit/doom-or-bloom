import type { Assessment } from '@/lib/assessment/schema'
import type { Bundle } from '@/lib/content/loader'
import { referenceMetadata, referencePolicy } from './reference-input'

// Raw participant text appears once. All support and reference links use IDs.
export function projectionInput(state: Assessment, bundle: Bundle) {
  const active = state.evidence.filter(
    (entry) => entry.status !== 'superseded' && entry.status !== 'disputed'
  )
  const usedIds = new Set([
    ...state.referenceClaims.map((claim) => claim.referenceId),
    ...active.flatMap((entry) => [
      ...entry.referenceIds,
      ...entry.contextReferenceIds
    ])
  ])
  return {
    completeParticipantEvidence: state.answers.map((answer) => ({
      id: answer.id,
      prompt: answer.promptText,
      answer: answer.text,
      correctionTarget:
        answer.correctionClaimTarget ?? answer.correctionTarget ?? null
    })),
    activeSupport: active.map(
      ({ id, answerId, vector, status, referenceIds }) => ({
        id,
        answerId,
        vector,
        status,
        referenceIds,
        claimTarget:
          state.answers.find((answer) => answer.id === answerId)
            ?.correctionClaimTarget ?? null
      })
    ),
    referenceContext: bundle.references
      .filter((reference) => usedIds.has(reference.id))
      .map((reference) => ({
        id: reference.id,
        title: reference.title,
        ...referenceMetadata(reference),
        summary: reference.summary
      })),
    referenceClaims: state.referenceClaims,
    referencePolicy,
    evidencePolicy:
      'Every usable raw answer and referenced canonical source summary is supplied once. Support records link whole answers, not specific passages. Prior judgments are interpretations, not independent evidence. Later explicit corrections supersede earlier interpretations only under the corrected scope; use activeSupport and correctionTarget to respect that scope.',
    coverage: state.coverage,
    unresolved: state.unresolved.map(({ vector, kind }) => ({ vector, kind })),
    versions: state.versions
  }
}
