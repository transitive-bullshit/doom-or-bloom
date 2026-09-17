// Keep retired authored IDs available for validating historical prompt instances,
// but exclude them before routing judgments in every supported saved corpus.
const retired = {
  'grounding.source':
    'Retired after user feedback: asks for citation location rather than a useful belief.',
  'tension.general':
    'Retired: vague reconciliation request without naming an actual tension.',
  'control.failuremode':
    'Retired: assumes a proposed oversight method without establishing one.',
  'crux.test':
    'Retired: vague request to design a test for an unspecified assumption.'
} as const

export function retiredPromptReason(id: string) {
  return Object.entries(retired).find(([key]) => key === id)?.[1] ?? null
}

export const participantQuestionPolicy =
  'Prefer one concrete, answerable question that elicits a belief, expectation, mechanism, value, uncertainty or update condition. Never reward a request merely for eliciting a URL or citation location. A candidate that presupposes an example, oversight method, causal chain, assumption or tension not actually expressed in participantEvidence has zero benefit on every routing dimension. Technical familiarity alone does not establish these premises. Avoid redundancy; honest uncertainty is a useful answer.'
