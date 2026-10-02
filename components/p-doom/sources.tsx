import Image from 'next/image'
import { GlobeIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { citationId, footnoteId, type Footnote } from '@/lib/p-doom/citations'
import { sourceIcon } from '@/lib/p-doom/favicons'
import type { Reading } from '@/lib/p-doom/readings'

/** The cited site's locally stored favicon, or a globe. */
function SiteIcon({ url }: { url: string }) {
  const icon = sourceIcon(url)
  return icon ? (
    <Image
      src={icon}
      width={16}
      height={16}
      alt=''
      unoptimized
      className='size-4 shrink-0 rounded-xs object-contain'
    />
  ) : (
    <GlobeIcon aria-hidden className='size-4 shrink-0 text-muted-foreground' />
  )
}

/** A source's title, linked, after its favicon. */
function SourceLink({ title, url }: { title: string; url: string }) {
  return (
    <a
      href={url}
      target='_blank'
      rel='noreferrer'
      className='group flex items-start gap-2 rounded-sm font-medium text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
    >
      <span className='flex h-[1lh] items-center'>
        <SiteIcon url={url} />
      </span>
      <span
        lang='en'
        className='min-w-0 text-pretty wrap-anywhere underline-offset-4 group-hover:underline'
      >
        {title}
      </span>
    </a>
  )
}

/** Numbered footnotes in citation order, each linking back to the text. */
export function Footnotes({ footnotes }: { footnotes: Footnote[] }) {
  const t = useTranslations('PdoomHub')
  return (
    <ol className='flex flex-col gap-3 text-sm leading-relaxed'>
      {footnotes.map(({ number, title, url, by, year }) => (
        <li
          key={number}
          id={footnoteId(number)}
          className='flex scroll-mt-24 gap-3 border-l-2 border-transparent pl-2 target:border-coral'
        >
          <span className='w-6 shrink-0 text-right text-muted-foreground tabular-nums'>
            {number}.
          </span>
          <div className='flex min-w-0 flex-col gap-0.5'>
            <SourceLink title={title} url={url} />
            <p className='pl-6 text-muted-foreground'>
              <span lang='en'>{by}</span>
              {' · '}
              <span className='whitespace-nowrap'>
                {year}
                {' · '}
                <a
                  href={`#${citationId(number)}`}
                  aria-label={t('backToText', { number })}
                  className='rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring'
                >
                  ↩
                </a>
              </span>
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Recommended readings, each with its site's favicon and a one-line reason. */
export function ReadingList({ readings }: { readings: Reading[] }) {
  return (
    <ul className='flex flex-col gap-4 text-sm leading-relaxed'>
      {readings.map(({ title, url, by, year, kind, description }) => (
        <li key={url} className='flex flex-col gap-1'>
          <SourceLink title={title} url={url} />
          <p className='pl-6 text-muted-foreground'>
            {by} · {year} · {kind}
          </p>
          <p className='pl-6 text-body-foreground'>{description}</p>
        </li>
      ))}
    </ul>
  )
}
