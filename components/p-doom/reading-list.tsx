import type { HubReading } from '@/lib/p-doom/hub'
import { MentionText } from '@/components/mention-text'
import { SourceLink } from '@/components/sources/footnotes'

/** Recommended readings, each with its site's favicon and a one-line reason. */
export function ReadingList({ readings }: { readings: HubReading[] }) {
  return (
    <ul className='flex flex-col gap-4 text-sm leading-relaxed'>
      {readings.map(({ title, url, byline, year, kind, blurb }) => (
        <li key={url} className='flex flex-col gap-1'>
          <SourceLink title={title} url={url} />
          <p className='pl-6 text-muted-foreground'>
            <MentionText parts={byline} /> · {year} · {kind}
          </p>
          <p className='pl-6 text-body-foreground'>
            <MentionText parts={blurb} />
          </p>
        </li>
      ))}
    </ul>
  )
}
