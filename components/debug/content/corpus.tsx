'use client'

import { useMemo, useState } from 'react'
import type { Reference } from '@/lib/content/schema'
import { corpusRelationships } from '@/lib/debug/relationships'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { JsonViewer } from '../json-viewer'
import { MetadataList, RelationshipGraph, ReviewHeader } from './shared'

export function CorpusInspector({
  references,
  contentVersion
}: {
  references: Reference[]
  contentVersion: string
}) {
  const [selectedId, setSelectedId] = useState(
    references.find(
      (reference) => reference.id === 'event.openai-hugging-face-2026'
    )?.id ?? references[0]!.id
  )
  const [search, setSearch] = useState('')
  const [kind, setKind] = useState('all')
  const selected = references.find((reference) => reference.id === selectedId)!
  const edges = useMemo(
    () => corpusRelationships(references, selectedId),
    [references, selectedId]
  )
  const neighborIds = new Set(
    edges.flatMap((edge) => [edge.source, edge.target])
  )
  const nodes = [
    selected,
    ...references.filter(
      (reference) =>
        reference.id !== selectedId && neighborIds.has(reference.id)
    )
  ].slice(0, 25)
  const filtered = references.filter(
    (reference) =>
      (kind === 'all' || reference.kind === kind) &&
      JSON.stringify(reference).toLowerCase().includes(search.toLowerCase())
  )
  return (
    <article className='mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-10'>
      <ReviewHeader
        title='Built-in corpus'
        description='Inspect the active reference snapshots, source dates, relationships, reading scopes. This view loads local assets and makes no Jev requests.'
        contentVersion={contentVersion}
      />
      <p className='text-sm text-muted-foreground'>
        {references.length} active snapshots ·{' '}
        {references.filter((reference) => reference.kind === 'entity').length}{' '}
        entities ·{' '}
        {references.filter((reference) => reference.kind === 'event').length}{' '}
        events ·{' '}
        {
          references.filter((reference) => reference.kind === 'publication')
            .length
        }{' '}
        publications
      </p>
      <section className='space-y-4 rounded-xl border p-4 sm:p-6'>
        <h2 className='font-medium'>Selected snapshot’s relationship map</h2>
        <p className='max-w-4xl text-sm text-muted-foreground'>
          Arrows distinguish associated entities from authored related entries.
          Related reports can describe the same event; links do not establish
          independent corroboration. Qualified occurrence/publication dates are
          preserved. The diagram shows up to 25 neighboring entries; every
          authored connection is listed in the details.
        </p>
        <RelationshipGraph
          nodes={nodes.map((reference) => ({
            id: reference.id,
            label: reference.id
          }))}
          edges={edges}
          selectedId={selectedId}
          onSelect={setSelectedId}
          label='Authored corpus relationships'
        />
      </section>
      <section className='space-y-4'>
        <h2 className='font-medium'>Snapshot list</h2>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor='corpus-search'>
              Search titles, IDs, topics, dates or snapshot text
            </FieldLabel>
            <Input
              id='corpus-search'
              type='search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel>Reference kind</FieldLabel>
            <ToggleGroup
              type='single'
              variant='outline'
              size='sm'
              value={kind}
              onValueChange={(value) => {
                if (value) setKind(value)
              }}
              className='max-w-full flex-wrap'
              aria-label='Reference kind'
            >
              <ToggleGroupItem value='all'>All</ToggleGroupItem>
              <ToggleGroupItem value='entity'>Entities</ToggleGroupItem>
              <ToggleGroupItem value='event'>Events</ToggleGroupItem>
              <ToggleGroupItem value='publication'>
                Publications
              </ToggleGroupItem>
            </ToggleGroup>
          </Field>
        </FieldGroup>
        <p className='text-xs text-muted-foreground'>
          {filtered.length} matches
        </p>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {filtered.map((reference) => (
            <Button
              key={reference.id}
              variant='outline'
              className='h-auto min-w-0 flex-col items-start gap-2 p-4 text-left whitespace-normal'
              asChild
            >
              <a
                href='#review-entry'
                onClick={() => setSelectedId(reference.id)}
                aria-current={selectedId === reference.id ? 'true' : undefined}
              >
                <span className='flex flex-wrap gap-2'>
                  <Badge variant='secondary'>{reference.kind}</Badge>
                  <Badge variant='outline'>{reference.status}</Badge>
                </span>
                <span>{reference.title}</span>
                <span className='text-xs text-muted-foreground wrap-anywhere'>
                  {reference.date} · {reference.id}
                </span>
                <span className='text-xs text-muted-foreground'>
                  Inspect details
                </span>
              </a>
            </Button>
          ))}
        </div>
      </section>
      <section
        id='review-entry'
        className='min-w-0 scroll-mt-6 space-y-5 rounded-xl border p-4 sm:p-6'
        aria-label={`Corpus details ${selectedId}`}
      >
        <p className='font-mono text-xs text-muted-foreground wrap-anywhere'>
          {selectedId}
        </p>
        <h2 className='text-xl font-semibold'>{selected.title}</h2>
        <MetadataList
          rows={[
            { label: 'Kind', value: selected.kind },
            { label: 'Authored date / qualifier', value: selected.date },
            {
              label: 'Review status / reviewer',
              value: `${selected.status} / ${selected.reviewer ?? 'Unreviewed'}`
            },
            { label: 'Topics', value: selected.topics.join(', ') },
            { label: 'Aliases', value: selected.aliases.join(', ') },
            {
              label: 'Associated entities',
              value: selected.entities.join(', ')
            },
            { label: 'Related entries', value: selected.related.join(', ') },
            { label: 'Content version', value: selected.content_version }
          ]}
        />
        <h3 className='text-sm font-medium'>Primary source links</h3>
        <ul className='space-y-2 text-sm'>
          {selected.sources.map((source) => (
            <li key={source.url} className='wrap-anywhere'>
              <a
                href={source.url}
                target='_blank'
                rel='noreferrer'
                className='underline underline-offset-4'
              >
                {source.url}
              </a>
              <span className='text-xs text-muted-foreground'>
                {' '}
                · accessed {source.accessed}
              </span>
            </li>
          ))}
        </ul>
        <h3 className='text-sm font-medium'>
          Selected relationships ({edges.length})
        </h3>
        <div className='flex flex-wrap gap-2'>
          {edges.map((edge) => {
            const other = edge.source === selectedId ? edge.target : edge.source
            return (
              <Button
                key={`${edge.source}:${edge.target}:${edge.label}`}
                size='sm'
                variant='outline'
                className='h-auto max-w-full py-1.5 text-left whitespace-normal wrap-anywhere'
                onClick={() => setSelectedId(other)}
              >
                {edge.source === selectedId ? 'To' : 'From'} {other} ·{' '}
                {edge.label}
              </Button>
            )
          })}
        </div>
        <Collapsible className='space-y-3'>
          <CollapsibleTrigger asChild>
            <Button variant='outline'>Read complete snapshot</Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <p className='text-sm whitespace-pre-wrap wrap-anywhere'>
              {selected.summary}
            </p>
          </CollapsibleContent>
        </Collapsible>
        <JsonViewer value={selected} label={`Corpus metadata ${selectedId}`} />
      </section>
    </article>
  )
}
