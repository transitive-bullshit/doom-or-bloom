'use client'
import type { Assessment, Operation, VectorId } from '@/lib/assessment/schema'
import { limits, vectorIds } from '@/lib/assessment/schema'
import { Map } from './worldview-map'
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
  state,
  act,
  busy,
  onError
}: {
  state: Assessment
  act: (operation: Operation) => void
  busy: boolean
  onError: (message: string) => void
}) {
  const result = state.result!
  const supportingAnswers = (evidenceIds: string[]) => {
    const ids = new Set(
      state.evidence
        .filter((entry) => evidenceIds.includes(entry.id))
        .map((entry) => entry.answerId)
    )
    return state.answers.filter((answer) => ids.has(answer.id))
  }
  const report = () => {
    const { markdown } = serializeReport(state)
    downloadBlob(
      new Blob([markdown], { type: 'text/markdown' }),
      'doom-or-bloom-report.md'
    )
    emitEvent(makeEvent(state, 'full_report_downloaded'))
  }
  const card = async () => {
    try {
      const response = await fetch('/api/share-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horizontal: result.horizontal.value,
          vertical: result.vertical.value,
          horizontalRange: result.horizontal.range,
          verticalRange: result.vertical.range,
          provisional: result.provisional
        })
      })
      if (!response.ok)
        throw new Error('Card generation failed. Please try again.')
      downloadBlob(await response.blob(), 'doom-or-bloom.png')
      emitEvent(makeEvent(state, 'share_card_downloaded'))
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Card download failed')
    }
  }
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <div className='mb-3 flex gap-2'>
          <Badge variant='secondary'>
            {result.insufficient
              ? 'Insufficient evidence'
              : result.provisional
                ? 'Provisional result'
                : 'Your worldview map'}
          </Badge>
          {result.capped && (
            <Badge variant='outline'>{limits.prompts}-prompt cap reached</Badge>
          )}
        </div>
        <h1 className='text-3xl font-semibold tracking-tight'>
          A map of your AI worldview
        </h1>
        <p className='mt-3 text-sm text-muted-foreground'>{result.reason}</p>
      </div>
      <Map horizontal={result.horizontal} vertical={result.vertical} />
      <div className='grid gap-3 sm:grid-cols-2'>
        {result.fingerprint.map((c) => (
          <div key={c.vector} className='rounded-lg border p-4'>
            <p className='text-sm font-medium'>{c.label}</p>
            <p className='mt-2 text-sm text-muted-foreground'>
              {c.claim ?? 'Still unexplored'}
            </p>
            {c.vector === 'timeline' &&
              supportingAnswers(c.evidenceIds).map((answer) => (
                <div
                  key={answer.id}
                  className='mt-3 text-sm text-muted-foreground'
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
                  See supporting answer
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className='mt-3 text-xs text-muted-foreground'>
                  Support links to whole answers, rather than selected passages.
                </p>
                {supportingAnswers(f.evidenceIds).map((answer) => (
                  <div
                    key={answer.id}
                    className='mt-2 border-l-2 pl-3 text-sm text-muted-foreground'
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
          <Button variant='outline'>Inspect evidence & clarify my view</Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='mt-4 flex flex-col gap-5'>
          {result.components.map((c) => (
            <section key={c.vector} className='rounded-lg border p-4'>
              <h3 className='text-sm font-medium'>{c.label}</h3>
              <p className='mt-2 text-sm'>{c.claim ?? 'Unassessed'}</p>
              {supportingAnswers(c.evidenceIds).map((answer) => (
                <div
                  key={answer.id}
                  className='mt-3 border-l-2 pl-3 text-sm text-muted-foreground'
                >
                  <AnswerDisclosure
                    text={answer.text}
                    label={`Supporting answer ${state.answers.indexOf(answer) + 1}`}
                  />
                </div>
              ))}
              {c.value !== null &&
                state.prompts.length < limits.prompts &&
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
                      className='mr-3 text-xs underline'
                    >
                      Primary source {i + 1} ↗
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
          <h2 className='font-medium'>Something worth exploring</h2>
          {result.resources.map((r) => (
            <div key={r.id}>
              <a
                className='text-sm font-medium underline underline-offset-4'
                href={r.url}
                target='_blank'
                rel='noreferrer'
                onClick={() =>
                  emitEvent(
                    makeEvent(state, 'resource_opened', { resource_id: r.id })
                  )
                }
              >
                {r.title} ↗
              </a>
              <p className='mt-1 text-sm text-muted-foreground'>{r.purpose}</p>
              <p className='mt-1 text-xs text-muted-foreground'>{r.effort}</p>
            </div>
          ))}
        </section>
      )}
      <div className='flex flex-wrap gap-3'>
        {!result.capped && (
          <Button disabled={busy} onClick={() => act({ type: 'continue' })}>
            Keep exploring
          </Button>
        )}
        <Button disabled={busy} variant='outline' onClick={report}>
          Download full report
        </Button>
        <Button disabled={busy} variant='outline' onClick={() => void card()}>
          Download card
        </Button>
        <Button variant='outline' asChild>
          <a
            target='_blank'
            rel='noreferrer'
            href={`https://x.com/intent/post?text=${encodeURIComponent('I mapped my AI worldview with Doom or Bloom. https://doom-or-bloom.com')}`}
            onClick={() => emitEvent(makeEvent(state, 'share_intent_opened'))}
          >
            Post on X
          </a>
        </Button>
        {state.status === 'results' && (
          <Button
            disabled={busy}
            variant='ghost'
            onClick={() => act({ type: 'complete' })}
          >
            Done for now
          </Button>
        )}
      </div>
      <p className='text-xs text-muted-foreground'>
        Posting on X opens a draft. Download the card and attach it manually.
      </p>
    </div>
  )
}
