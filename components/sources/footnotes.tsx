import Image from 'next/image'
import { GlobeIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { footnoteId, type SourceFootnote } from '@/lib/sources/citations'
import { sourceIcon } from '@/lib/sources/favicons'
import { MentionText } from '@/components/mention-text'
import { MoreSources } from './more-sources'

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
export function SourceLink({ title, url }: { title: string; url: string }) {
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

/** Footnotes shown before the rest fold into a disclosure. */
const visibleFootnotes = 10

function FootnoteList({
  footnotes,
  start = 1
}: {
  footnotes: SourceFootnote[]
  start?: number
}) {
  return (
    <ol start={start} className='flex flex-col gap-3 text-sm leading-relaxed'>
      {footnotes.map(({ number, title, url, byline, year }) => (
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
              <span lang='en'>
                <MentionText parts={byline} />
              </span>
              {year !== undefined && (
                <>
                  {' · '}
                  <span className='whitespace-nowrap'>{year}</span>
                </>
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/**
 * Numbered footnotes in citation order. The first few show; the rest open on
 * demand, or when a reader follows a marker to one of them.
 */
export function Footnotes({ footnotes }: { footnotes: SourceFootnote[] }) {
  const t = useTranslations('Sources')
  const shown = footnotes.slice(0, visibleFootnotes)
  const more = footnotes.slice(visibleFootnotes)
  return (
    <div className='flex flex-col gap-3'>
      <FootnoteList footnotes={shown} />
      {more.length > 0 && (
        <MoreSources
          showLabel={t('showAll', { count: footnotes.length })}
          hideLabel={t('showFewer')}
        >
          <FootnoteList footnotes={more} start={visibleFootnotes + 1} />
        </MoreSources>
      )}
    </div>
  )
}
