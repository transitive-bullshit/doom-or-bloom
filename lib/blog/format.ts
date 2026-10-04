/** A post's date as the page's language writes it, e.g. "October 1, 2026". */
export function postDate(date: string, tag: string) {
  return new Intl.DateTimeFormat(tag, {
    dateStyle: 'long',
    timeZone: 'UTC'
  }).format(new Date(date))
}
