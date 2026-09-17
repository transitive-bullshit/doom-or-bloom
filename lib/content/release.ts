import type { Bundle } from './loader'
import type { loadAuthoringContext } from './authoring-context'

type Intake = ReturnType<typeof loadAuthoringContext>['intake']

export function validateRequiredSourceReview(bundle: Bundle, intake: Intake) {
  const unresolved = intake.sources.filter(
    (source) =>
      source.requiredForInitialCorpus &&
      (source.status !== 'reviewed' ||
        !source.referenceIds.length ||
        source.referenceIds.some(
          (id) =>
            !bundle.references.some(
              (reference) =>
                reference.id === id &&
                reference.status === 'reviewed' &&
                reference.reviewer
            )
        ))
  )
  if (unresolved.length)
    throw new Error(
      `Required source incorporation/review is incomplete (${unresolved.length} originals). Resolve access, compatible mappings and human review before freezing.`
    )
}
