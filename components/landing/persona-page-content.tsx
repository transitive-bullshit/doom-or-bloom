'use client'

import { useTranslations } from 'next-intl'
import {
  AnswerNavigationProvider,
  AnswerTarget,
  useAnswerDisclosure
} from '@/components/assessment/answer-navigation'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
import { CompareCta } from '@/components/compare-cta'
import { MobileCta } from '@/components/mobile-cta'
import { DisclosureTrigger } from '@/components/disclosure-trigger'
import { PersonaHeader } from './persona-header'
import { PersonaSources } from './persona-sources'
import { SimilarWorldviews, type SimilarWorldview } from './similar-worldviews'
import { PublicStatements } from './public-statements'
import { ExperimentalResults } from '@/components/assessment/experimental-results'
import { ReasoningJudgments } from '@/components/assessment/reasoning-judgments'
import { JsonViewer } from '@/components/debug/json-viewer'
import { Separator } from '@/components/ui/separator'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import type { Result } from '@/lib/assessment/schema'
import type { Example } from './shared'
import type { PersonaAssessment } from '@/lib/journeys/persona-assessment'
import type { PublicStatements as Statements } from '@/lib/personas/public-statements'
import { authoredPrompt } from '@/lib/assessment/display-text'
import { useAuthoredText } from '@/components/assessment/authored-text'

export function PersonaPageContent({
  person,
  assessment,
  similar = [],
  statements
}: {
  person: Pick<
    Example,
    | 'name'
    | 'slug'
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
  /** Nearest simulated users, linked after the compare prompt. */
  similar?: SimilarWorldview[]
  /** What the real person has said, below the map and its follow-ups. */
  statements?: Statements
}) {
  const t = useTranslations('Persona')
  return (
    <AnswerNavigationProvider
      answerIds={assessment.answers.map((answer) => answer.id)}
    >
      <div className='mb-8'>
        <PersonaHeader person={person} />
      </div>
      <ExperimentalResults
        layout='breakout'
        excerpts
        subject={person}
        result={person.result}
        reasoningDetails={false}
      />
      <CompareCta
        name={person.name}
        compare={`persona:${person.slug}`}
        className='mt-16'
      />
      {similar.length > 0 && (
        <div className='mt-10'>
          <SimilarWorldviews name={person.name} people={similar} />
        </div>
      )}
      {statements && (
        <div className='mt-20'>
          <PublicStatements name={person.name} statements={statements} />
        </div>
      )}
      <section
        aria-label={t('simulatedAssessment')}
        className='mt-20 flex flex-col gap-4'
      >
        <h2>{t('simulatedAssessment')}</h2>
        {/* With the real person's own words above, the simulated answers
            start closed, one click away. Participant pages pass no
            statements, so their answers stay open. */}
        <PersonaAnswers assessment={assessment} defaultOpen={!statements} />
        <section aria-label={t('debugInfo')}>
          <Collapsible>
            <DisclosureTrigger>{t('debugInfo')}</DisclosureTrigger>
            <CollapsibleContent className='mt-4 flex min-w-0 flex-col gap-5'>
              <ReasoningJudgments components={person.result.components} />
              <div className='flex min-w-0 flex-col gap-3'>
                <h3>{t('stateTitle')}</h3>
                <p className='text-sm text-muted-foreground'>
                  {t('stateDescription')}
                </p>
                {assessment.finalState ? (
                  <JsonViewer
                    label={t('stateLabel')}
                    value={assessment.finalState}
                  />
                ) : (
                  <p className='text-sm text-muted-foreground'>
                    {t('stateMissing')}
                  </p>
                )}
              </div>
              <div className='flex min-w-0 flex-col gap-3'>
                <h3>{t('resultsTitle')}</h3>
                <p className='text-sm text-muted-foreground'>
                  {t('resultsDescription')}
                </p>
                <JsonViewer label={t('resultsLabel')} value={person.result} />
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
      <MobileCta compare={`persona:${person.slug}`} />
    </AnswerNavigationProvider>
  )
}

function PersonaAnswers({
  assessment,
  defaultOpen
}: {
  assessment: PersonaAssessment
  defaultOpen: boolean
}) {
  const t = useTranslations('Persona')
  const authored = useAuthoredText()
  const [open, setOpen] = useAnswerDisclosure(defaultOpen)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <DisclosureTrigger>
        {t('viewAnswers', { count: assessment.answers.length })}
      </DisclosureTrigger>
      {/* Mounted while closed, so the pregenerated page keeps every answer
          and its anchor in the HTML. */}
      <CollapsibleContent
        forceMount
        className='mt-6 flex flex-col gap-8 data-[state=closed]:hidden'
      >
        {assessment.answers.map((answer, index) => (
          <AnswerTarget key={`${answer.id}-${index}`} number={index + 1}>
            <article className='flex min-w-0 flex-col gap-3'>
              <p className='text-xs text-muted-foreground'>
                {t('question', { number: index + 1 })}
              </p>
              <h3 className='w-full text-pretty'>
                {authoredPrompt(authored, answer.promptId, answer.question)}
              </h3>
              <div className='rounded-xl bg-muted p-4 text-base leading-relaxed whitespace-pre-wrap wrap-anywhere'>
                {answer.answer}
              </div>
            </article>
          </AnswerTarget>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
