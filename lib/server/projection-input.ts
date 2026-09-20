import type { Assessment } from '@/lib/assessment/schema'
import type { Bundle } from '@/lib/content/loader'

// Raw participant text appears once. Whole-answer support links use IDs.
export function projectionInput(state: Assessment, bundle: Bundle) {
  const active = state.evidence.filter(
    (entry) => entry.status !== 'superseded' && entry.status !== 'disputed'
  )
  return {
    completeParticipantEvidence: state.answers.map((answer) => ({
      id: answer.id,
      prompt: answer.promptText,
      answer: answer.text,
      correctionTarget:
        answer.correctionClaimTarget ?? answer.correctionTarget ?? null
    })),
    activeSupport: active.map(({ id, answerId, vector, status }) => ({
      id,
      answerId,
      vector,
      status,
      claimTarget:
        state.answers.find((answer) => answer.id === answerId)
          ?.correctionClaimTarget ?? null
    })),
    dimensionDefinitions: Object.fromEntries(
      bundle.rubric.dimensions.map(({ id, label, meaning }) => [
        id,
        { label, meaning }
      ])
    ),
    evidencePolicy:
      'Every usable raw answer is supplied once. Use dimensionDefinitions to interpret dimension IDs. Assess only the participant’s expressed account; no external facts or corpus summaries are supplied, and this is not a fact-check. Support records link whole answers, not specific passages. Prior judgments are interpretations, not independent evidence. Spoken disfluencies, transcription errors, informal wording and verbosity are not reasoning defects. Distinguish near-term misuse from longer-term control, desired safeguards from predicted success, and conditional branches from contradictions. Judge each reasoning dimension on its own observable evidence; do not propagate a suspected flaw across dimensions. Lack of a discussion is missing evidence, not a demonstrated weakness. Later explicit corrections supersede earlier interpretations only under the corrected scope; use activeSupport and correctionTarget to respect that scope.',
    coverage: state.coverage,
    versions: state.versions
  }
}
