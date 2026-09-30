import { getLocale } from 'next-intl/server'
import { permanentRedirect } from '@/i18n/navigation'

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  permanentRedirect({
    href: `/users/${encodeURIComponent(id)}`,
    locale: await getLocale()
  })
}
