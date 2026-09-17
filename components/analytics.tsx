'use client'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/react'
import { stripUrl } from '@/lib/analytics/events'
export function SiteAnalytics({ enabled }: { enabled: boolean }) {
  const path = usePathname()
  if (!enabled || path === '/questions' || path === '/corpus') return null
  return (
    <Analytics
      debug={false}
      beforeSend={(event) => {
        const url = stripUrl(event.url)
        // The script can remain installed after client navigation away from the interview.
        const internal =
          url && ['/questions', '/corpus'].includes(new URL(url).pathname)
        return url && !internal && event.type === 'pageview'
          ? { type: 'pageview', url }
          : null
      }}
    />
  )
}
