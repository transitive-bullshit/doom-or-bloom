'use client'
import { DisclosureTrigger } from '@/components/disclosure-trigger'
import type { ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { getPathname } from '@/i18n/navigation'
import { defaultLocale } from '@/i18n/config'
import { ShareBar } from './share-bar'
import { closestPersonas } from '@/lib/assessment/persona-matches'
import { shareCaption } from '@/lib/sharing/share-caption'
import { ClosestPersonas } from './closest-personas'
import type { PersonaComparison } from '@/lib/assessment/persona-matches'
import { resultCardData } from '@/lib/sharing/card-data'
import { atCap, promptLimit } from '@/lib/assessment/state'
import { useRef, useState } from 'react'
import { mapPng } from '@/lib/sharing/map-png'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { Assessment, Operation } from '@/lib/assessment/schema'
import { limits } from '@/lib/assessment/schema'
import type { SavedDebugOperation } from '@/lib/debug/trace-storage'
import { ResourceList } from './resource-list'
import { ExperimentalResults } from './experimental-results'
import { AnswerDisclosure } from './conversation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { serializeReport, downloadBlob } from '@/lib/sharing/report'
import { presentResult } from '@/lib/assessment/present-result'
import { claimText, componentLabel } from '@/lib/assessment/display-text'
import { resultReasonKind } from '@/lib/assessment/projections'
import {
  placementComparison,
  placementQuestion
} from '@/lib/assessment/self-placement'
import { resultPlacement } from '@/lib/assessments/feedback'
import { SelfPlacement } from './self-placement'
import { ResultFeedback } from './result-feedback'
import { useResultFeedback } from './use-result-feedback'
import { emitEvent } from '@/lib/analytics/client'
import { makeEvent } from '@/lib/analytics/events'

export function ResultView({
  personas,
  state,
  act,
  busy,
  published = false,
  readOnly = false,
  layout = 'breakout',
  operations = [],
  publishControl
}: {
  personas: PersonaComparison[]
  state: Assessment
  act: (operation: Operation) => void
  busy: boolean
  published?: boolean
  readOnly?: boolean
  layout?: 'contained' | 'breakout'
  operations?: SavedDebugOperation[]
  /** Publish or make-private controls, shown beside the share actions. */
  publishControl?: ReactNode
}) {
  const root = useTranslations()
  const t = useTranslations('Results')
  const locale = useLocale()
  const [downloading, setDownloading] = useState(false)
  const [reportDownloading, setReportDownloading] = useState(false)
  const resultsRoot = useRef<HTMLDivElement>(null)
  const result = presentResult(state.result!)
  const feedback = useResultFeedback(state, !readOnly)
  const placed = resultPlacement(result)
  // When the participant's own placement and this result differ a lot, offer
  // one question about it. Answering adds evidence and returns an updated
  // result; it is offered once, on a current private result.
  const question =
    feedback.guess &&
    !readOnly &&
    !published &&
    state.status === 'results' &&
    state.result?.evidenceRevision === state.evidenceRevision &&
    !atCap(state) &&
    !state.prompts.some((prompt) => prompt.variant === 'placement')
      ? placementQuestion(feedback.guess, placed)
      : null
  const supportingAnswers = (evidenceIds: string[]) => {
    const ids = new Set(
      state.evidence
        .filter((entry) => evidenceIds.includes(entry.id))
        .map((entry) => entry.answerId)
    )
    return state.answers.filter((answer) => ids.has(answer.id))
  }
  const renderCard = async () => {
    // The card renders in the page's language; English needs no parameter.
    const query = locale === defaultLocale ? '' : `?locale=${locale}`
    const response = await fetch(`/api/share-card${query}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultCardData(result, personas))
    })
    if (!response.ok)
      throw new Error('Card generation failed. Please try again.')
    return response.blob()
  }
  const report = async () => {
    if (reportDownloading || downloading) return
    const svg = resultsRoot.current?.querySelector<SVGSVGElement>(
      '[data-slot="worldview-map-svg"]'
    )
    if (!svg) {
      toast.error(t('mapNotReady'))
      return
    }
    setReportDownloading(true)
    try {
      const [resultsImage, mapImage, { createReportZip }] = await Promise.all([
        renderCard(),
        mapPng(svg),
        import('@/lib/sharing/report-zip')
      ])
      const archive = await createReportZip(
        serializeReport(root, state, operations),
        resultsImage,
        mapImage
      )
      downloadBlob(archive, root('Report.filename', { id: state.id }))
      toast.success(t('reportStarted'))
      emitEvent(makeEvent(state, 'full_report_downloaded'))
    } catch {
      toast.error(t('reportFailed'))
    } finally {
      setReportDownloading(false)
    }
  }
  const card = async () => {
    if (downloading || reportDownloading) return
    setDownloading(true)
    try {
      downloadBlob(await renderCard(), 'doom-or-bloom.png')
      toast.success(t('imageStarted'))
      emitEvent(makeEvent(state, 'share_card_downloaded'))
    } catch {
      toast.error(t('imageFailed'))
    } finally {
      setDownloading(false)
    }
  }
  const experiment =
    result.experiment?.evidenceRevision === result.evidenceRevision
      ? result.experiment
      : undefined
  const caption = readOnly
    ? ''
    : shareCaption(root, {
        risk: experiment?.pdoom,
        closest: closestPersonas(result, personas)[0]?.name
      })
  if (feedback.stage !== 'revealed')
    return (
      <div ref={resultsRoot} aria-busy={feedback.stage === 'pending'}>
        {feedback.stage === 'guess' && (
          <SelfPlacement
            busy={feedback.busy}
            onSubmit={(guess) => void feedback.submitGuess(guess)}
            onSkip={feedback.skip}
          />
        )}
      </div>
    )
  return (
    <div ref={resultsRoot} className='flex flex-col gap-6'>
      {(!readOnly || result.insufficient || result.capped) && (
        <div>
          {(result.insufficient || result.capped) && (
            <div className='mb-3 flex gap-2'>
              {result.insufficient && (
                <Badge variant='secondary'>{t('notPlaced')}</Badge>
              )}
              {result.capped && atCap(state) && (
                <Badge variant='outline'>
                  {t('capReached', { limit: promptLimit(state) })}
                </Badge>
              )}
            </div>
          )}
          {!readOnly && (
            <>
              <h2>{t('title')}</h2>
              <p className='mt-2 max-w-prose text-pretty text-body-foreground'>
                {t(`reason.${resultReasonKind(result)}`)}
                {result.horizontal.value !== null &&
                  result.experiment?.transformation.value != null &&
                  ` ${t('dotNote')}`}
              </p>
            </>
          )}
        </div>
      )}
      <ExperimentalResults
        result={result}
        layout={layout}
        riskCompanion={<ClosestPersonas result={result} personas={personas} />}
        guess={feedback.guess}
        mapNote={
          feedback.guess && (
            <div className='flex flex-col gap-3'>
              <p className='text-sm text-body-foreground'>
                {placementComparison(root, feedback.guess, placed)}
              </p>
              {question && (
                <section
                  aria-label={t('differenceLabel')}
                  className='flex flex-col gap-3 rounded-lg border p-4'
                >
                  <p className='text-sm font-medium text-pretty'>
                    {question.text}
                  </p>
                  <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
                    <Button
                      type='button'
                      size='sm'
                      variant='outline'
                      disabled={busy}
                      onClick={() =>
                        feedback.guess &&
                        act({ type: 'placement', guess: feedback.guess })
                      }
                    >
                      {t('answerQuestion')}
                    </Button>
                    <span className='text-xs text-muted-foreground'>
                      {t('answerUpdates')}
                    </span>
                  </div>
                </section>
              )}
            </div>
          )
        }
        feedback={
          !readOnly && (
            <ResultFeedback
              saved={feedback.agreement}
              onSubmit={feedback.submitAgreement}
            />
          )
        }
        share={
          !readOnly && (
            <ShareBar
              caption={caption}
              path={getPathname({
                href: published ? `/public/assessments/${state.id}` : '/',
                locale
              })}
              published={published}
              downloading={downloading}
              disabled={busy || reportDownloading}
              onShare={(target) =>
                emitEvent(
                  makeEvent(state, 'share_intent_opened', {
                    share_target: target
                  })
                )
              }
              onDownload={() => void card()}
              publishControl={publishControl}
            />
          )
        }
      />
      <ResultDisclosure title={t('insights')}>
        <div className='grid gap-3 sm:grid-cols-2'>
          {result.fingerprint.map((c) => (
            <div key={c.vector} className='rounded-lg border p-4'>
              <p className='text-sm font-medium'>{componentLabel(root, c)}</p>
              <p className='mt-2 text-sm text-body-foreground'>
                {c.claim ? claimText(root, c.claim, c.vector) : t('unexplored')}
              </p>
              {c.vector === 'timeline' &&
                supportingAnswers(c.evidenceIds).map((answer) => {
                  const number = { number: state.answers.indexOf(answer) + 1 }
                  return (
                    <div
                      key={answer.id}
                      className='mt-3 text-sm text-body-foreground'
                    >
                      <AnswerDisclosure
                        text={answer.text}
                        labels={{
                          region: t('timelineAnswer.region', number),
                          expand: t('timelineAnswer.expand', number),
                          collapse: t('timelineAnswer.collapse', number)
                        }}
                      />
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </ResultDisclosure>
      {result.findings.length > 0 && (
        <ResultDisclosure title={t('standouts')}>
          {result.findings.map((f) => (
            <Collapsible key={f.id} className='rounded-lg border p-4'>
              <p className='text-sm'>{f.text}</p>
              <CollapsibleTrigger asChild>
                <Button variant='link' className='px-0 text-xs'>
                  {t('seeSupporting', {
                    count: Math.max(1, supportingAnswers(f.evidenceIds).length)
                  })}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className='mt-3 text-xs text-muted-foreground'>
                  {t('wholeAnswers')}
                </p>
                {supportingAnswers(f.evidenceIds).map((answer) => {
                  const number = { number: state.answers.indexOf(answer) + 1 }
                  return (
                    <div
                      key={answer.id}
                      className='mt-2 border-l-2 pl-3 text-sm text-body-foreground'
                    >
                      <AnswerDisclosure
                        text={answer.text}
                        labels={{
                          region: t('supportingAnswer.region', number),
                          expand: t('supportingAnswer.expand', number),
                          collapse: t('supportingAnswer.collapse', number)
                        }}
                      />
                    </div>
                  )
                })}
                <p className='mt-3 text-xs text-muted-foreground'>
                  {t('interpretation', {
                    rubric: result.versions.rubric,
                    model: result.versions.model
                  })}
                </p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </ResultDisclosure>
      )}
      {result.resources.length > 0 && (
        <section className='flex flex-col gap-4'>
          <h5>{t('resources')}</h5>
          <ResourceList
            resources={result.resources}
            onOpen={(resource) =>
              emitEvent(
                makeEvent(state, 'resource_opened', {
                  resource_id: resource.id
                })
              )
            }
          />
        </section>
      )}
      {!readOnly && (
        <>
          <Separator className='my-6' />
          <div className='flex flex-col items-center gap-4'>
            <div className='flex flex-wrap justify-center gap-3'>
              <Button
                type='button'
                disabled={busy || reportDownloading || downloading}
                aria-busy={reportDownloading}
                variant='outline'
                onClick={() => void report()}
              >
                {reportDownloading && (
                  <Spinner data-icon='inline-start' aria-hidden='true' />
                )}
                {reportDownloading ? t('preparingReport') : t('downloadReport')}
              </Button>
              {(published
                ? state.prompts.length < limits.maxPrompts
                : !atCap(state)) && (
                <Button
                  type='button'
                  disabled={busy || reportDownloading}
                  variant='outline'
                  onClick={() => act({ type: 'continue' })}
                >
                  {published ? t('forkContinue') : t('continueAnswering')}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ResultDisclosure({
  title,
  children
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Collapsible>
      <h6>
        <DisclosureTrigger>{title}</DisclosureTrigger>
      </h6>
      <CollapsibleContent
        forceMount
        className='mt-3 flex flex-col gap-3 data-[state=closed]:hidden'
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
