import { Fragment } from 'react'
import { Link } from '@/i18n/navigation'
import type { MentionPart } from '@/lib/personas/mentions'

/** Text whose mentioned people link to their simulated profiles. */
export function MentionText({ parts }: { parts: readonly MentionPart[] }) {
  return parts.map((part, index) =>
    part.slug ? (
      <Link
        key={index}
        href={`/users/${part.slug}`}
        prefetch={false}
        className='underline underline-offset-4'
      >
        {part.text}
      </Link>
    ) : (
      <Fragment key={index}>{part.text}</Fragment>
    )
  )
}
