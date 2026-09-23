'use client'
import { ClosestPersonas } from './closest-personas'
import {
  closestPersonas,
  type PersonaComparison
} from '@/lib/assessment/persona-matches'
import { atCap, promptLimit } from '@/lib/assessment/state'
import { useRef, useState } from 'react'
import { mapPng } from '@/lib/sharing/map-png'
import { ExpandingArrowAction } from '@/components/motion/expanding-arrow-button'
import { Spinner } from '@/components/ui/spinner'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { Assessment, Operation, VectorId } from '@/lib/assessment/schema'
import { limits, vectorIds } from '@/lib/assessment/schema'
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
  completed = false,
  readOnly = false,
  operations = []
}: {
  personas: PersonaComparison[]
  state: Assessment
  act: (operation: Operation) => void
  busy: boolean
  completed?: boolean
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
      body: JSON.stringify({
        horizontal: result.horizontal.value,
        vertical: result.vertical.value,
        horizontalRange: result.horizontal.range,
        verticalRange: result.vertical.range,
        influence: result.experiment?.influence.value ?? null,
        transformation: result.experiment?.transformation.value ?? null,
        influenceRange: result.experiment?.influence.range ?? [0, 1],
        transformationRange: result.experiment?.transformation.range ?? [0, 1],
        influenceInterpretation: result.experiment?.influence.interpretation,
        transformationInterpretation:
          result.experiment?.transformation.interpretation,
        upside:
          result.components.find((c) => c.vector === 'beneficial_potential')
            ?.value ?? null,
        harm:
          result.components.find((c) => c.vector === 'risk_landscape')?.value ??
          null,
        upsideRange: result.components.find(
          (c) => c.vector === 'beneficial_potential'
        )?.range,
        harmRange: result.components.find((c) => c.vector === 'risk_landscape')
          ?.range,
        pdoom:
          result.experiment?.pdoom?.estimate ??
          (result.experiment?.pdoom?.bounds
            ? (result.experiment.pdoom.bounds[0] +
                result.experiment.pdoom.bounds[1]) /
              2
            : null),
        pdoomRange: result.experiment?.pdoom?.bounds,
        pdoomToken: result.experiment?.pdoom?.token,
        generatedAt: result.experiment?.generatedAt,
        closestPersonaIds: closestPersonas(result, personas).map(
          ({ id }) => id
        ),
        provisional: result.provisional
      })
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
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Report download failed. Please try again.'
      )
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
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Card download failed')
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
        <h2>Results</h2>
        <p className='mt-3 text-sm text-body-foreground'>
          {result.reason === 'Some interpretations still need clarification.'
            ? null
            : result.reason}
        </p>
      </div>
      <ExperimentalResults
        result={result}
        layout='breakout'
        beforeDetails={
          <div className='mt-5 flex justify-center'>{downloadAction}</div>
        }
        riskCompanion={<ClosestPersonas result={result} personas={personas} />}
      />
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
      {result.findings.length > 0 && (
        <section className='flex flex-col gap-3'>
          <h2 className='font-medium'>A few things that stood out</h2>
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
        </section>
      )}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant='outline'>
            {readOnly ? 'Review the results' : 'Review & clarify my results'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='mt-4 flex flex-col gap-5'>
          {result.components.map((c) => (
            <section key={c.vector} className='rounded-lg border p-4'>
              <h3 className='text-sm font-medium'>{c.label}</h3>
              <p className='mt-2 text-sm'>{c.claim ?? 'Unassessed'}</p>
              {supportingAnswers(c.evidenceIds).map((answer) => (
                <div
                  key={answer.id}
                  className='mt-3 border-l-2 pl-3 text-sm text-body-foreground'
                >
                  <AnswerDisclosure
                    text={answer.text}
                    label={`Supporting answer ${state.answers.indexOf(answer) + 1}`}
                  />
                </div>
              ))}
              {!readOnly &&
                c.claim !== null &&
                (c.value !== null || c.evidenceIds.length > 0) &&
                state.prompts.length <
                  (completed ? limits.maxPrompts : promptLimit(state)) &&
                (vectorIds.includes(c.vector as VectorId) ||
                  c.vector === 'catastrophic_risk') && (
                  <Button
                    variant='ghost'
                    className='mt-3'
                    disabled={busy}
                    onClick={() =>
                      act({
                        type: 'clarify',
                        vector:
                          c.vector === 'catastrophic_risk'
                            ? 'risk_landscape'
                            : (c.vector as VectorId),
                        claim:
                          c.vector === 'catastrophic_risk'
                            ? 'catastrophic_risk'
                            : undefined
                      })
                    }
                  >
                    That’s not quite my view
                  </Button>
                )}
            </section>
          ))}
          {result.sources.length > 0 && (
            <section className='rounded-lg border p-4'>
              <h3 className='text-sm font-medium'>Reference snapshots used</h3>
              <p className='mt-2 text-xs text-muted-foreground'>
                These authored sources inform interpretation; recognition alone
                does not establish understanding.
              </p>
              {result.sources.map((source) => (
                <div key={source.id} className='mt-3'>
                  <p className='text-sm'>
                    {source.title} · {source.status}
                  </p>
                  {source.urls.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target='_blank'
                      rel='noreferrer'
                      aria-label={`${source.title} — source ${i + 1} (${new URL(url).hostname})`}
                      className='mr-3 text-xs underline'
                    >
                      {source.title} — source {i + 1}
                    </a>
                  ))}
                </div>
              ))}
            </section>
          )}
        </CollapsibleContent>
      </Collapsible>
      {result.resources.length > 0 && (
        <section className='flex flex-col gap-4'>
          <h2 className='font-medium'>Resources you might enjoy</h2>
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
            (completed
              ? state.prompts.length < limits.maxPrompts
              : !atCap(state)) && (
              <Button
                type='button'
                disabled={busy || reportDownloading}
                variant='outline'
                onClick={() => act({ type: 'continue' })}
              >
                {completed
                  ? 'Continue in a new assessment'
                  : 'Continue answering questions'}
              </Button>
            )}
        </div>
      </div>
    </div>
  )
}
