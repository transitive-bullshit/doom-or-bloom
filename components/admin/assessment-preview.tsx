'use client'
import type { Assessment } from '@/lib/assessment/schema'
import type { PersonaComparison } from '@/lib/assessment/persona-matches'
import { conversationTurns } from '@/lib/assessment/conversation'
import { ConversationHistory } from '@/components/assessment/conversation'
import { ResultView } from '@/components/assessment/result-view'
import { AnswerNavigationProvider } from '@/components/assessment/answer-navigation'
import { AssessmentPage } from '@/components/assessment/assessment-page'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

export function AdminAssessmentPreview({
  state,
  personas
}: {
  state: Assessment
  personas: PersonaComparison[]
}) {
  return (
    <AssessmentPage className='mx-auto w-full max-w-5xl py-4'>
      <AnswerNavigationProvider
        answerIds={state.answers.map((answer) => answer.id)}
      >
        <Tabs
          defaultValue={state.result ? 'results' : 'conversation'}
          className='gap-8'
        >
          <TabsList aria-label='Participant view'>
            <TabsTrigger value='results'>Results</TabsTrigger>
            <TabsTrigger value='conversation'>
              Questions &amp; answers
            </TabsTrigger>
          </TabsList>
          <TabsContent value='results' className='flex flex-col gap-8'>
            {state.result ? (
              <ResultView
                state={state}
                personas={personas}
                act={() => {}}
                busy={false}
                readOnly
                layout='contained'
              />
            ) : (
              <Alert>
                <AlertTitle>No saved result yet</AlertTitle>
                <AlertDescription>
                  This assessment is still in progress. Inspect its questions
                  and answers to see the latest saved conversation.
                </AlertDescription>
              </Alert>
            )}
            {state.result && (
              <section className='flex flex-col gap-6'>
                <h2>Answers behind this result</h2>
                <ConversationHistory
                  turns={conversationTurns(state).filter(
                    (turn) => turn.replies.length > 0
                  )}
                />
              </section>
            )}
          </TabsContent>
          <TabsContent value='conversation' className='flex flex-col gap-8'>
            <ConversationHistory turns={conversationTurns(state)} />
            <p className='text-sm text-muted-foreground'>
              Read-only preview. Unsubmitted typing is stored only in the
              participant’s browser.
            </p>
          </TabsContent>
        </Tabs>
      </AnswerNavigationProvider>
    </AssessmentPage>
  )
}
