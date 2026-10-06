import type { SourceFootnote } from '@/lib/sources/citations'
import { Footnotes } from './footnotes'

/**
 * A page's closing list of numbered sources, the same on the P(doom) hub,
 * About and blog posts. It widens past the reading column on desktop.
 */
export function SourcesSection({
  id,
  title,
  footnotes
}: {
  /** The heading's id, which the section is labelled by. */
  id: string
  title: string
  footnotes: SourceFootnote[]
}) {
  return (
    <section
      aria-labelledby={id}
      data-slot='sources'
      className='reference-breakout flex flex-col gap-5 border-t pt-10'
    >
      <h2 id={id} className='scroll-mt-24'>
        {title}
      </h2>
      <Footnotes footnotes={footnotes} />
    </section>
  )
}
