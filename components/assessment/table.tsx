'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from 'cn'
import { toast } from 'sonner'
import { downloadBlob } from '@/lib/sharing/report'
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from 'lucide-react'
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_text,
  tableFeatures,
  useTable,
  type Column,
  type SortingState
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import type { LibraryItem } from './library'

const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { text: sortFn_text }
})
const helper = createColumnHelper<typeof features, LibraryItem>()

function createdDate(item: LibraryItem) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC'
  }).format(new Date(item.createdAt))
}

function status(item: LibraryItem) {
  return item.visibility === 'public'
    ? 'Published'
    : item.hasResults
      ? 'Ready to publish'
      : 'In progress'
}

function SortHeader<TValue>({
  column,
  children
}: {
  column: Column<typeof features, LibraryItem, TValue>
  children: string
}) {
  const sorted = column.getIsSorted()
  const Icon =
    sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown
  return (
    <Button
      variant='ghost'
      size='sm'
      className='-ml-2'
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {children}
      <Icon data-icon='inline-end' aria-hidden />
    </Button>
  )
}

export function AssessmentTable({
  items,
  busy,
  onMakePrivate,
  onPublish,
  onDelete
}: {
  items: LibraryItem[]
  busy: boolean
  onPublish: (item: LibraryItem) => void
  onMakePrivate: (item: LibraryItem) => void
  onDelete: (item: LibraryItem) => void
}) {
  const [exporting, setExporting] = useState(false)
  async function exportResults(
    id: string,
    action: 'download' | 'copy' | 'report'
  ) {
    if (busy || exporting) return
    setExporting(true)
    try {
      if (
        action === 'copy' &&
        (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined')
      ) {
        throw new Error('Image copying unavailable')
      }
      const image = fetch(`/api/assessments/${id}/results-image`, {
        cache: 'no-store'
      }).then((response) => {
        if (!response.ok) throw new Error('Image unavailable')
        return response.blob()
      })
      // Attach a rejection handler immediately, including if clipboard access is denied.
      void image.catch(() => {})
      if (action === 'copy') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': image })
        ])
      } else if (action === 'report') {
        const { savedReport } = await import('@/lib/sharing/saved-report')
        downloadBlob(
          await savedReport(id, image),
          `doom or bloom assessment ${id}.zip`
        )
      } else {
        downloadBlob(await image, 'doom-or-bloom.png')
      }
      toast.success(
        action === 'copy'
          ? 'Results image copied.'
          : action === 'report'
            ? 'Full report download started.'
            : 'Results image download started.'
      )
    } catch {
      toast.error(
        action === 'copy'
          ? 'Couldn’t copy the image. Try downloading it instead.'
          : action === 'report'
            ? 'Couldn’t download the report. Please try again.'
            : 'Couldn’t download the image. Please try again.'
      )
    } finally {
      setExporting(false)
    }
  }
  async function copyPublicLink(id: string) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/public/assessments/${id}`
      )
      toast.success('Public link copied.')
    } catch {
      toast.error('Unable to copy. Open the public assessment to copy its URL.')
    }
  }
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }
  ])
  const columns = helper.columns([
    helper.accessor('title', {
      header: 'Assessment',
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          className='flex min-h-13 w-full flex-col items-start justify-center gap-2 px-3 py-3 font-medium sm:flex-row sm:items-center sm:justify-start sm:px-2'
          href={`/assessments/${row.original.id}`}
        >
          <span className='wrap-anywhere'>
            {row.original.title ?? 'Your AI worldview'}
          </span>
          <span className='flex flex-wrap items-center gap-2 sm:hidden'>
            <time
              dateTime={row.original.createdAt}
              className='text-xs font-normal text-muted-foreground'
            >
              {createdDate(row.original)}
            </time>
            <Badge variant='outline'>{status(row.original)}</Badge>
          </span>
        </Link>
      )
    }),
    helper.accessor('createdAt', {
      header: ({ column }) => (
        <SortHeader column={column}>Date created</SortHeader>
      ),
      sortFn: 'text',
      cell: ({ row }) => (
        <time dateTime={row.original.createdAt}>
          {createdDate(row.original)}
        </time>
      )
    }),
    helper.accessor(status, {
      id: 'status',
      header: ({ column }) => <SortHeader column={column}>Status</SortHeader>,
      sortFn: 'text',
      cell: ({ row }) =>
        row.original.visibility === 'public' ? (
          <Badge asChild variant='outline'>
            <Link href={`/public/assessments/${row.original.id}`}>
              Published
            </Link>
          </Badge>
        ) : (
          <Badge variant='outline'>{status(row.original)}</Badge>
        )
    }),
    helper.display({
      id: 'actions',
      header: () => <span className='sr-only'>Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              disabled={busy || exporting}
              aria-label={`Actions for ${row.original.title ?? 'Your AI worldview'}`}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              {row.original.visibility === 'private' &&
                row.original.hasResults && (
                  <DropdownMenuItem onSelect={() => onPublish(row.original)}>
                    Publish assessment
                  </DropdownMenuItem>
                )}
              {row.original.visibility === 'public' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/public/assessments/${row.original.id}`}>
                      View public assessment
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void copyPublicLink(row.original.id)}
                  >
                    Copy link to public assessment
                  </DropdownMenuItem>
                </>
              )}
              {(row.original.hasResults ||
                row.original.visibility === 'public') && (
                <>
                  <DropdownMenuItem
                    onSelect={() =>
                      void exportResults(row.original.id, 'download')
                    }
                  >
                    Download results image
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void exportResults(row.original.id, 'copy')}
                  >
                    Copy results image
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      void exportResults(row.original.id, 'report')
                    }
                  >
                    Download full report
                  </DropdownMenuItem>
                </>
              )}
              {row.original.visibility === 'public' && (
                <DropdownMenuItem onSelect={() => onMakePrivate(row.original)}>
                  Make private
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant='destructive'
                onSelect={() => onDelete(row.original)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    })
  ])
  const table = useTable({
    features,
    data: items,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (item) => item.id,
    enableMultiSort: false
  })
  return (
    <div className='flex min-w-0 flex-col gap-2'>
      <div
        className='flex flex-wrap items-center gap-3 sm:hidden'
        aria-label='Sort assessments'
      >
        <span className='text-sm text-muted-foreground'>Sort by</span>
        <SortHeader column={table.getColumn('createdAt')!}>
          Date created
        </SortHeader>
        <SortHeader column={table.getColumn('status')!}>Status</SortHeader>
      </div>
      <div className='min-w-0 rounded-md border'>
        <Table aria-label='My assessments'>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      (header.column.id === 'createdAt' ||
                        header.column.id === 'status') &&
                        'hidden sm:table-cell',
                      header.column.id === 'actions' && 'w-13'
                    )}
                    aria-sort={
                      header.column.getIsSorted() === 'asc'
                        ? 'ascending'
                        : header.column.getIsSorted() === 'desc'
                          ? 'descending'
                          : undefined
                    }
                  >
                    <table.FlexRender header={header} />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.id === 'title' &&
                        'h-px p-0 whitespace-normal [&>a]:h-full',
                      (cell.column.id === 'createdAt' ||
                        cell.column.id === 'status') &&
                        'hidden sm:table-cell'
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
