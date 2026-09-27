'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import type { AgreementAspect } from '@/lib/assessments/feedback'
import type { Agreement } from './use-result-feedback'

const aspects: Array<[AgreementAspect, string]> = [
  ['outlook_too_doom', 'I’m more hopeful than this'],
  ['outlook_too_bloom', 'I’m more worried than this'],
  ['scale_too_low', 'I expect more change'],
  ['scale_too_high', 'I expect less change'],
  ['pdoom_too_high', 'My P(doom) is lower'],
  ['pdoom_too_low', 'My P(doom) is higher'],
  ['other', 'Something else']
]

/** One-tap agreement with the result, with optional detail when it’s off. */
export function ResultFeedback({
  saved,
  onSubmit
}: {
  saved: Agreement | null
  onSubmit: (agreement: Agreement) => Promise<boolean>
}) {
  const [editing, setEditing] = useState(false)
  const [rating, setRating] = useState<Agreement['rating'] | null>(null)
  const [selected, setSelected] = useState<AgreementAspect[]>([])
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const send = async (agreement: Agreement) => {
    setSending(true)
    if (await onSubmit(agreement)) setEditing(false)
    setSending(false)
  }
  if (saved && !editing)
    return (
      <section
        aria-label='Result feedback'
        className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-body-foreground'
      >
        <p>
          {saved.rating === 'yes'
            ? 'Thanks — glad it feels right.'
            : 'Thanks for telling us what’s off. We review this feedback to improve how answers are read.'}
        </p>
        <Button
          variant='link'
          className='h-auto p-0 text-sm'
          onClick={() => {
            setRating(saved.rating)
            setSelected(saved.aspects)
            setComment(saved.comment ?? '')
            setEditing(true)
          }}
        >
          Change
        </Button>
      </section>
    )
  return (
    <section
      aria-label='Result feedback'
      className='flex flex-col gap-4 rounded-xl border bg-card p-4'
    >
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='font-medium'>Does this feel right?</p>
        <div className='flex gap-2'>
          <Button
            variant={rating === 'yes' ? 'default' : 'outline'}
            size='sm'
            disabled={sending}
            onClick={() => {
              setRating('yes')
              void send({ rating: 'yes', aspects: [] })
            }}
          >
            Yes
          </Button>
          <Button
            variant={rating === 'not_quite' ? 'default' : 'outline'}
            size='sm'
            disabled={sending}
            aria-expanded={rating === 'not_quite'}
            onClick={() => setRating('not_quite')}
          >
            Not quite
          </Button>
        </div>
      </div>
      {rating === 'not_quite' && (
        <form
          className='flex flex-col gap-3'
          onSubmit={(event) => {
            event.preventDefault()
            const agreement: Agreement = {
              rating: 'not_quite',
              aspects: selected
            }
            if (comment.trim()) agreement.comment = comment.trim()
            void send(agreement)
          }}
        >
          <p className='text-sm text-body-foreground'>What’s off? Pick any.</p>
          <div className='flex flex-wrap gap-2'>
            {aspects.map(([id, label]) => (
              <Toggle
                key={id}
                variant='outline'
                size='sm'
                pressed={selected.includes(id)}
                onPressedChange={(pressed) =>
                  setSelected((present) =>
                    pressed
                      ? [...present, id]
                      : present.filter((aspect) => aspect !== id)
                  )
                }
              >
                {label}
              </Toggle>
            ))}
          </div>
          <Textarea
            value={comment}
            maxLength={1000}
            onChange={(event) => setComment(event.target.value)}
            placeholder='Anything else? (optional)'
            aria-label='What feels off (optional)'
            className='min-h-20 resize-none'
          />
          <div>
            <Button type='submit' size='sm' disabled={sending}>
              {sending && (
                <Spinner data-icon='inline-start' aria-hidden='true' />
              )}
              Send
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
