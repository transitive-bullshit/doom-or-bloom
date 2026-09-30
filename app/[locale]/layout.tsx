import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { locales } from '@/i18n/config'
import { clientMessages } from '@/i18n/client-messages'
import { siteUrl } from '@/lib/site'
import { SiteShell } from '@/components/site-shell'
import '../globals.css'
import '@/components/worldview/prism-theme.css'

// Every enabled locale is generated at build time; the locale comes from
// next/root-params (see i18n/request.ts), so pages remain static.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata')
  return {
    metadataBase: new URL(siteUrl),
    title: 'Doom or Bloom',
    description: t('siteDescription'),
    robots: { index: true, follow: true },
    twitter: { card: 'summary_large_image' }
  }
}

export default async function RootLayout({
  children
}: {
  children: ReactNode
}) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={clientMessages(await getMessages())}>
          <SiteShell languageSelect>{children}</SiteShell>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
