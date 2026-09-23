import type { Metadata } from 'next'
import { siteUrl } from '@/lib/site'
import Image from 'next/image'
import Link from 'next/link'
import { DevelopmentFeedback } from '@/components/development-feedback'

import type { ReactNode } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { SiteBreadcrumbs } from '@/components/site-breadcrumbs'
import { SiteActions } from '@/components/site-actions'
import { SiteAnalytics } from '@/components/analytics'
import { serverEnv } from '@/lib/server/env'
import './globals.css'
import '@/components/worldview/prism-theme.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Doom or Bloom',
  description: 'Map your AI worldview, and see how it compares with others.',
  robots: { index: true, follow: true },
  twitter: { card: 'summary_large_image' }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className='flex min-h-dvh flex-col'>
            <header
              style={{ viewTransitionName: 'site-header' }}
              className='flex items-center justify-between px-6 py-5'
            >
              <Link
                href='/'
                className='site-logo inline-flex items-center gap-2 rounded-sm text-sm font-semibold tracking-tight'
              >
                <Image
                  src='/icon.svg'
                  alt=''
                  width={24}
                  height={24}
                  className='size-6 shrink-0'
                  loading='eager'
                  unoptimized
                />
                Doom or Bloom
              </Link>
              <SiteActions />
            </header>
            <main className='flex flex-1 flex-col'>
              <SiteBreadcrumbs />
              {children}
            </main>
            <footer
              style={{ viewTransitionName: 'site-footer' }}
              className='flex flex-wrap justify-center gap-5 px-6 py-6 text-xs text-muted-foreground'
            >
              <Link href='/about'>About & methodology</Link>
              <Link href='/privacy'>Privacy</Link>
            </footer>
          </div>
          <Toaster />
          <SiteAnalytics enabled={serverEnv().analytics} />
          {process.env.NODE_ENV === 'development' && <DevelopmentFeedback />}
        </ThemeProvider>
      </body>
    </html>
  )
}
