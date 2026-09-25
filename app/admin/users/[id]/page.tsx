import { notFound } from 'next/navigation'
import { requireLocalAdmin } from '@/lib/admin/guard'
import { adminFilters, type AdminSearch } from '@/lib/admin/filters'
import { inspectUser, listAssessments } from '@/lib/admin/queries'
import {
  AdminHeading,
  AdminFiltersForm,
  AdminAssessmentTable,
  AdminPagination,
  adminDate,
  ownerLabel
} from '@/components/admin/common'
import { AdminLibraryPreview } from '@/components/admin/library-preview'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<AdminSearch>
}) {
  await requireLocalAdmin()
  const { id } = await params
  const user = await inspectUser(id)
  if (!user) notFound()
  const filters = adminFilters({ origin: 'all', ...(await searchParams) })
  const result = await listAssessments(filters, id)
  const path = `/admin/users/${encodeURIComponent(id)}`
  return (
    <>
      <AdminHeading
        title={ownerLabel({ ...user, owner_id: id })}
        description={`Identity created ${adminDate(user.created_at)} UTC`}
      />
      <details className='text-sm'>
        <summary className='cursor-pointer'>Identity details</summary>
        <p className='mt-2 break-all'>
          {id} ·{' '}
          {user.is_anonymous
            ? 'Anonymous browser identity'
            : 'Non-anonymous account'}
        </p>
      </details>
      <AdminFiltersForm filters={filters} action={path} />
      <Tabs defaultValue='admin' className='gap-6'>
        <TabsList>
          <TabsTrigger value='admin'>Assessment history</TabsTrigger>
          <TabsTrigger value='participant'>Participant library</TabsTrigger>
        </TabsList>
        <TabsContent value='admin'>
          <AdminAssessmentTable rows={result.rows} />
        </TabsContent>
        <TabsContent value='participant'>
          <AdminLibraryPreview
            items={result.rows.map((row) => ({
              id: row.id,
              revision: row.revision,
              title: row.title,
              hasResults: row.has_result,
              visibility: row.visibility as 'private' | 'public',
              createdAt: new Date(row.created_at).toISOString(),
              updatedAt: new Date(row.updated_at).toISOString(),
              isFork: row.is_fork
            }))}
          />
        </TabsContent>
      </Tabs>
      <AdminPagination total={result.total} filters={filters} path={path} />
      <p className='text-sm text-muted-foreground'>
        Both views show this page of matching assessments. Clear filters for the
        full history; use pagination for older records.
      </p>
    </>
  )
}
