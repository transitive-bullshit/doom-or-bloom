'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { SavedDebugOperation } from '@/lib/debug/trace-storage'
import {
  AnswerTarget,
  useAnswerNavigation,
  useAnswerDisclosure
} from './answer-navigation'
import { AnswerResult } from './answer-result'
import { Check, Copy, CircleAlert } from 'lucide-react'
import type { ConversationTurn } from '@/lib/assessment/conversation'
import { promptText } from '@/lib/assessment/display-text'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import { Message, MessageContent, MessageHeader } from '@/components/ui/message'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'

/** Accessible names for one answer: its region and its disclosure actions. */
export type AnswerLabels = { region: string; expand: string; collapse: string }

export function AnswerDisclosure({
  text,
  labels,
  answerNumber
}: {
  text: string
  labels: AnswerLabels
  answerNumber?: number
}) {
  const t = useTranslations('Conversation')
  const [open, setOpen] = useAnswerDisclosure(false, answerNumber ?? 0)
  const long = text.length > 360 || text.split('\n').length > 4
  const content = !long ? (
    <p className='whitespace-pre-wrap wrap-anywhere'>{text}</p>
  ) : (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant='link'
          size='sm'
          aria-label={open ? labels.collapse : labels.expand}
          className='mb-2 px-0'
        >
          {open ? t('showLess') : t('readFull')}
        </Button>
      </CollapsibleTrigger>
      {!open && (
        <p className='line-clamp-4 whitespace-pre-wrap wrap-anywhere'>{text}</p>
      )}
      <CollapsibleContent>
        <div
          role='region'
          aria-label={labels.region}
          className='whitespace-pre-wrap wrap-anywhere'
        >
          {text}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
  return answerNumber ? (
    <AnswerTarget number={answerNumber}>{content}</AnswerTarget>
  ) : (
    content
  )
}

function CopyAnswer({ text, label }: { text: string; label: string }) {
  const t = useTranslations('Conversation')
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
        aria-label={label}
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
          ? t('copied')
          : status === 'error'
            ? t('copyUnavailable')
            : ''}
      </span>
    </span>
  )
}

export function ConversationReplies({ turn }: { turn: ConversationTurn }) {
  const t = useTranslations('Conversation')
  const navigation = useAnswerNavigation()
  return turn.replies.map((reply, index) => {
    const numbers = { answer: index + 1, question: turn.prompt.ordinal }
    return (
      <Message
        key={reply.id}
        align='end'
        aria-label={t('reply', {
          reply: index + 1,
          question: turn.prompt.ordinal
        })}
      >
        <MessageContent>
          {reply.earlier && <MessageHeader>{t('earlier')}</MessageHeader>}
          <Bubble variant='secondary' align='end'>
            <BubbleContent
              tabIndex={0}
              className='answer-bubble relative min-h-12 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
            >
              <AnswerDisclosure
                answerNumber={
                  reply.earlier
                    ? undefined
                    : (navigation?.answerIds.indexOf(reply.id) ?? -1) + 1
                }
                text={reply.text}
                labels={{
                  region: t('answer.region', numbers),
                  expand: t('answer.expand', numbers),
                  collapse: t('answer.collapse', numbers)
                }}
              />
              <CopyAnswer text={reply.text} label={t('answer.copy', numbers)} />
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    )
  })
}

export function ConversationHistory({
  turns,
  operations
}: {
  turns: ConversationTurn[]
  operations?: SavedDebugOperation[]
}) {
  const root = useTranslations()
  return turns.map((turn) => (
    <article
      key={turn.prompt.id}
      className='flex flex-col gap-5'
      aria-label={root('Conversation.turn', { question: turn.prompt.ordinal })}
    >
      <Message>
        <MessageContent>
          <Bubble variant='ghost'>
            <BubbleContent>
              <h4 className='text-pretty whitespace-pre-wrap wrap-anywhere'>
                {promptText(root, { ...turn.prompt, text: turn.question })}
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
