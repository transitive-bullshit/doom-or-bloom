// Only controlled messages cross into participant-facing UI; never render
// server exception text. Their copy is `Errors.<code>` in messages/<locale>.json.
const codes = [
  'unauthorized',
  'not_found',
  'origin',
  'invalid_input',
  'conflict',
  'busy',
  'published',
  'results_required',
  'question_limit',
  'limited'
] as const
export type AssessmentErrorCode = (typeof codes)[number] | 'generic'

export function assessmentErrorCode(
  status: number,
  code?: unknown
): AssessmentErrorCode {
  if (typeof code === 'string' && (codes as readonly string[]).includes(code))
    return code as AssessmentErrorCode
  if (status === 401) return 'unauthorized'
  if (status === 404) return 'not_found'
  if (status === 409) return 'conflict'
  if (status === 429) return 'limited'
  return 'generic'
}
