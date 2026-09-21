'use client'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { stripUrl } from '@/lib/analytics/events'
export function SiteAnalytics({ enabled }: { enabled: boolean }) {
  const path = usePathname()
  if (!enabled || ['/questions', '/corpus', '/user-journeys'].includes(path))
    return null
  return (
    <Analytics
      debug={false}
      beforeSend={(event) => {
        const url = stripUrl(event.url)
        // The script can remain installed after client navigation away from the interview.
        const internal =
          url &&
          ['/questions', '/corpus', '/user-journeys'].includes(
            new URL(url).pathname
          )
        return url && !internal && event.type === 'pageview'
          ? { type: 'pageview', url }
          : null
      }}
    />
  )
}
