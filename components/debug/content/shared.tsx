'use client'

import { useId, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { feedbackEntrySchema, feedbackLimit } from '@/lib/debug/feedback-schema'
import type { FeedbackEntry, FeedbackKind } from '@/lib/debug/feedback-schema'
import type { GraphEdge } from '@/lib/debug/relationships'
import { cn } from 'cn'

export function ReviewHeader({
  title,
  description,
  contentVersion
}: {
  title: string
  description: string
  contentVersion: string
}) {
  return (
    <header className='space-y-4'>
      <Badge variant='outline'>Internal · local development only</Badge>
      <h1 className='text-3xl font-semibold tracking-tight'>{title}</h1>
      <p className='max-w-3xl text-sm text-muted-foreground'>{description}</p>
      <div className='flex flex-wrap items-center gap-2'>
        <Button asChild variant='outline' size='sm'>
          <Link href='/questions'>Questions</Link>
        </Button>
        <Button asChild variant='outline' size='sm'>
          <Link href='/corpus'>Corpus</Link>
        </Button>
        <Button asChild variant='ghost' size='sm'>
          <Link href='/'>Return to assessment</Link>
        </Button>
        <span className='text-xs text-muted-foreground'>{contentVersion}</span>
      </div>
    </header>
  )
}

export function MetadataList({
  rows
}: {
  rows: { label: string; value: string | number }[]
}) {
  return (
    <dl className='grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3'>
      {rows.map((row) => (
        <div key={row.label} className='min-w-0'>
          <dt className='text-xs text-muted-foreground'>{row.label}</dt>
          <dd className='mt-1 wrap-anywhere'>
            {row.value === '' ? 'None' : row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

type GraphNode = { id: string; label: string; retired?: boolean }
export function RelationshipGraph({
  nodes,
  edges,
  selectedId,
  onSelect,
  label
}: {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedId: string
  onSelect: (id: string) => void
  label: string
}) {
  const marker = useId()
  const columns = Math.min(5, nodes.length)
  const positions = new Map(
    nodes.map((node, index) => [
      node.id,
      {
        x: 110 + (index % columns) * 200,
        y: 45 + Math.floor(index / columns) * 85
      }
    ])
  )
  return (
    <div className='space-y-3' data-slot='relationship-graph'>
      <p className='text-xs text-muted-foreground'>
        Select a node to inspect it and leave feedback. Lines show the selected
        entry’s relationships; retired questions are marked. The list below
        provides the same navigation on smaller screens.
      </p>
      <svg
        className='hidden w-full sm:block'
        viewBox={`0 0 ${columns * 200 + 20} ${Math.ceil(nodes.length / columns) * 85 + 5}`}
        role='group'
        aria-label={label}
      >
        <defs>
          <marker
            id={marker}
            markerWidth='7'
            markerHeight='7'
            refX='6'
            refY='3.5'
            orient='auto'
          >
            <path d='M0,0 L7,3.5 L0,7 Z' className='fill-muted-foreground' />
          </marker>
        </defs>
        {edges.map((edge) => {
          const from = positions.get(edge.source),
            to = positions.get(edge.target)
          if (!from || !to) return null
          const dx = to.x - from.x,
            dy = to.y - from.y
          if (dx === 0 && dy === 0) return null
          const inset = Math.min(94 / Math.abs(dx), 29 / Math.abs(dy))
          return (
            <line
              key={`${edge.source}:${edge.target}:${edge.label}`}
              x1={from.x + dx * inset}
              y1={from.y + dy * inset}
              x2={to.x - dx * inset}
              y2={to.y - dy * inset}
              className='stroke-muted-foreground'
              strokeOpacity='0.4'
              strokeWidth='1.5'
              markerEnd={`url(#${marker})`}
            >
              <title>{`${edge.source} → ${edge.target}: ${edge.label}`}</title>
            </line>
          )
        })}
        {nodes.map((node) => {
          const point = positions.get(node.id)!
          return (
            <a
              key={node.id}
              href='#review-entry'
              onClick={() => onSelect(node.id)}
              aria-label={`Inspect ${node.id}`}
            >
              <rect
                x={point.x - 90}
                y={point.y - 25}
                width='180'
                height='50'
                rx='8'
                className={cn(
                  'fill-card stroke-border',
                  node.id === selectedId && 'stroke-primary'
                )}
                strokeWidth={node.id === selectedId ? 3 : 1}
              />
              <text
                x={point.x}
                y={point.y - 2}
                textAnchor='middle'
                className='fill-foreground font-mono text-[11px]'
              >
                {node.label.length > 26
                  ? node.label.slice(0, 25) + '…'
                  : node.label}
              </text>
              <text
                x={point.x}
                y={point.y + 14}
                textAnchor='middle'
                className='fill-muted-foreground text-[10px]'
              >
                {node.retired
                  ? 'Retired · historical'
                  : node.id === selectedId
                    ? 'Selected'
                    : 'Inspect & give feedback'}
              </text>
            </a>
          )
        })}
      </svg>
      {edges.length === 0 && (
        <p className='text-sm text-muted-foreground'>
          No relationships of this type are authored for this entry.
        </p>
      )}
    </div>
  )
}

type FeedbackDrafts = Record<string, string>
export function FeedbackEditor({
  kind,
  resourceId,
  label,
  initialFeedback
}: {
  kind: FeedbackKind
  resourceId: string
  label: string
  initialFeedback: FeedbackEntry[]
}) {
  const [entries, setEntries] = useState(initialFeedback)
  const [drafts, setDrafts] = useState<FeedbackDrafts>({})
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const id = useId()
  const draft = drafts[resourceId] ?? ''
  const excess = Math.max(0, draft.length - feedbackLimit)
  const history = entries.filter((entry) => entry.resourceId === resourceId)
  async function save() {
    if (busy || excess || !draft.trim()) return
    setBusy(true)
    setMessage('')
    try {
      const response = await fetch('/api/editorial-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, resourceId, text: draft })
      })
      const body = await response.json()
      if (!response.ok)
        throw new Error(body.error || 'Feedback could not be saved.')
      const entry = feedbackEntrySchema.parse(body.entry)
      setEntries((current) => [...current, entry])
      setDrafts((current) => ({ ...current, [resourceId]: '' }))
      setMessage(`Saved to content/feedback/${kind}.json`)
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : 'Feedback could not be saved. Your text is still here.'
      )
    } finally {
      setBusy(false)
    }
  }
  return (
    <section
      className='space-y-4 rounded-xl border p-4 sm:p-6'
      aria-label={`Feedback for ${resourceId}`}
    >
      <h3 className='font-medium'>Free-form feedback</h3>
      <p className='text-sm text-muted-foreground'>
        Notes are appended to the project feedback file with this entry’s
        version and hash. They do not change the authored asset. Earlier notes
        remain available.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          void save()
        }}
      >
        <FieldGroup>
          <Field data-invalid={Boolean(excess)}>
            <FieldLabel htmlFor={id}>Feedback on {label}</FieldLabel>
            <Textarea
              id={id}
              value={draft}
              disabled={busy}
              onChange={(event) => {
                setDrafts((current) => ({
                  ...current,
                  [resourceId]: event.target.value
                }))
                setMessage('')
              }}
              aria-invalid={Boolean(excess)}
              aria-describedby={excess ? `${id}-limit` : undefined}
              placeholder='What feels unclear, misleading, redundant or missing? What would you change?'
              className='min-h-28 resize-none'
            />
            {excess > 0 && (
              <FieldDescription id={`${id}-limit`}>
                Your full text is retained. Shorten it by{' '}
                {excess.toLocaleString('en-US')} characters to save (20,000
                maximum).
              </FieldDescription>
            )}
            <div className='flex flex-wrap items-center gap-3'>
              <Button
                type='submit'
                disabled={busy || Boolean(excess) || !draft.trim()}
              >
                {busy ? 'Saving…' : 'Save feedback'}
              </Button>
              <p role='status' className='text-sm text-muted-foreground'>
                {message}
              </p>
            </div>
          </Field>
        </FieldGroup>
      </form>
      <Collapsible className='space-y-3'>
        <CollapsibleTrigger asChild>
          <Button variant='outline' size='sm'>
            Saved feedback for this entry ({history.length})
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className='space-y-3'>
          {history.toReversed().map((entry) => (
            <article
              key={entry.id}
              className='space-y-2 rounded-lg bg-muted p-4'
            >
              <p className='text-xs text-muted-foreground'>
                {entry.createdAt} · {entry.contentVersion} ·{' '}
                {entry.assetHash.slice(0, 8)}
              </p>
              <p className='text-sm whitespace-pre-wrap wrap-anywhere'>
                {entry.text}
              </p>
            </article>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </section>
  )
}
