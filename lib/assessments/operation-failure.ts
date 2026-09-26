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

export function operationFailureMessage(category: string | null) {
  if (category === 'provider_rejected')
    return 'Our AI provider, TypeSafe (Jev), rejected this request. Your submission is saved. Please try again later.'
  return 'Your submission is saved and your previous progress is unchanged. Please try again when you’re ready.'
}
