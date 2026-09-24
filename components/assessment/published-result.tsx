'use client'
import type { PersonaComparison } from '@/lib/assessment/persona-matches'
import type { Assessment } from '@/lib/assessment/schema'
import { conversationTurns } from '@/lib/assessment/conversation'
import { ConversationHistory } from './conversation'
import { ResultView } from './result-view'
import { AnswerNavigationProvider } from './answer-navigation'
export function PublishedResult({
  state,
  personas
}: {
  state: Assessment
  personas: PersonaComparison[]
}) {
  const turns = conversationTurns(state).filter(
    (turn) => turn.replies.length > 0
  )
  return (
    <AnswerNavigationProvider
      answerIds={state.answers.map((answer) => answer.id)}
    >
      <ResultView
        state={state}
        personas={personas}
        act={() => {}}
        busy={false}
        published
        readOnly
      />
      <section
        className='flex flex-col gap-4'
        aria-labelledby='full-conversation'
      >
        <h2 id='full-conversation'>Full conversation</h2>
        <div className='flex flex-col gap-8'>
          <ConversationHistory turns={turns} />
        </div>
      </section>
    </AnswerNavigationProvider>
  )
}
