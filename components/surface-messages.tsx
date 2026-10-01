import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { clientMessages, type Surface } from '@/i18n/client-messages'

/**
 * Sends a page's client components the message namespaces of one surface, in
 * addition to the site chrome the root layout already provides.
 */
export async function SurfaceMessages({
  surface,
  children
}: {
  surface: Surface
  children: ReactNode
}) {
  return (
    <NextIntlClientProvider
      messages={clientMessages(await getMessages(), surface)}
    >
      {children}
    </NextIntlClientProvider>
  )
}
