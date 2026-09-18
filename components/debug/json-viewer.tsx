'use client'

import { memo, useId, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { jsonHelp, recordedQuestion } from '@/lib/debug/json-help'
import type { JsonHelpContext } from '@/lib/debug/json-help'
import type { Question } from '@/lib/assessment/schema'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  containsJevAnswers,
  isJevAnswerRecord,
  orderAnswerEntries
} from '@/lib/debug/answer-order'
import type { AnswerOrder } from '@/lib/debug/answer-order'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'

function Help({
  explanation,
  children
}: {
  explanation?: string
  children: ReactElement
}) {
  if (!explanation) return children
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side='top'
        sideOffset={6}
        className='max-w-[min(26rem,calc(100vw-2rem))] px-4 py-3 text-sm leading-relaxed text-pretty'
      >
        {explanation}
      </TooltipContent>
    </Tooltip>
  )
}

function JsonNode({
  value,
  property,
  path,
  depth,
  answerOrder,
  context,
  parent,
  question: inheritedQuestion,
  comma = false
}: {
  value: unknown
  property?: string
  path: string
  depth: number
  answerOrder: AnswerOrder
  context: JsonHelpContext
  parent?: unknown
  question?: Question
  comma?: boolean
}) {
  const ownQuestion =
    value && typeof value === 'object' && 'question' in value
      ? recordedQuestion(value.question)
      : undefined
  const question =
    ownQuestion ??
    (property ? context.questions?.[property] : undefined) ??
    inheritedQuestion
  const explanation = jsonHelp({
    property,
    value,
    parent,
    path,
    context,
    question
  })
  const [open, setOpen] = useState(depth < 2)
  const array = Array.isArray(value)
  const object = value !== null && typeof value === 'object'
  const entries = useMemo(
    () =>
      property === 'answers' && isJevAnswerRecord(value)
        ? orderAnswerEntries(value, answerOrder)
        : object
          ? Object.entries(value).filter(
              ([, child]) => array || child !== undefined
            )
          : [],
    [value, property, answerOrder, object, array]
  )
  const longString = typeof value === 'string' && value.length > 200
  const prefix =
    property !== undefined ? (
      <>
        <span
          data-json-token='key'
          className={
            explanation
              ? 'underline decoration-dotted underline-offset-4'
              : undefined
          }
        >
          {JSON.stringify(property)}
        </span>
        :{' '}
      </>
    ) : null
  const punctuation = comma ? ',' : ''
  if ((!object || entries.length === 0) && !longString) {
    const token = value === null || value === undefined ? 'null' : typeof value
    return (
      <div className='min-w-0 py-0.5 pl-5' data-json-depth={depth}>
        {explanation && property !== undefined ? (
          <Help explanation={explanation}>
            <Button
              variant='ghost'
              size='sm'
              aria-label={`Explain ${path}`}
              className='h-auto min-h-7 p-0 font-mono text-xs underline decoration-dotted underline-offset-4'
            >
              {prefix}
            </Button>
          </Help>
        ) : (
          prefix
        )}
        <span data-json-token={token}>{JSON.stringify(value ?? null)}</span>
        {punctuation}
      </div>
    )
  }
  const opening = array ? '[' : '{'
  const closing = array ? ']' : '}'
  return (
    <Collapsible open={open} onOpenChange={setOpen} data-json-depth={depth}>
      <Help explanation={explanation}>
        <CollapsibleTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='h-auto min-h-7 w-full justify-start gap-1 rounded px-1 py-0.5 text-left whitespace-normal [overflow-wrap:anywhere]'
            aria-label={`${open ? 'Collapse' : 'Expand'} ${path}`}
          >
            {open ? (
              <ChevronDown
                className='size-3 shrink-0'
                data-icon='inline-start'
              />
            ) : (
              <ChevronRight
                className='size-3 shrink-0'
                data-icon='inline-start'
              />
            )}
            <span className='min-w-0 font-mono text-xs'>
              {prefix}
              {longString ? (
                <span className='text-muted-foreground'>
                  string · {value.length.toLocaleString('en-US')} characters
                </span>
              ) : (
                <>
                  {opening}
                  {open ? '' : ` … ${closing}${punctuation}`}{' '}
                  <span className='text-muted-foreground'>
                    · {entries.length} {array ? 'items' : 'keys'}
                  </span>
                </>
              )}
            </span>
          </Button>
        </CollapsibleTrigger>
      </Help>
      <CollapsibleContent>
        {open &&
          (longString ? (
            <div className='py-0.5 pl-5'>
              <span data-json-token='string'>{JSON.stringify(value)}</span>
              {punctuation}
            </div>
          ) : (
            <div className='ml-2 border-l pl-2 sm:ml-3 sm:pl-3'>
              {entries.map(([key, child], index) => (
                <JsonNode
                  key={key}
                  value={child}
                  property={array ? undefined : key}
                  path={array ? `${path}[${key}]` : `${path}.${key}`}
                  depth={depth + 1}
                  answerOrder={answerOrder}
                  context={context}
                  parent={value}
                  question={question}
                  comma={index < entries.length - 1}
                />
              ))}
            </div>
          ))}
      </CollapsibleContent>
      {open && !longString && (
        <div className='pl-5'>
          {closing}
          {punctuation}
        </div>
      )}
    </Collapsible>
  )
}

