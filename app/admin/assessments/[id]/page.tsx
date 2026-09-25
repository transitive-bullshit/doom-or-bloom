import { AdminDate, AdminTimeZone } from '@/components/admin/local-time'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireLocalAdmin } from '@/lib/admin/guard'
import {
  inspectAssessment,
  assessmentStatus,
  adminComparisons
} from '@/lib/admin/queries'
import { AdminHeading, ownerLabel } from '@/components/admin/common'
import { AdminAssessmentPreview } from '@/components/admin/assessment-preview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { ExperimentalResults } from '@/components/assessment/experimental-results'
import { AssessmentPage } from '@/components/assessment/assessment-page'
import { simulationPresentation } from '@/lib/personas/payload'
import type { AdminSearch } from '@/lib/admin/filters'

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<AdminSearch>
}) {
  await requireLocalAdmin()
  const { id } = await params
  const published = (await searchParams).snapshot === 'published'
  const saved = await inspectAssessment(id, published)
  if (!saved) notFound()
  const { row, state, simulation } = saved
  const comparisons = state?.result ? await adminComparisons() : []
  return (
    <>
      <div className='flex flex-wrap gap-2'>
        <Button variant='outline' size='sm' asChild>
          <Link prefetch={false} href='/admin/assessments'>
            All assessments
          </Link>
        </Button>
        <Button variant='outline' size='sm' asChild>
          <Link
            prefetch={false}
            href={`/admin/users/${encodeURIComponent(row.owner_id)}`}
          >
            {ownerLabel(row)}
          </Link>
        </Button>
      </div>
      <AdminHeading
        title={row.title || 'Your AI worldview'}
        description={`Read-only participant view · ${published ? 'Published' : 'Current'} snapshot · Revision ${saved.snapshotRevision}`}
      />
      <div className='flex flex-wrap items-center gap-2'>
        <Badge variant='secondary'>{assessmentStatus(row)}</Badge>
        <Badge variant='outline'>{row.visibility}</Badge>
        <Badge variant='outline'>{row.origin}</Badge>
        <span className='text-sm text-muted-foreground'>
          {row.answers} accepted answers · Updated{' '}
          <AdminDate value={new Date(row.updated_at)} showZone />
        </span>
      </div>
      {row.visibility === 'public' && (
        <div className='flex flex-wrap gap-2'>
          <Button
            variant={published ? 'outline' : 'secondary'}
            size='sm'
            asChild
          >
            <Link prefetch={false} href={`/admin/assessments/${id}`}>
              Current snapshot
            </Link>
          </Button>
          <Button
            variant={published ? 'secondary' : 'outline'}
            size='sm'
            asChild
          >
            <Link
              prefetch={false}
              href={`/admin/assessments/${id}?snapshot=published`}
            >
              Published snapshot
            </Link>
          </Button>
        </div>
      )}
      {(row.operation_status === 'failed' ||
        row.operation_status === 'interrupted' ||
        row.operation_status === 'running') && (
        <Alert>
          <AlertTitle>{assessmentStatus(row)}</AlertTitle>
          <AlertDescription>
            The conversation below is the last saved snapshot. A pending or
            failed submission may not appear in it; inspect recent operations
            below.
          </AlertDescription>
        </Alert>
      )}
      <details className='text-sm'>
        <summary className='cursor-pointer'>
          Assessment metadata &amp; recent operations
        </summary>
        <div className='mt-4 flex flex-col gap-4'>
          <dl className='grid grid-cols-[auto_1fr] gap-x-4 gap-y-2'>
            <dt>Assessment ID</dt>
            <dd className='break-all'>{row.id}</dd>
            <dt>Owner ID</dt>
            <dd className='break-all'>{row.owner_id}</dd>
            <dt>Started</dt>
            <dd>
              <AdminDate value={new Date(row.created_at)} showZone />
            </dd>
            <dt>Engine state</dt>
            <dd>{state?.status ?? row.engine_status}</dd>
            <dt>Fork</dt>
            <dd>
              {row.is_fork
                ? `Yes · ${row.inherited_prompt_count} inherited prompts`
                : 'No'}
            </dd>
            {state && (
              <>
                <dt>Readiness</dt>
                <dd>
                  {state.result
                    ? state.result.insufficient
                      ? 'Insufficient evidence result'
                      : 'Result available'
                    : 'No result'}
                </dd>
                <dt>Recovery reason</dt>
                <dd>{state.recovery.reason || 'None'}</dd>
                <dt>Versions</dt>
                <dd className='break-all'>
                  {Object.entries(state.versions)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' · ')}
                </dd>
              </>
            )}
          </dl>
          <p className='text-muted-foreground'>
            Latest 30 operations. Expired running requests are shown as
            interrupted without changing the database. Submitted text below has
            not necessarily been accepted into the conversation.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Failure</TableHead>
                <TableHead>
                  Time · <AdminTimeZone />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saved.operations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell>
                    {op.action}
                    {op.submitted_text && (
                      <details className='mt-2'>
                        <summary className='cursor-pointer'>
                          Submitted reply
                        </summary>
                        <p className='max-w-xl whitespace-pre-wrap wrap-anywhere'>
                          {op.submitted_text}
                        </p>
                      </details>
                    )}
                  </TableCell>
                  <TableCell>{op.status}</TableCell>
                  <TableCell>{op.failure_category || '—'}</TableCell>
                  <TableCell>
                    <AdminDate value={new Date(op.created_at)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </details>
      {state && (
        <AdminAssessmentPreview
          key={`${id}:${saved.snapshotRevision}`}
          state={state}
          personas={comparisons}
        />
      )}
      {simulation && (
        <AssessmentPage className='mx-auto flex w-full max-w-5xl flex-col gap-8'>
          <Alert>
            <AlertTitle>Simulated assessment</AlertTitle>
            <AlertDescription>
              This is generated source-grounded content, not a participant
              submission.
            </AlertDescription>
          </Alert>
          {simulation.journey.result && (
            <ExperimentalResults
              result={simulation.journey.result}
              reasoningDetails={false}
            />
          )}
          <h2>Questions &amp; answers</h2>
          {simulationPresentation(simulation).assessment.answers.map(
            (answer) => (
              <article key={answer.id} className='flex flex-col gap-3'>
                <h3>{answer.question}</h3>
                <p className='whitespace-pre-wrap wrap-anywhere'>
                  {answer.answer}
                </p>
              </article>
            )
          )}
        </AssessmentPage>
      )}
      {!state && !simulation && (
        <Alert>
          <AlertTitle>Snapshot is not an interview</AlertTitle>
          <AlertDescription>
            This record contains generation inputs rather than a completed
            conversation.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
