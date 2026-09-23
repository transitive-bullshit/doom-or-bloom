'use client'
import { ChevronDownIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ClosestPersonas } from './closest-personas'
import type { PersonaComparison } from '@/lib/assessment/persona-matches'
import { resultCardData } from '@/lib/sharing/card-data'
import { atCap, promptLimit } from '@/lib/assessment/state'
import { useRef, useState } from 'react'
import { mapPng } from '@/lib/sharing/map-png'
import { ExpandingArrowAction } from '@/components/motion/expanding-arrow-button'
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
import { emitEvent } from '@/lib/analytics/client'
import { makeEvent } from '@/lib/analytics/events'

export function ResultView({
  personas,
  state,
  act,
  busy,
  published = false,
  readOnly = false,
  operations = []
}: {
  personas: PersonaComparison[]
  state: Assessment
  act: (operation: Operation) => void
  busy: boolean
  published?: boolean
  readOnly?: boolean
  operations?: SavedDebugOperation[]
}) {
  const [downloading, setDownloading] = useState(false)
  const [reportDownloading, setReportDownloading] = useState(false)
  const resultsRoot = useRef<HTMLDivElement>(null)
  const result = state.result!
  const supportingAnswers = (evidenceIds: string[]) => {
    const ids = new Set(
      state.evidence
        .filter((entry) => evidenceIds.includes(entry.id))
        .map((entry) => entry.answerId)
    )
    return state.answers.filter((answer) => ids.has(answer.id))
  }
  const renderCard = async () => {
    const response = await fetch('/api/share-card', {
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
      toast.error('The results map is not ready. Please try again.')
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
        serializeReport(state, operations),
        resultsImage,
        mapImage
      )
      downloadBlob(archive, `doom or bloom assessment ${state.id}.zip`)
      toast.success('Full report download started.')
      emitEvent(makeEvent(state, 'full_report_downloaded'))
    } catch {
      toast.error('Couldn’t download the report. Please try again.')
    } finally {
      setReportDownloading(false)
    }
  }
  const card = async () => {
    if (downloading || reportDownloading) return
    setDownloading(true)
    try {
      downloadBlob(await renderCard(), 'doom-or-bloom.png')
      toast.success('Results image download started.')
      emitEvent(makeEvent(state, 'share_card_downloaded'))
    } catch {
      toast.error('Couldn’t download the image. Please try again.')
    } finally {
      setDownloading(false)
    }
  }
  const downloadAction = (
    <ExpandingArrowAction
      type='button'
      disabled={busy || downloading || reportDownloading}
      aria-busy={downloading}
      onClick={() => void card()}
    >
      {downloading && <Spinner data-icon='inline-start' aria-hidden='true' />}
      {downloading
        ? 'Preparing card…'
        : 'Download results image for social sharing'}
    </ExpandingArrowAction>
  )
  return (
    <div ref={resultsRoot} className='flex flex-col gap-6'>
      {(!readOnly || result.insufficient || result.capped) && (
        <div>
          {(result.insufficient || result.capped) && (
            <div className='mb-3 flex gap-2'>
              {result.insufficient && (
                <Badge variant='secondary'>Insufficient evidence</Badge>
              )}
              {result.capped && atCap(state) && (
                <Badge variant='outline'>
                  {promptLimit(state)}-prompt cap reached
                </Badge>
              )}
            </div>
          )}
          {!readOnly && <h2>Results</h2>}
        </div>
      )}
      <ExperimentalResults
        result={result}
        layout='breakout'
        riskCompanion={<ClosestPersonas result={result} personas={personas} />}
      />
      <ResultDisclosure title='Additional insights'>
        <div className='grid gap-3 sm:grid-cols-2'>
          {result.fingerprint.map((c) => (
            <div key={c.vector} className='rounded-lg border p-4'>
              <p className='text-sm font-medium'>{c.label}</p>
              <p className='mt-2 text-sm text-body-foreground'>
                {c.claim ?? 'Still unexplored'}
              </p>
              {c.vector === 'timeline' &&
                supportingAnswers(c.evidenceIds).map((answer) => (
                  <div
                    key={answer.id}
                    className='mt-3 text-sm text-body-foreground'
                  >
                    <AnswerDisclosure
                      text={answer.text}
                      label={`Timeline answer ${state.answers.indexOf(answer) + 1}`}
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </ResultDisclosure>
      {result.findings.length > 0 && (
        <ResultDisclosure title='A few things that stood out'>
          {result.findings.map((f) => (
            <Collapsible key={f.id} className='rounded-lg border p-4'>
              <p className='text-sm'>{f.text}</p>
              <CollapsibleTrigger asChild>
                <Button variant='link' className='px-0 text-xs'>
                  {supportingAnswers(f.evidenceIds).length > 1
                    ? 'See supporting answers'
                    : 'See supporting answer'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className='mt-3 text-xs text-muted-foreground'>
                  Support links to whole answers, rather than selected passages.
                </p>
                {supportingAnswers(f.evidenceIds).map((answer) => (
                  <div
                    key={answer.id}
                    className='mt-2 border-l-2 pl-3 text-sm text-body-foreground'
                  >
                    <AnswerDisclosure
                      text={answer.text}
                      label={`Supporting answer ${state.answers.indexOf(answer) + 1}`}
                    />
                  </div>
                ))}
                <p className='mt-3 text-xs text-muted-foreground'>
                  Interpretation: {result.versions.rubric} ·{' '}
                  {result.versions.model}
                </p>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </ResultDisclosure>
      )}
      {result.resources.length > 0 && (
        <section className='flex flex-col gap-4'>
          <h5>Resources you might enjoy</h5>
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
      <Separator className='my-6' />
      <div className='flex flex-col items-center gap-4'>
        {downloadAction}
        {!readOnly && (
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
              {reportDownloading ? 'Preparing report…' : 'Download full report'}
            </Button>
            {!readOnly &&
              (published
                ? state.prompts.length < limits.maxPrompts
                : !atCap(state)) && (
                <Button
                  type='button'
                  disabled={busy || reportDownloading}
                  variant='outline'
                  onClick={() => act({ type: 'continue' })}
                >
                  {published
                    ? 'Fork & continue answering'
                    : 'Continue answering questions'}
                </Button>
              )}
          </div>
        )}
      </div>
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
        <CollapsibleTrigger asChild>
          <Button variant='ghost' className='group w-full justify-between'>
            {title}
            <ChevronDownIcon className='group-data-[state=open]:rotate-180' />
          </Button>
        </CollapsibleTrigger>
      </h6>
      <CollapsibleContent className='mt-3 flex flex-col gap-3'>
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
