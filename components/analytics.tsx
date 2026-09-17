'use client'
import { Analytics } from '@vercel/analytics/react'
import { stripUrl } from '@/lib/analytics/events'
export function SiteAnalytics({ enabled }: { enabled: boolean }) {
  if (!enabled) return null
  return (
    <Analytics
      debug={false}
      beforeSend={(event) => {
        const url = stripUrl(event.url)
        return url && event.type === 'pageview'
          ? { type: 'pageview', url }
          : null
      }}
    />
  )
}
