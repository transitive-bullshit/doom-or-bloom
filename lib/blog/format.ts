import type { Translator } from '@/i18n/translator'
import type { BlogPost } from './posts'

/** A post's date as the page's language writes it, e.g. "October 1, 2026". */
export function postDate(date: string, tag: string) {
  return new Intl.DateTimeFormat(tag, {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(new Date(date))
}

/** "October 1, 2026 · 5 min read" */
export function postMeta(
  t: Translator<'Blog'>,
  tag: string,
  post: Pick<BlogPost, 'date' | 'minutes'>
) {
  return `${postDate(post.date, tag)} · ${t('readingTime', { minutes: post.minutes })}`
}