export const JsonViewer = memo(function JsonViewer({
  value,
  label,
  questions,
  dimensions
}: {
  value: unknown
  label: string
  questions?: JsonHelpContext['questions']
  dimensions?: JsonHelpContext['dimensions']
}) {
  const context = useMemo(
    () => ({ questions, dimensions }),
    [questions, dimensions]
  )
  const [generation, setGeneration] = useState(0)
  const [copyStatus, setCopyStatus] = useState('')
  const [answerOrder, setAnswerOrder] = useState<AnswerOrder>('default')
  const hasAnswers = useMemo(() => containsJevAnswers(value), [value])
  const orderId = useId()
  async function copy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(value, null, 2))
      setCopyStatus('Copied')
    } catch {
      setCopyStatus('Copy unavailable in this browser')
    }
  }
  return (
    <TooltipProvider delayDuration={250}>
      <div
        className='min-w-0 rounded-lg border bg-muted/50'
        data-slot='json-viewer'
        role='region'
        aria-label={label}
      >
        <div className='flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2'>
          <p className='text-xs text-muted-foreground'>
            Depth 2+ folded · dotted keys have hover help
          </p>
          <div className='flex flex-wrap items-center gap-2'>
            {hasAnswers && (
              <FieldGroup className='w-auto max-w-full [container-type:normal]'>
                <Field
                  orientation='horizontal'
                  className='w-auto flex-wrap gap-2'
                >
                  <FieldLabel
                    id={orderId}
                    className='shrink-0 whitespace-nowrap'
                  >
                    Answer order
                  </FieldLabel>
                  <ToggleGroup
                    type='single'
                    variant='outline'
                    size='sm'
                    value={answerOrder}
                    aria-labelledby={orderId}
                    onValueChange={(value) => {
                      if (
                        value === 'default' ||
                        value === 'high' ||
                        value === 'low'
                      )
                        setAnswerOrder(value)
                    }}
                  >
                    <ToggleGroupItem
                      value='default'
                      aria-label='Default answer order'
                    >
                      Default
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value='high'
                      aria-label='Highest confidence or noul first'
                    >
                      High first
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value='low'
                      aria-label='Lowest confidence or noul first'
                    >
                      Low first
                    </ToggleGroupItem>
                  </ToggleGroup>
                </Field>
              </FieldGroup>
            )}
            <span role='status' className='text-xs text-muted-foreground'>
              {copyStatus}
            </span>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => setGeneration((g) => g + 1)}
            >
              Reset folds
            </Button>
            <Button
              size='sm'
              variant='ghost'
              onClick={() => void copy()}
              title='Copy the original JSON payload; display sorting does not alter it.'
            >
              Copy JSON
            </Button>
          </div>
        </div>
        {hasAnswers && answerOrder !== 'default' && (
          <p className='px-3 pt-2 text-xs text-muted-foreground'>
            Display order only. Uses confidence or noul probability; missing
            values stay last. Copied JSON keeps its original order.
          </p>
        )}
        <div className='min-w-0 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] sm:p-4'>
          <JsonNode
            key={generation}
            value={value}
            path='$'
            depth={0}
            answerOrder={answerOrder}
            context={context}
          />
        </div>
      </div>
    </TooltipProvider>
  )
})
