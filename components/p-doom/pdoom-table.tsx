'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  sortPdoomRows,
  type PdoomRow,
  type PdoomSort as Sort,
  type PdoomSortKey as SortKey
} from '@/lib/p-doom/table'

// Labels arrive translated from the server, which keeps this table's copy out
// of the client message bundle.
export type PdoomTableLabels = Record<SortKey, string> & {
  sort: Record<SortKey, string>
  none: string
  notEstimated: string
  source: string
}

function SortHeader({
  column,
  sort,
  onSort,
  label,
  children
}: {
  column: SortKey
  sort: Sort
  onSort: (sort: Sort) => void
  label: string
  children: ReactNode
}) {
  const active = sort.key === column
  const Icon = !active
    ? ArrowUpDown
    : sort.direction === 'asc'
      ? ArrowUp
      : ArrowDown
  return (
    <TableHead
      aria-sort={
        active
          ? sort.direction === 'asc'
            ? 'ascending'
            : 'descending'
          : 'none'
      }
      className='h-auto py-2 align-bottom whitespace-normal'
    >
      <Button
        variant='ghost'
        size='sm'
        aria-label={label}
        className='-ml-2 h-auto min-h-8 py-1 text-left whitespace-normal'
        onClick={() =>
          onSort({
            key: column,
            // Numbers open highest first; names open A to Z.
            direction: active
              ? sort.direction === 'asc'
                ? 'desc'
                : 'asc'
              : column === 'name'
                ? 'asc'
                : 'desc'
          })
        }
      >
        {children}
        <Icon data-icon='inline-end' aria-hidden />
      </Button>
    </TableHead>
  )
}

/** Simulated thought leaders with stated and simulated P(doom), sortable. */
export function PdoomTable({
  rows,
  labels
}: {
  rows: PdoomRow[]
  labels: PdoomTableLabels
}) {
  const [sort, setSort] = useState<Sort>({
    key: 'simulated',
    direction: 'desc'
  })
  const header = (column: SortKey) => (
    <SortHeader
      column={column}
      sort={sort}
      onSort={setSort}
      label={labels.sort[column]}
    >
      {labels[column]}
    </SortHeader>
  )
  return (
    <Table data-slot='pdoom-table' className='table-fixed'>
      <colgroup>
        <col className='w-[40%]' />
        <col className='w-[30%]' />
        <col className='w-[30%]' />
      </colgroup>
      <TableHeader>
        <TableRow>
          {header('name')}
          {header('stated')}
          {header('simulated')}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortPdoomRows(rows, sort).map((row) => (
          <TableRow key={row.slug}>
            <TableCell className='py-3 align-top whitespace-normal'>
              <Link
                href={`/users/${row.slug}`}
                prefetch={false}
                className='flex items-center gap-2 rounded-sm font-medium underline-offset-4 hover:underline sm:gap-3'
              >
                <Image
                  src={row.avatar}
                  alt=''
                  width={32}
                  height={32}
                  sizes='32px'
                  quality={90}
                  className='image-outline size-7 shrink-0 rounded-full object-cover sm:size-8'
                />
                <span className='min-w-0 text-pretty wrap-anywhere'>
                  {row.name}
                </span>
              </Link>
            </TableCell>
            <TableCell className='py-3 align-top whitespace-normal'>
              {row.stated ? (
                <div className='flex flex-col gap-1'>
                  <span className='font-semibold tabular-nums'>
                    {row.stated.token}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {row.stated.outcome}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    <span className='sr-only'>{labels.source}: </span>
                    <a
                      href={row.stated.source.url}
                      target='_blank'
                      rel='noreferrer'
                      className='underline underline-offset-4'
                    >
                      {row.stated.source.title}
                    </a>
                    {' · '}
                    <time dateTime={row.stated.source.dateTime}>
                      {row.stated.source.date}
                    </time>
                  </span>
                </div>
              ) : (
                <span className='text-muted-foreground'>
                  <span aria-hidden>—</span>
                  <span className='sr-only'>{labels.none}</span>
                </span>
              )}
            </TableCell>
            <TableCell className='py-3 align-top whitespace-normal'>
              {row.simulated ? (
                <div className='flex flex-col gap-1'>
                  <span className='font-semibold tabular-nums'>
                    {row.simulated.token}
                  </span>
                  {row.simulated.range && (
                    <span className='text-xs text-muted-foreground'>
                      {row.simulated.range}
                    </span>
                  )}
                </div>
              ) : (
                <span className='text-muted-foreground'>
                  {labels.notEstimated}
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
