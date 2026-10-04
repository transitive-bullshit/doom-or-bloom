import type { ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { languageTag } from '@/i18n/config'
import { Link } from '@/i18n/navigation'
import { Citation } from '@/components/p-doom/citation'
import { AgreementChart } from '@/components/about/agreement-chart'
import { InterviewFlow } from '@/components/about/interview-flow'
import {
  methodologyChanges,
  minimumRange,
  repositoryUrl,
  reviewFindings,
  sameMeaningLimit,
  sample,
  type MethodologySource
} from '@/lib/about/methodology'
import { versions } from '@/lib/assessment/schema'

const linkClass = 'underline underline-offset-4'

const external = (href: string) =>
  function ExternalLink(chunks: ReactNode) {
    return (
      <a
        className={linkClass}
        href={href}
        rel='noopener noreferrer'
        target='_blank'
      >
        {chunks}
      </a>
    )
  }

/** A list of labeled entries: labels beside the text from `sm` up. */
function Entries({
  entries
}: {
  entries: { key: string; label: ReactNode; text: ReactNode }[]
}) {
  return (
    <dl className='flex flex-col gap-4'>
      {entries.map(({ key, label, text }) => (
        <div
          key={key}
          className='flex flex-col gap-1 sm:grid sm:grid-cols-[10rem_1fr] sm:gap-x-6'
        >
          <dt className='font-semibold'>{label}</dt>
          <dd className='text-body-foreground'>{text}</dd>
        </div>
      ))}
    </dl>
  )
}

const versionKeys = ['assessment', 'content', 'rubric', 'model'] as const

/**
 * How the interview works, what a result is, the evidence so far, who has
 * taken it, why the questions are authored, versions, then a worked example.
 * Footnote markers point to the page's numbered sources.
 */
export function Methodology({
  numbers,
  example
}: {
  numbers: Record<MethodologySource, number>
  /** The worked example, shown last. */
  example?: ReactNode
}) {
  const t = useTranslations('About.methodology')
  const tag = languageTag(useLocale())
  const cite = (key: MethodologySource) => <Citation number={numbers[key]} />
  const cites = Object.fromEntries(
    (Object.keys(numbers) as MethodologySource[]).map((key) => [
      key,
      () => cite(key)
    ])
  )
  const decimal = (value: number, digits: number) =>
    new Intl.NumberFormat(tag, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    }).format(value)
  const percent = (value: number) =>
    new Intl.NumberFormat(tag, {
      style: 'percent',
      maximumFractionDigits: 1
    }).format(value)
  const count = (value: number) => new Intl.NumberFormat(tag).format(value)
  const date = (value: string) =>
    new Intl.DateTimeFormat(tag, {
      dateStyle: 'long',
      timeZone: 'UTC'
    }).format(new Date(value))
  const days = (range: readonly string[]) =>
    new Intl.DateTimeFormat(tag, {
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC'
    }).formatRange(new Date(range[0]!), new Date(range[1]!))
  const { pdoom } = reviewFindings

  return (
    <section aria-labelledby='methodology' className='flex flex-col gap-10'>
      <header className='flex flex-col gap-3'>
        <h2 id='methodology' className='scroll-mt-24'>
          {t('title')}
        </h2>
        <p>{t('lead')}</p>
      </header>

      <section aria-labelledby='how-it-works' className='flex flex-col gap-4'>
        <h3 id='how-it-works' className='scroll-mt-24'>
          {t('howTitle')}
        </h3>
        <InterviewFlow />
        <p>
          {t.rich('how', { ...cites, jev: external('https://typesafe.ai') })}
        </p>
      </section>

      <section aria-labelledby='results' className='flex flex-col gap-4'>
        <h3 id='results' className='scroll-mt-24'>
          {t('resultTitle')}
        </h3>
        <Entries
          entries={(
            ['map', 'depth', 'pdoom', 'choices', 'simulated'] as const
          ).map((key) => ({
            key,
            label: t(`result.${key}Label`),
            text: t.rich(`result.${key}`, cites)
          }))}
        />
      </section>

      <section aria-labelledby='evidence' className='flex flex-col gap-5'>
        <h3 id='evidence' className='scroll-mt-24'>
          {t('evidenceTitle')}
        </h3>
        <AgreementChart citation={cite('review')} />
        <Entries
          entries={[
            {
              key: 'placement',
              label: t('evidence.placementLabel'),
              text: t.rich('evidence.placement', cites)
            },
            {
              key: 'stability',
              label: t('evidence.stabilityLabel'),
              text: t.rich('evidence.stability', {
                ...cites,
                limit: decimal(sameMeaningLimit, 2),
                range: decimal(minimumRange, 2)
              })
            },
            {
              key: 'models',
              label: t('evidence.modelsLabel'),
              text: t.rich('evidence.models', {
                ...cites,
                ratio: count(reviewFindings.costRatio)
              })
            },
            {
              key: 'feelsRight',
              label: t('evidence.feelsRightLabel'),
              text: t.rich('evidence.feelsRight', {
                ...cites,
                yes: count(sample.feelsRight.count),
                total: count(sample.feelsRight.n),
                share: percent(sample.feelsRight.share)
              })
            },
            {
              key: 'pdoom',
              label: t('evidence.pdoomLabel'),
              text: t.rich('evidence.pdoom', {
                ...cites,
                typed: count(pdoom.typed),
                readings: count(pdoom.readings),
                within: percent(pdoom.within2x),
                guess: percent(pdoom.constantGuess)
              })
            },
            {
              key: 'gaps',
              label: t('evidence.gapsLabel'),
              text: t.rich('evidence.gaps', cites)
            }
          ]}
        />
      </section>

      <section aria-labelledby='who' className='flex flex-col gap-3'>
        <h3 id='who' className='scroll-mt-24'>
          {t('sampleTitle')}
        </h3>
        <p>
          {t.rich('sample', {
            ...cites,
            date: date(sample.asOf),
            people: count(sample.people),
            hackerNewsDates: days(sample.hackerNewsDates),
            xDates: days(sample.xDates),
            hackerNews: decimal(sample.hackerNewsOutlook, 2),
            x: decimal(sample.xOutlook, 2),
            post: (chunks) => (
              <Link className={linkClass} href='/blog/hacker-news-vs-x'>
                {chunks}
              </Link>
            )
          })}
        </p>
      </section>

      <section
        aria-labelledby='authored-questions'
        className='flex flex-col gap-3'
      >
        <h3 id='authored-questions' className='scroll-mt-24'>
          {t('authoredTitle')}
        </h3>
        <p>{t.rich('authored', cites)}</p>
      </section>

      <section aria-labelledby='versions' className='flex flex-col gap-4'>
        <h3 id='versions' className='scroll-mt-24'>
          {t('versionsTitle')}
        </h3>
        <dl className='flex flex-wrap gap-x-6 gap-y-2 rounded-xl border bg-card px-4 py-3 text-sm'>
          {versionKeys.map((key) => (
            <div key={key} className='flex items-baseline gap-2'>
              <dt className='text-muted-foreground'>
                {t(`versionLabels.${key}`)}
              </dt>
              <dd className='font-mono'>{versions[key]}</dd>
            </div>
          ))}
        </dl>
        <p>{t('versions')}</p>
        <ol className='flex flex-col gap-3'>
          {methodologyChanges.map((change) => (
            <li key={change.id} className='flex flex-col gap-0.5'>
              <span className='text-sm text-muted-foreground'>
                <time dateTime={change.date}>{date(change.date)}</time>
                {' · '}
                <span className='font-mono'>{change.version}</span>
              </span>
              <span className='text-body-foreground'>
                {t(`changes.${change.id}`)}
                {'cite' in change && cite(change.cite)}
              </span>
            </li>
          ))}
        </ol>
        <p>
          {t.rich('history', {
            research: external(`${repositoryUrl}/tree/main/docs/research`)
          })}
        </p>
      </section>

      {example}
    </section>
  )
}
