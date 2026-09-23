'use client'

import {
  AnswerNavigationProvider,
  AnswerTarget,
  useAnswerDisclosure
} from '@/components/assessment/answer-navigation'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
import { ChevronDownIcon } from 'lucide-react'
import { PersonaHeader } from './persona-header'
import { PersonaSources } from './persona-sources'
import { ExperimentalResults } from '@/components/assessment/experimental-results'
import { ReasoningJudgments } from '@/components/assessment/reasoning-judgments'
import { JsonViewer } from '@/components/debug/json-viewer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from '@/components/ui/collapsible'
import type { Result } from '@/lib/assessment/schema'
import type { Example } from './shared'
import type { PersonaAssessment } from '@/lib/journeys/persona-assessment'

export function PersonaPageContent({
  person,
  assessment
}: {
  person: Pick<
    Example,
    | 'name'
    | 'avatar'
    | 'xUrl'
    | 'profileUrl'
    | 'profileLabel'
    | 'description'
    | 'possessivePronoun'
    | 'sources'
    | 'sourceBriefUpdated'
  > & { result: Result }
  assessment: PersonaAssessment
}) {
  return (
    <AnswerNavigationProvider
      answerIds={assessment.answers.map((answer) => answer.id)}
    >
      <PersonaHeader person={person} />
      <ExperimentalResults
        layout='breakout'
        excerpts
        subject={person}
        result={person.result}
        reasoningDetails={false}
      />
      <section
        aria-label='Simulated Assessment'
        className='mt-10 flex flex-col gap-4'
      >
        <h2>Simulated Assessment</h2>
        <PersonaAnswers assessment={assessment} />
        <section aria-label='Debug info'>
          <Collapsible className='rounded-xl border p-4'>
            <h3>
              <CollapsibleTrigger asChild>
                <Button
                  variant='ghost'
                  className='group w-full justify-between'
                >
                  Debug info
                  <ChevronDownIcon className='group-data-[state=open]:rotate-180' />
                </Button>
              </CollapsibleTrigger>
            </h3>
            <CollapsibleContent className='mt-4 flex min-w-0 flex-col gap-5'>
              <ReasoningJudgments components={person.result.components} />
              <div className='flex min-w-0 flex-col gap-3'>
                <h3>Assessment state</h3>
                <p className='text-sm text-muted-foreground'>
                  The simulated answers, supporting evidence, and dimension
                  definitions supplied to Jev for the final assessment.
                </p>
                {assessment.finalState ? (
                  <JsonViewer
                    label='Final assessment state'
                    value={assessment.finalState}
                  />
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    The input state was not recorded for this result.
                  </p>
                )}
              </div>
              <div className='flex min-w-0 flex-col gap-3'>
                <h3>Generated results</h3>
                <p className='text-sm text-muted-foreground'>
                  The resulting map coordinates, scores, uncertainty ranges, and
                  findings, including any sourced P(doom) override.
                </p>
                <JsonViewer
                  label='Final generated result'
                  value={person.result}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </section>
      </section>
      <PersonaSources
        sources={person.sources ?? []}
        sourceBriefUpdated={person.sourceBriefUpdated}
      />
      <Separator className='my-20' />
      <WorldviewCtaCard />
    </AnswerNavigationProvider>
  )
}

function PersonaAnswers({ assessment }: { assessment: PersonaAssessment }) {
  const [open, setOpen] = useAnswerDisclosure(true)
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='rounded-xl border p-4'
    >
      <CollapsibleTrigger asChild>
        <Button variant='ghost' className='group w-full justify-between'>
          View questions and simulated answers ({assessment.answers.length})
          <ChevronDownIcon className='group-data-[state=open]:rotate-180' />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className='mt-6 flex flex-col gap-8'>
        {assessment.answers.map((answer, index) => (
          <AnswerTarget key={`${answer.id}-${index}`} number={index + 1}>
            <article className='flex min-w-0 flex-col gap-3'>
              <p className='text-xs text-muted-foreground'>
                Question {index + 1}
              </p>
              <h3>{answer.question}</h3>
              <div className='rounded-xl bg-muted p-4 text-sm leading-relaxed whitespace-pre-wrap wrap-anywhere'>
                {answer.answer}
              </div>
            </article>
          </AnswerTarget>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
