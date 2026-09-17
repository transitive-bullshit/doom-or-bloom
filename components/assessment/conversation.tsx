'use client'

import { useState } from 'react'
import type { ConversationTurn } from '@/lib/assessment/conversation'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent, MessageHeader } from '@/components/ui/message'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

function AnswerDisclosure({ text, label }: { text: string; label: string }) {
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

export function ConversationReplies({ turn }: { turn: ConversationTurn }) {
  return turn.replies.map((reply, index) => (
    <Message
      key={reply.id}
      align='end'
      aria-label={`Your reply ${index + 1} to question ${turn.prompt.ordinal}`}
    >
      <MessageContent>
        <MessageHeader>
          You{reply.earlier ? ' · earlier reply' : ''}
        </MessageHeader>
        <Bubble variant='secondary' align='end'>
          <BubbleContent>
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

export function ConversationHistory({ turns }: { turns: ConversationTurn[] }) {
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
              <p className='whitespace-pre-wrap wrap-anywhere'>
                {turn.question}
              </p>
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
      <ConversationReplies turn={turn} />
    </article>
  ))
}
