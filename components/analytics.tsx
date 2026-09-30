'use client'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { attributionUrl } from '@/lib/attribution/first-touch'
export function SiteAnalytics({ enabled }: { enabled: boolean }) {
  const path = usePathname()
  if (
    !enabled ||
    path.startsWith('/assessment') ||
    path.startsWith('/admin') ||
    ['/questions', '/corpus', '/user-journeys'].includes(path)
  )
    return null
  return (
    <Analytics
      debug={false}
      beforeSend={(event) => {
        // Only the path and normalized UTM tags reach Vercel; see MEASUREMENT.md.
        const url = attributionUrl(event.url)
        // The script can remain installed after client navigation away from the interview.
        const internal =
          url &&
          (new URL(url).pathname.startsWith('/assessment') ||
            new URL(url).pathname.startsWith('/admin') ||
            ['/questions', '/corpus', '/user-journeys'].includes(
              new URL(url).pathname
            ))
        return url && !internal && event.type === 'pageview'
          ? { type: 'pageview', url }
          : null
      }}
    />
  )
}
