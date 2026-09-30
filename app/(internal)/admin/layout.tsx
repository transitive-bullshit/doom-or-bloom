import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { requireLocalAdmin } from '@/lib/admin/guard'
import { AdminShell } from '@/components/admin/shell'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Local admin · Doom or Bloom',
  robots: { index: false, follow: false }
}
export default async function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  await requireLocalAdmin()
  return (
    <AdminShell
      target={
        process.env.ADMIN_DATABASE_TARGET === 'production'
          ? 'production'
          : 'local'
      }
    >
      {children}
    </AdminShell>
  )
}
