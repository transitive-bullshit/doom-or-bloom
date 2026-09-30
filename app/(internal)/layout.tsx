import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { clientMessages } from '@/i18n/client-messages'
import { siteUrl } from '@/lib/site'
import { SiteShell } from '@/components/site-shell'
import '../globals.css'
import '@/components/worldview/prism-theme.css'

// Admin and local review tools stay outside app/[locale]: English only.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Doom or Bloom',
  robots: { index: false, follow: false }
}

export default async function InternalLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={clientMessages(await getMessages())}>
          <SiteShell languageSelect={false}>{children}</SiteShell>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
