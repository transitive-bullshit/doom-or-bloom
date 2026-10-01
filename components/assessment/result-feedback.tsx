'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import type { AgreementAspect } from '@/lib/assessments/feedback'
import type { Agreement } from './use-result-feedback'

// Labels live in messages/<locale>.json under Feedback.aspects.
const aspects: AgreementAspect[] = [
  'outlook_too_doom',
  'outlook_too_bloom',
  'scale_too_low',
  'scale_too_high',
  'pdoom_too_high',
  'pdoom_too_low',
  'other'
]

/** One-tap agreement with the result, with optional detail when it’s off. */
export function ResultFeedback({
  saved,
  onSubmit
}: {
  saved: Agreement | null
  onSubmit: (agreement: Agreement) => Promise<boolean>
}) {
  const t = useTranslations('Feedback')
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
        aria-label={t('label')}
        className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-body-foreground'
      >
        <p>{saved.rating === 'yes' ? t('thanksYes') : t('thanksNo')}</p>
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
          {t('change')}
        </Button>
      </section>
    )
  return (
    <section
      aria-label={t('label')}
      className='flex flex-col gap-4 rounded-xl border bg-card p-4'
    >
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='font-medium'>{t('question')}</p>
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
            {t('yes')}
          </Button>
          <Button
            variant={rating === 'not_quite' ? 'default' : 'outline'}
            size='sm'
            disabled={sending}
            aria-expanded={rating === 'not_quite'}
            onClick={() => setRating('not_quite')}
          >
            {t('notQuite')}
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
          <p className='text-sm text-body-foreground'>{t('whatsOff')}</p>
          <div className='flex flex-wrap gap-2'>
            {aspects.map((id) => (
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
                {t(`aspects.${id}`)}
              </Toggle>
            ))}
          </div>
          <Textarea
            value={comment}
            maxLength={1000}
            onChange={(event) => setComment(event.target.value)}
            placeholder={t('placeholder')}
            aria-label={t('commentLabel')}
            className='min-h-20 resize-none'
          />
          <div>
            <Button type='submit' size='sm' disabled={sending}>
              {sending && (
                <Spinner data-icon='inline-start' aria-hidden='true' />
              )}
              {t('send')}
            </Button>
          </div>
        </form>
      )}
    </section>
  )
}
