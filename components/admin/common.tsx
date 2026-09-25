import type { ReactNode } from 'react'
import { AdminDate, AdminTimeZone } from './local-time'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription
} from '@/components/ui/empty'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { adminHref, type AdminFilters } from '@/lib/admin/filters'
import { assessmentStatus, type AdminAssessmentRow } from '@/lib/admin/queries'

export function AdminHeading({
  title,
  description
}: {
  title: string
  description: ReactNode
}) {
  return (
    <div className='flex flex-col gap-2'>
      <h1>{title}</h1>
      <p className='text-muted-foreground'>{description}</p>
    </div>
  )
}
export function AdminFiltersForm({
  filters,
  action
}: {
  filters: AdminFilters
  action: string
}) {
  const options = [
    [
      'range',
      'Started',
      filters.range,
      [
        ['all', 'All time'],
        ['24h', 'Last 24 hours'],
        ['7d', 'Past week'],
        ['30d', 'Past 30 days']
      ]
    ],
    [
      'state',
      'State',
      filters.state,
      [
        ['all', 'Any state'],
        ['completed', 'Completed · has results'],
        ['active', 'No results yet'],
        ['recovery', 'Answer recovery'],
        ['attention', 'Needs attention']
      ]
    ],
    [
      'origin',
      'Origin',
      filters.origin,
      [
        ['participant', 'Participants'],
        ['simulation', 'Simulations'],
        ['all', 'All origins']
      ]
    ],
    [
      'identity',
      'Identity',
      filters.identity,
      [
        ['all', 'All identities'],
        ['anonymous', 'Anonymous'],
        ['signed-in', 'Non-anonymous']
      ]
    ],
    [
      'sort',
      'Order',
      filters.sort,
      [
        ['updated', 'Recently updated'],
        ['created', 'Newest started']
      ]
    ]
  ] as const
  return (
    <form action={action} className='flex flex-col gap-4'>
      <FieldGroup className='flex-row flex-wrap gap-3'>
        {options.map(([name, label, value, choices]) => (
          <Field key={name} className='w-auto gap-2'>
            <FieldLabel htmlFor={name}>{label}</FieldLabel>
            <NativeSelect id={name} name={name} defaultValue={value}>
              {choices.map(([id, text]) => (
                <NativeSelectOption key={id} value={id}>
                  {text}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Field>
        ))}
        <Field className='min-w-44 flex-1 gap-2'>
          <FieldLabel htmlFor='q'>Search</FieldLabel>
          <Input
            id='q'
            name='q'
            defaultValue={filters.query}
            placeholder='Name, title, user or assessment ID'
            maxLength={120}
          />
        </Field>
        <div className='flex items-end'>
          <Button type='submit'>Apply</Button>
        </div>
      </FieldGroup>
    </form>
  )
}
export function AdminEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No matching records</EmptyTitle>
        <EmptyDescription>
          Try a wider date range or clear your filters.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
export function AdminPagination({
  total,
  filters,
  path
}: {
  total: number
  filters: AdminFilters
  path: string
}) {
  return (
    <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground'>
      <span>
        {total.toLocaleString()} records · Page {filters.page} of{' '}
        {Math.max(1, Math.ceil(total / 25))}
      </span>
      <div className='flex gap-2'>
        {filters.page > 1 && (
          <Button variant='outline' size='sm' asChild>
            <Link
              prefetch={false}
              href={adminHref(path, filters, { page: filters.page - 1 })}
            >
              Previous
            </Link>
          </Button>
        )}
        {filters.page * 25 < total && (
          <Button variant='outline' size='sm' asChild>
            <Link
              prefetch={false}
              href={adminHref(path, filters, { page: filters.page + 1 })}
            >
              Next
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
export function ownerLabel(row: {
  owner_id: string
  name: string
  is_anonymous: boolean | null
  x_username: string | null
}) {
  return row.is_anonymous
    ? `Anonymous · ${row.owner_id.slice(0, 8)}`
    : row.x_username
      ? `@${row.x_username}`
      : row.name
}
export function AdminAssessmentTable({ rows }: { rows: AdminAssessmentRow[] }) {
  if (!rows.length) return <AdminEmpty />
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Assessment</TableHead>
          <TableHead>User</TableHead>
          <TableHead>State</TableHead>
          <TableHead>Answers</TableHead>
          <TableHead>
            Updated · <AdminTimeZone />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <Link
                prefetch={false}
                className='font-medium underline-offset-4 hover:underline'
                href={`/admin/assessments/${row.id}`}
              >
                {row.title || 'Your AI worldview'}
              </Link>
              <div className='mt-1 flex gap-2 text-xs text-muted-foreground'>
                <span>{row.id.slice(0, 8)}</span>
                {row.is_fork && <span>Fork</span>}
                {row.origin === 'simulation' && <span>Simulation</span>}
              </div>
            </TableCell>
            <TableCell>
              <Link
                prefetch={false}
                href={`/admin/users/${encodeURIComponent(row.owner_id)}`}
                className='underline-offset-4 hover:underline'
              >
                {ownerLabel(row)}
              </Link>
            </TableCell>
            <TableCell>
              <div className='flex flex-wrap gap-1'>
                <Badge
                  variant={
                    assessmentStatus(row) === 'Needs attention'
                      ? 'destructive'
                      : 'secondary'
                  }
                >
                  {assessmentStatus(row)}
                </Badge>
                {row.visibility === 'public' && (
                  <Badge variant='outline'>Public</Badge>
                )}
                {row.has_result && assessmentStatus(row) !== 'Completed' && (
                  <Badge variant='outline'>Has results</Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              {row.answers}{' '}
              <span className='text-muted-foreground'>
                / {row.prompts} prompts
              </span>
            </TableCell>
            <TableCell>
              <AdminDate value={new Date(row.updated_at)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
export function MetricCard({
  title,
  value,
  description
}: {
  title: string
  value: number | string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle>
          <span className='text-3xl tabular-nums'>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </CardContent>
    </Card>
  )
}
