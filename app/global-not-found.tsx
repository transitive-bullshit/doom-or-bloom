import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { defaultLocale } from '@/i18n/config'
import { clientMessages } from '@/i18n/client-messages'
import messages from '@/messages/en.json'
import { siteUrl } from '@/lib/site'
import { SiteShell } from '@/components/site-shell'
import { NotFoundGlitch } from '@/components/motion/not-found/glitch'
import './globals.css'
import '@/components/worldview/prism-theme.css'

// URLs that match no route, including unknown paths under /es, get this
// server-rendered English page; Next renders it without params or layouts.
// notFound() inside a page still renders app/[locale]/not-found.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Doom or Bloom',
  description: messages.Metadata.siteDescription
}

export default function GlobalNotFound() {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider
          locale={defaultLocale}
          messages={clientMessages(messages)}
        >
          <SiteShell languageSelect={false}>
            <NotFoundGlitch className='content-column prism-theme' />
          </SiteShell>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
