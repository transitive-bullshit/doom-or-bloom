export type AnswerOrder = 'default' | 'high' | 'low'

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
export function isJevAnswerRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    record(value) &&
    Object.keys(value).length > 0 &&
    Object.values(value).every(
      (answer) =>
        record(answer) &&
        ['choice', 'score', 'noul'].includes(String(answer.type))
    )
  )
}
export function containsJevAnswers(value: unknown) {
  const pending: unknown[] = [value]
  const visited = new WeakSet<object>()
  while (pending.length) {
    const next = pending.pop()
    if (next === null || typeof next !== 'object' || visited.has(next)) continue
    visited.add(next)
    if (record(next) && isJevAnswerRecord(next.answers)) return true
    pending.push(...Object.values(next))
  }
  return false
}
export function orderAnswerEntries(
  value: Record<string, unknown>,
  order: AnswerOrder
) {
  const entries = Object.entries(value)
  if (order === 'default') return entries
  const confidence = (answer: unknown) =>
    record(answer) &&
    typeof answer.confidence === 'number' &&
    Number.isFinite(answer.confidence)
      ? answer.confidence
      : null
  return entries.sort(([, left], [, right]) => {
    const a = confidence(left),
      b = confidence(right)
    if (a === null) return b === null ? 0 : 1
    if (b === null) return -1
    return order === 'high' ? b - a : a - b
  })
}
