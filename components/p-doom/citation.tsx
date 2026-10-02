import { useTranslations } from 'next-intl'
import {
  footnoteId,
  type Citation as CitationData
} from '@/lib/p-doom/citations'
import type { CitedProse } from '@/lib/p-doom/hub'
import { MentionText } from '@/components/mention-text'

/** A bracketed footnote marker linking to its numbered source. */
export function Citation({ number, id }: CitationData) {
  const t = useTranslations('PdoomHub')
  // A word joiner keeps the marker on the line of the word it follows.
  return (
    <>
      {'\u2060'}
      <sup className='scroll-mt-24 text-xs leading-none' id={id}>
        <a
          href={`#${footnoteId(number)}`}
          aria-label={t('cite', { number })}
          className='rounded-sm px-px text-muted-foreground tabular-nums no-underline transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring'
        >
          [{number}]
        </a>
      </sup>
    </>
  )
}

/** Hub prose with italic titles, footnote markers and linked names. */
export function CitedText({ prose }: { prose: CitedProse }) {
  return prose.map((part, index) =>
    'number' in part ? (
      <Citation key={index} {...part} />
    ) : 'emphasis' in part ? (
      <cite key={index}>{part.emphasis}</cite>
    ) : (
      <MentionText key={index} parts={[part]} />
    )
  )
}
