import Link from 'next/link'
import { requireLocalAdmin } from '@/lib/admin/guard'
import { adminFilters, adminHref, type AdminSearch } from '@/lib/admin/filters'
import { listAssessments, overview } from '@/lib/admin/queries'
import {
  AdminHeading,
  AdminFiltersForm,
  AdminAssessmentTable,
  MetricCard
} from '@/components/admin/common'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
export default async function Page({
  searchParams
}: {
  searchParams: Promise<AdminSearch>
}) {
  await requireLocalAdmin()
  const filters = adminFilters(await searchParams)
  const [metrics, recent] = await Promise.all([
    overview(filters),
    listAssessments({ ...filters, page: 1 })
  ])
  return (
    <>
      <AdminHeading
        title='Overview'
        description='A quick view of saved assessments and the people behind them.'
      />
      <AdminFiltersForm filters={filters} action='/admin' />
      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <MetricCard
          title='Assessments started'
          value={metrics.started}
          description='Saved at first submission; includes forks.'
        />
        <MetricCard
          title='With accepted answers'
          value={metrics.answered}
          description={`${metrics.answers.toLocaleString()} accepted answers in these conversations.`}
        />
        <MetricCard
          title='Completed'
          value={metrics.completed}
          description={`${metrics.started ? Math.round((metrics.completed / metrics.started) * 100) : 0}% have a current result, including provisional results.`}
        />
        <MetricCard
          title='Users'
          value={metrics.owners}
          description='Distinct current owners of matching assessments.'
        />
      </div>
      <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
        <Link
          prefetch={false}
          className='underline underline-offset-4'
          href={adminHref('/admin/assessments', filters, {
            state: 'attention',
            page: 1
          })}
        >
          {metrics.attention} need attention
        </Link>
        <span>{metrics.published} public assessments</span>
      </div>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between gap-3'>
            <CardTitle>Recent assessments</CardTitle>
            <Button variant='outline' size='sm' asChild>
              <Link
                prefetch={false}
                href={adminHref('/admin/assessments', filters, { page: 1 })}
              >
                View all
              </Link>
            </Button>
          </div>
          <CardDescription>
            Most recently updated within your selected cohort.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminAssessmentTable rows={recent.rows.slice(0, 8)} />
        </CardContent>
      </Card>
      <details className='text-sm text-muted-foreground'>
        <summary className='cursor-pointer'>How to read these numbers</summary>
        <p className='mt-3 max-w-3xl'>
          All filters apply to the cards and lists. Dates select assessments by
          their creation time, then show their current state. Opening an
          unanswered draft is not stored, so starts here are first submissions,
          not visits or CTA clicks. Deleted records are excluded. Answer totals
          include inherited answers in forks. Completed means a current saved
          result exists; it does not prove the user viewed it. Anonymous IDs
          identify browser identities, not unique people; after sign-in,
          ownership may transfer. All displayed dates use UTC.
        </p>
      </details>
    </>
  )
}
