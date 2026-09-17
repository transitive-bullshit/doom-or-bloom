import type { Assessment } from './schema'

export function conversationTurns(state: Assessment) {
  return state.prompts.map((prompt) => {
    const answer = state.answers.find((a) => a.promptInstanceId === prompt.id)
    return {
      prompt,
      question: answer?.promptText ?? prompt.text,
      replies: [
        ...state.interactionHistory
          .filter((reply) => reply.promptInstanceId === prompt.id)
          .map((reply) => ({
            id: reply.requestId,
            text: reply.text,
            earlier: true
          })),
        ...(answer
          ? [{ id: answer.id, text: answer.text, earlier: false }]
          : [])
      ]
    }
  })
}
export type ConversationTurn = ReturnType<typeof conversationTurns>[number]
