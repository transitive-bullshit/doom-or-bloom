import type { Assessment, ModelAnswer, Question } from '@/lib/assessment/schema'
import type { Bundle } from '@/lib/content/loader'
import { referenceMetadata, referencePolicy } from './reference-input'

// Short IDs remove transport bookkeeping; original text and source facts remain exact.
export function projectionInput(
  state: Assessment,
  bundle: Bundle,
  questions: Record<string, Question>
) {
  const answerIds = new Map(state.answers.map((a, i) => [a.id, `a${i}`]))
  const active = state.evidence.filter(
    (e) => e.status !== 'superseded' && e.status !== 'disputed'
  )
  const evidenceIds = new Map(active.map((e, i) => [e.id, `e${i}`]))
  const originals = new Map(
    Array.from(evidenceIds, ([id, alias]) => [alias, id])
  )
  const usedIds = new Set([
    ...state.referenceClaims.map((c) => c.referenceId),
    ...active.flatMap((e) => [...e.referenceIds, ...e.contextReferenceIds])
  ])
  const references = bundle.references.filter((r) => usedIds.has(r.id))
  const referenceIds = new Map(references.map((r, i) => [r.id, `r${i}`]))
  const input = {
    completeParticipantEvidence: state.answers.map((a) => ({
      id: answerIds.get(a.id),
      prompt: a.promptText,
      answer: a.text,
      correctionTarget: a.correctionClaimTarget ?? a.correctionTarget ?? null
    })),
    referenceContext: references.map((r) => ({
      id: referenceIds.get(r.id),
      canonicalId: r.id,
      title: r.title,
      ...referenceMetadata(r),
      summary: r.summary
    })),
    referencePolicy,
    evidencePolicy:
      'Every usable raw answer and referenced canonical source summary is supplied. Prior scores and judgments are not independent evidence. Later explicit corrections supersede earlier interpretations under the corrected scope. Evidence-choice candidates are exact active excerpts, never generated summaries.',
    coverage: state.coverage,
    unresolved: state.unresolved.map(({ vector, kind }) => ({ vector, kind })),
    versions: state.versions
  }
  const providerQuestions = Object.fromEntries(
    Object.entries(questions).map(([id, question]) => [
      id,
      id.endsWith(':evidence') && question.type === 'choice'
        ? {
            ...question,
            criteria: Object.fromEntries(
              Object.entries(question.criteria).map(([key, text]) => [
                evidenceIds.get(key) ?? key,
                text
              ])
            )
          }
        : question
    ])
  )
  const restore = (answers: Record<string, ModelAnswer>) =>
    Object.fromEntries(
      Object.entries(answers).map(([id, answer]) => [
        id,
        id.endsWith(':evidence') && answer.type === 'choice'
          ? {
              ...answer,
              choice: originals.get(answer.choice) ?? answer.choice,
              probabilities: Object.fromEntries(
                Object.entries(answer.probabilities).map(([key, p]) => [
                  originals.get(key) ?? key,
                  p
                ])
              )
            }
          : answer
      ])
    )
  return {
    input,
    providerQuestions,
    restore,
    aliases: Object.fromEntries(originals)
  }
}
