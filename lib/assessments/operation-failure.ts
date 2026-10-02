import type { Translator } from '@/i18n/translator'

// Categories for a Jev budget block: the app's own spend budget is used up, or
// TypeSafe has no credits. Both show the same over-budget notice.
const budgetFailureCategories = [
  'budget_exhausted',
  'provider_out_of_credits'
] as const
export function isBudgetFailure(category: string | null | undefined) {
  return (budgetFailureCategories as readonly unknown[]).includes(category)
}

// Interpret bounded diagnostics without exposing provider bodies or exception text.
// This also explains historical failures without rewriting their stored records.
export function operationFailureCategory(
  category: string | null,
  diagnostics: unknown
) {
  if (category !== 'evaluation_failed' || !Array.isArray(diagnostics))
    return category
  const lastCall = diagnostics.findLast(
    (entry) => entry && typeof entry === 'object' && 'status' in entry
  )
  return lastCall?.status === 403
    ? 'provider_rejected'
    : lastCall?.status === 402
      ? 'provider_out_of_credits'
      : category
}

export function operationFailureMessage(
  t: Translator,
  category: string | null
) {
  return category === 'provider_rejected'
    ? t('Interview.failure.providerRejected')
    : t('Interview.failure.saved')
}
