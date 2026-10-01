'use client'
import type { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import type { PersonaComparison } from '@/lib/assessment/persona-matches'
import type { Assessment } from '@/lib/assessment/schema'
import { conversationTurns } from '@/lib/assessment/conversation'
import { ConversationHistory } from './conversation'
import { ResultView } from './result-view'
import { AnswerNavigationProvider } from './answer-navigation'
export function PublishedResult({
  state,
  personas,
  afterResults
}: {
  state: Assessment
  personas: PersonaComparison[]
  /** Rendered between the results and the full conversation. */
  afterResults?: ReactNode
}) {
  const t = useTranslations('Conversation')
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
      {afterResults}
      <section
        className='flex flex-col gap-4'
        aria-labelledby='full-conversation'
      >
        <h2 id='full-conversation'>{t('fullConversation')}</h2>
        <div className='flex flex-col gap-8'>
          <ConversationHistory turns={turns} />
        </div>
      </section>
    </AnswerNavigationProvider>
  )
}
