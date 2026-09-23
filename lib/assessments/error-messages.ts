// Only controlled messages cross into participant-facing UI; never render server exception text.
const messages: Record<string, string> = {
  unauthorized: 'Please sign in again to access your assessments.',
  not_found: 'This assessment is no longer available.',
  origin: 'Refresh the page and try again.',
  invalid_input: 'Something went wrong. Refresh the page and try again.',
  conflict: 'This assessment has changed. Refresh the page and try again.',
  busy: 'Your answer is still being processed. Please wait a moment.',
  published:
    'Make this assessment private or continue in a new assessment to add answers.',
  results_required: 'View your results before publishing.',
  question_limit:
    'This assessment has reached its question limit. Start a new assessment.',
  limited: 'Please wait a moment and try again.'
}
export function assessmentErrorMessage(status: number, code?: unknown) {
  if (typeof code === 'string' && Object.hasOwn(messages, code))
    return messages[code]!
  if (status === 401) return messages.unauthorized!
  if (status === 404) return messages.not_found!
  if (status === 409) return messages.conflict!
  if (status === 429) return messages.limited!
  return 'Something went wrong. Please try again.'
}
