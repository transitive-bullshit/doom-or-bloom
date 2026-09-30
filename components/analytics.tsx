'use client'
import { usePathname } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { splitLocalePath } from '@/i18n/config'
import { attributionUrl } from '@/lib/attribution/first-touch'

// Owner, admin and local tool pages are never measured, in any locale.
function internalPath(pathname: string) {
  const { path } = splitLocalePath(pathname)
  return (
    path.startsWith('/assessment') ||
    path.startsWith('/admin') ||
    ['/questions', '/corpus', '/user-journeys'].includes(path)
  )
}

export function SiteAnalytics({ enabled }: { enabled: boolean }) {
  const path = usePathname()
  if (!enabled || internalPath(path)) return null
  return (
    <Analytics
      debug={false}
      beforeSend={(event) => {
        // Only the path and normalized UTM tags reach Vercel; see MEASUREMENT.md.
        const url = attributionUrl(event.url)
        // The script can remain installed after client navigation away from the interview.
        return url &&
          !internalPath(new URL(url).pathname) &&
          event.type === 'pageview'
          ? { type: 'pageview', url }
          : null
      }}
    />
  )
}
