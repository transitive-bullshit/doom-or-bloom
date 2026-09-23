'use client'

import { useMemo, useState } from 'react'
import type { Prompt } from '@/lib/content/schema'
import { questionRelationships } from '@/lib/debug/relationships'
import type { QuestionRelation } from '@/lib/debug/relationships'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { JsonViewer } from '../json-viewer'
import { MetadataList, RelationshipGraph, ReviewHeader } from './shared'

export function QuestionsInspector({
  prompts,
  contentVersion
}: {
  prompts: Prompt[]
  contentVersion: string
}) {
  const [selectedId, setSelectedId] = useState('root')
  const [search, setSearch] = useState('')
  const [family, setFamily] = useState('all')
  const [relation, setRelation] = useState<QuestionRelation>('transitions')
  const selected = prompts.find((prompt) => prompt.id === selectedId)!
  const edges = useMemo(
    () => questionRelationships(prompts, selectedId, relation),
    [prompts, selectedId, relation]
  )
  const filtered = prompts.filter(
    (prompt) =>
      (family === 'all' || prompt.family === family) &&
      JSON.stringify(prompt).toLowerCase().includes(search.toLowerCase())
  )
  const families = [...new Set(prompts.map((prompt) => prompt.family))].sort()
  return (
    <article className='mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-6 py-10'>
      <ReviewHeader
        title='Built-in questions'
        description='Inspect the authored graph, eligibility rules and question quality. Jev selects among existing prompts; these tools make no inference requests.'
        contentVersion={contentVersion}
      />
      <p className='text-sm text-muted-foreground'>
        {prompts.length} catalog entries · {families.length} families
      </p>
      <section className='space-y-4 rounded-xl border p-4 sm:p-6'>
        <h2>Relationship map</h2>
        <ToggleGroup
          type='single'
          value={relation}
          onValueChange={(value) => {
            if (
              value === 'transitions' ||
              value === 'targets' ||
              value === 'novelty'
            )
              setRelation(value)
          }}
          variant='outline'
          size='sm'
          className='max-w-full flex-wrap'
          aria-label='Question relationship type'
        >
          <ToggleGroupItem value='transitions'>Transitions</ToggleGroupItem>
          <ToggleGroupItem value='targets'>Shared targets</ToggleGroupItem>
          <ToggleGroupItem value='novelty'>Novelty groups</ToggleGroupItem>
        </ToggleGroup>
        <p className='max-w-4xl text-sm text-muted-foreground'>
          Transitions show permitted family compatibility. Wildcards make many
          connections broad. They do not predict the next question:
          prerequisites, reading familiarity, missing coverage, repetition, caps
          and Jev’s candidate benefits still apply. Shared-target and novelty
          lines are similarity links, not routing edges.
        </p>
        <RelationshipGraph
          nodes={prompts.map((prompt) => ({
            id: prompt.id,
            label: prompt.id
          }))}
          edges={edges}
          selectedId={selectedId}
          onSelect={setSelectedId}
          label='Authored question relationships'
        />
      </section>
      <section className='space-y-4'>
        <h2>Question list</h2>
        <FieldGroup className='grid gap-4 sm:grid-cols-2'>
          <Field>
            <FieldLabel htmlFor='question-search'>
              Search questions or metadata
            </FieldLabel>
            <Input
              id='question-search'
              type='search'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor='question-family'>Family</FieldLabel>
            <NativeSelect
              id='question-family'
              value={family}
              onChange={(event) => setFamily(event.target.value)}
            >
              <NativeSelectOption value='all'>All families</NativeSelectOption>
              {families.map((item) => (
                <NativeSelectOption key={item} value={item}>
                  {item}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        </FieldGroup>
        <p className='text-xs text-muted-foreground'>
          {filtered.length} matches
        </p>
        <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-3'>
          {filtered.map((prompt) => (
            <Button
              key={prompt.id}
              variant='outline'
              className='h-auto min-w-0 flex-col items-start gap-2 p-4 text-left whitespace-normal'
              asChild
            >
              <a
                href='#review-entry'
                onClick={() => setSelectedId(prompt.id)}
                aria-current={selectedId === prompt.id ? 'true' : undefined}
              >
                <span className='flex flex-wrap gap-2 text-xs'>
                  <span className='font-mono'>{prompt.id}</span>
                  <Badge variant='secondary'>{prompt.family}</Badge>
                </span>
                <span className='text-sm'>{prompt.text}</span>
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
        aria-label={`Question details ${selectedId}`}
      >
        <p className='font-mono text-xs text-muted-foreground'>{selectedId}</p>
        <h2>{selected.text}</h2>
        <MetadataList
          rows={[
            { label: 'Family', value: selected.family },
            { label: 'Reading level', value: selected.readingLevel },
            { label: 'Review status', value: selected.status },
            { label: 'Targets', value: selected.targets.join(', ') },
            {
              label: 'Prerequisites: assessed vectors',
              value: selected.prerequisites.join(', ')
            },
            {
              label: 'Exclusions: assessed vectors',
              value: selected.exclusions.join(', ')
            },
            {
              label: 'Permitted previous families',
              value: selected.permittedAfter.join(', ')
            },
            { label: 'Novelty group', value: selected.noveltyGroup },
            {
              label: 'Effort / maximum uses',
              value: `${selected.effort} / ${selected.maxUses}`
            },
            {
              label: 'Additional runtime gate',
              value:
                selected.noveltyGroup === 'conviction'
                  ? 'An active expressed horizon is required'
                  : 'Standard coverage, familiarity, usage and prompt-budget gates'
            }
          ]}
        />
        <JsonViewer
          value={selected}
          label={`Question metadata ${selectedId}`}
        />
      </section>
    </article>
  )
}
