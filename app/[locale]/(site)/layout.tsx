import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { locale } from 'next/root-params'
import { isLocale } from '@/i18n/config'

// A path that is neither rewritten to /en nor locale-prefixed can still match
// a route here, e.g. /api/about as [locale]=api. The root layout renders it in
// English (see i18n/request.ts); failing here lets its not-found boundary
// answer with the branded 404 instead of an invalid locale's page.
export default async function SiteLayout({
  children
}: {
  children: ReactNode
}) {
  if (!isLocale(await locale())) notFound()
  return children
}
