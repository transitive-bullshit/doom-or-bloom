'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { SavedDebugOperation } from '@/lib/debug/trace-storage'
import { AnswerResult } from './answer-result'
import { Check, Copy, CircleAlert } from 'lucide-react'
import type { ConversationTurn } from '@/lib/assessment/conversation'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent, MessageHeader } from '@/components/ui/message'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

export function AnswerDisclosure({
  text,
  label
}: {
  text: string
  label: string
}) {
  const [open, setOpen] = useState(false)
  const long = text.length > 360 || text.split('\n').length > 4
  if (!long) return <p className='whitespace-pre-wrap wrap-anywhere'>{text}</p>
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant='link'
          size='sm'
          aria-label={`${open ? 'Collapse' : 'Read full'} ${label.toLowerCase()}`}
          className='mb-2 px-0'
        >
          {open ? 'Show less' : 'Read full answer'}
        </Button>
      </CollapsibleTrigger>
      {!open && (
        <p className='line-clamp-4 whitespace-pre-wrap wrap-anywhere'>
          {text.slice(0, 360).trimEnd()}…
        </p>
      )}
      <CollapsibleContent>
        <div
          role='region'
          aria-label={label}
          className='whitespace-pre-wrap wrap-anywhere'
        >
          {text}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function CopyAnswer({ text, label }: { text: string; label: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const reset = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const statusId = useId()
  useEffect(() => () => clearTimeout(reset.current), [])
  async function copy() {
    clearTimeout(reset.current)
    try {
      await navigator.clipboard.writeText(text)
      setStatus('copied')
      reset.current = setTimeout(() => setStatus('idle'), 2000)
    } catch {
      setStatus('error')
    }
  }
  return (
    <span className='answer-copy absolute top-2 right-2 inline-flex'>
      <Button
        variant='outline'
        size='icon-sm'
        className='copy-answer-button'
        data-copy-state={status}
        aria-label={`Copy ${label.toLowerCase()}`}
        aria-describedby={statusId}
        onClick={() => void copy()}
      >
        <span className='grid' aria-hidden='true'>
          <span className='copy-answer-label' data-visible={status === 'idle'}>
            <Copy />
          </span>
          <span
            className='copy-answer-label'
            data-visible={status === 'copied'}
          >
            <Check />
          </span>
          <span className='copy-answer-label' data-visible={status === 'error'}>
            <CircleAlert />
          </span>
        </span>
      </Button>
      <span id={statusId} role='status' className='sr-only'>
        {status === 'copied'
          ? 'Copied'
          : status === 'error'
            ? 'Copy unavailable in this browser'
            : ''}
      </span>
    </span>
  )
}

export function ConversationReplies({ turn }: { turn: ConversationTurn }) {
  return turn.replies.map((reply, index) => (
    <Message
      key={reply.id}
      align='end'
      aria-label={`Your reply ${index + 1} to question ${turn.prompt.ordinal}`}
    >
      <MessageContent>
        {reply.earlier && <MessageHeader>Earlier reply</MessageHeader>}
        <Bubble variant='secondary' align='end'>
          <BubbleContent
            tabIndex={0}
            className='answer-bubble relative min-h-12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
          >
            <CopyAnswer
              text={reply.text}
              label={`Answer ${index + 1} to question ${turn.prompt.ordinal}`}
            />
            <AnswerDisclosure
              text={reply.text}
              label={`Answer ${index + 1} to question ${turn.prompt.ordinal}`}
            />
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  ))
}

export function ConversationHistory({
  turns,
  operations
}: {
  turns: ConversationTurn[]
  operations?: SavedDebugOperation[]
}) {
  return turns.map((turn) => (
    <article
      key={turn.prompt.id}
      className='flex flex-col gap-5'
      aria-label={`Question ${turn.prompt.ordinal} and replies`}
    >
      <Message>
        <MessageContent>
          <MessageHeader>Question {turn.prompt.ordinal}</MessageHeader>
          <Bubble variant='ghost'>
            <BubbleContent>
              <h4 className='text-lg leading-snug font-semibold tracking-tight whitespace-pre-wrap wrap-anywhere'>
                {turn.question}
              </h4>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <ConversationReplies turn={turn} />
      {operations && turn.replies.some((reply) => !reply.earlier) && (
        <AnswerResult
          operation={operations.find(
            (entry) =>
              entry.operation?.type === 'answer' &&
              entry.assessment?.answers.at(-1)?.promptInstanceId ===
                turn.prompt.id
          )}
        />
      )}
    </article>
  ))
}
