import type { Assessment, Operation } from './schema'

export function serverSnapshot(state: Assessment) {
  const { interactionHistory: _history, draft: _draft, ...snapshot } = state
  return { ...snapshot, draft: '' }
}

export function restoreLocalInteraction(
  before: Assessment,
  next: Assessment,
  operation: Operation,
  requestId: string
): Assessment {
  const attempt = next.attempts.find((a) => a.id === requestId)
  const rejected =
    operation.type === 'answer' && attempt && attempt.disposition !== 'usable'
  const history =
    rejected &&
    !before.interactionHistory.some((a) => a.requestId === requestId)
      ? [
          ...before.interactionHistory,
          {
            requestId,
            promptInstanceId: attempt.promptInstanceId,
            text: operation.text,
            disposition: attempt.disposition
          }
        ].slice(-20)
      : before.interactionHistory
  return {
    ...next,
    interactionHistory: history,
    draft:
      rejected ||
      (operation.type !== 'answer' &&
        before.prompts.length === next.prompts.length)
        ? before.draft
        : next.draft
  }
}
