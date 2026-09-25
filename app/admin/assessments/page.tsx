import { requireLocalAdmin } from '@/lib/admin/guard'
import { adminFilters, type AdminSearch } from '@/lib/admin/filters'
import { listAssessments } from '@/lib/admin/queries'
import {
  AdminHeading,
  AdminFiltersForm,
  AdminAssessmentTable,
  AdminPagination
} from '@/components/admin/common'
export default async function Page({
  searchParams
}: {
  searchParams: Promise<AdminSearch>
}) {
  await requireLocalAdmin()
  const filters = adminFilters(await searchParams)
  const result = await listAssessments(filters)
  return (
    <>
      <AdminHeading
        title='Assessments'
        description='Inspect saved conversations, current results, and processing state.'
      />
      <AdminFiltersForm filters={filters} action='/admin/assessments' />
      <AdminAssessmentTable rows={result.rows} />
      <AdminPagination
        total={result.total}
        filters={filters}
        path='/admin/assessments'
      />
    </>
  )
}
