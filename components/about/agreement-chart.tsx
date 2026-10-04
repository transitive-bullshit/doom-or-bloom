import type { ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { languageTag } from '@/i18n/config'
import { outlookAgreement, reviewDate } from '@/lib/about/methodology'

const max = Math.ceil(outlookAgreement.selfPlacement.sameGuess * 10) / 10

const groups = [
  {
    key: 'readers',
    tone: 'bg-chart-blue',
    rows: [
      ['repeat', outlookAgreement.readers.repeat],
      ['reworded', outlookAgreement.readers.reworded],
      ['largerModel', outlookAgreement.readers.largerModel]
    ]
  },
  {
    key: 'selfPlacement',
    tone: 'bg-chart-coral',
    rows: [
      ['jev', outlookAgreement.selfPlacement.jev],
      ['largerModelSelf', outlookAgreement.selfPlacement.largerModel],
      ['sameGuess', outlookAgreement.selfPlacement.sameGuess]
    ]
  }
] as const

/**
 * How far apart readings of the Doom–Bloom outlook land: two readings of the
 * same answers, then a reading against the person's own placement. Values sit
 * beside the bars as text, so the figure reads the same without them.
 */
export function AgreementChart({ citation }: { citation: ReactNode }) {
  const t = useTranslations('About.methodology.chart')
  const tag = languageTag(useLocale())
  const decimal = (value: number, digits: number) =>
    new Intl.NumberFormat(tag, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value)
  return (
    <figure className='flex flex-col gap-4 rounded-2xl border p-4 sm:p-6'>
      <figcaption className='font-semibold'>{t('title')}</figcaption>
      <div className='flex flex-col gap-5'>
        {groups.map((group) => (
          <div key={group.key} className='flex flex-col gap-3'>
            <p className='flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>
              <span
                aria-hidden
                className={`inline-block size-3 shrink-0 rounded-sm ${group.tone}`}
              />
              {t(group.key)}
            </p>
            {group.rows.map(([key, value]) => (
              <div key={key} className='flex flex-col gap-1.5'>
                <span className='text-sm font-medium'>{t(key)}</span>
                <div className='flex items-center gap-2'>
                  <div aria-hidden className='relative h-3 min-w-0 flex-1'>
                    <div
                      className={`absolute inset-y-0 left-0 rounded-r-sm ${group.tone}`}
                      style={{ width: `max(2px, ${(value / max) * 100}%)` }}
                    />
                  </div>
                  <span className='w-12 shrink-0 text-right text-sm font-semibold tabular-nums'>
                    {decimal(value, 3)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className='text-xs text-muted-foreground'>
        {t('note', {
          max: decimal(max, 1),
          date: new Intl.DateTimeFormat(tag, {
            dateStyle: 'long',
            timeZone: 'UTC'
          }).format(new Date(reviewDate))
        })}
        {citation}
      </p>
    </figure>
  )
}
