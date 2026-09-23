'use client'
import type { Assessment } from '@/lib/assessment/schema'
import { ResultView } from './result-view'
import { AnswerNavigationProvider } from './answer-navigation'
export function PublishedResult({ state }: { state: Assessment }) {
  return (
    <AnswerNavigationProvider
      answerIds={state.answers.map((answer) => answer.id)}
    >
      <ResultView
        state={state}
        personas={[]}
        act={() => {}}
        busy={false}
        published
        readOnly
      />
    </AnswerNavigationProvider>
  )
}
