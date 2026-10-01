import type { Translator } from '@/i18n/translator'

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
  return lastCall?.status === 403 ? 'provider_rejected' : category
}

export function operationFailureMessage(
  t: Translator,
  category: string | null
) {
  return category === 'provider_rejected'
    ? t('Interview.failure.providerRejected')
    : t('Interview.failure.saved')
}
