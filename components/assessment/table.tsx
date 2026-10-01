'use client'

import { useState, type ReactNode } from 'react'
import { useLocale, useMessages, useTranslations } from 'next-intl'
import { defaultLocale, languageTag } from '@/i18n/config'
import type { Translator } from '@/i18n/translator'
import { getPathname, Link } from '@/i18n/navigation'
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

function createdDate(item: LibraryItem, tag: string) {
  return new Intl.DateTimeFormat(tag, {
    dateStyle: 'medium',
    timeZone: 'UTC'
  }).format(new Date(item.createdAt))
}

function status(item: LibraryItem) {
  return item.visibility === 'public'
    ? 'published'
    : item.hasResults
      ? 'ready'
      : 'inProgress'
}

// New assessments are saved as "Your AI worldview #<n>"; show that title, and
// a missing one, in the active locale. Other saved titles show as written.
function title(t: Translator<'Library'>, item: LibraryItem) {
  if (item.title === null) return t('untitled')
  const number = /^Your AI worldview #(\d+)$/u.exec(item.title)?.[1]
  return number ? t('numbered', { number }) : item.title
}

function SortHeader<TValue>({
  column,
  children
}: {
  column: Column<typeof features, LibraryItem, TValue>
  children: ReactNode
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
  onDelete,
  readOnly = false,
  hrefPrefix = '/assessments',
  datePresentation
}: {
  datePresentation?: {
    heading: ReactNode
    render: (value: string) => ReactNode
  }
  readOnly?: boolean
  hrefPrefix?: string
  items: LibraryItem[]
  busy: boolean
  onPublish: (item: LibraryItem) => void
  onMakePrivate: (item: LibraryItem) => void
  onDelete: (item: LibraryItem) => void
}) {
  const root = useTranslations()
  const t = useTranslations('Library')
  const locale = useLocale()
  const messages = useMessages()
  const tag = languageTag(locale)
  const date = (item: LibraryItem) =>
    datePresentation ? (
      datePresentation.render(item.createdAt)
    ) : (
      <time dateTime={item.createdAt}>{createdDate(item, tag)}</time>
    )
  const statusLabel = (item: LibraryItem) => t(`status.${status(item)}`)
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
      const query = locale === defaultLocale ? '' : `?locale=${locale}`
      const image = fetch(`/api/assessments/${id}/results-image${query}`, {
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
          await savedReport(id, image, { locale, messages }),
          root('Report.filename', { id })
        )
      } else {
        downloadBlob(await image, 'doom-or-bloom.png')
      }
      toast.success(
        action === 'copy'
          ? t('imageCopied')
          : action === 'report'
            ? t('reportStarted')
            : t('imageStarted')
      )
    } catch {
      toast.error(
        action === 'copy'
          ? t('imageCopyFailed')
          : action === 'report'
            ? t('reportFailed')
            : t('imageFailed')
      )
    } finally {
      setExporting(false)
    }
  }
  async function copyPublicLink(id: string) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}${getPathname({ href: `/public/assessments/${id}`, locale })}`
      )
      toast.success(t('publicCopied'))
    } catch {
      toast.error(t('publicCopyFailed'))
    }
  }
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }
  ])
  const columns = helper.columns([
    helper.accessor('title', {
      header: t('assessment'),
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          className='flex min-h-13 w-full flex-col items-start justify-center gap-2 px-3 py-3 font-medium sm:flex-row sm:items-center sm:justify-start sm:px-2'
          href={`${hrefPrefix}/${row.original.id}`}
        >
          <span className='wrap-anywhere'>{title(t, row.original)}</span>
          <span className='flex flex-wrap items-center gap-2 sm:hidden'>
            <span className='text-xs font-normal text-muted-foreground'>
              {date(row.original)}
            </span>
            <Badge variant='outline'>{statusLabel(row.original)}</Badge>
          </span>
        </Link>
      )
    }),
    helper.accessor('createdAt', {
      header: ({ column }) => (
        <SortHeader column={column}>
          {datePresentation?.heading ?? t('dateCreated')}
        </SortHeader>
      ),
      sortFn: 'text',
      cell: ({ row }) => date(row.original)
    }),
    helper.accessor(status, {
      id: 'status',
      header: ({ column }) => (
        <SortHeader column={column}>{t('statusHeading')}</SortHeader>
      ),
      sortFn: 'text',
      cell: ({ row }) =>
        row.original.visibility === 'public' && !readOnly ? (
          <Badge asChild variant='outline'>
            <Link href={`/public/assessments/${row.original.id}`}>
              {t('status.published')}
            </Link>
          </Badge>
        ) : (
          <Badge variant='outline'>{statusLabel(row.original)}</Badge>
        )
    }),
    helper.display({
      id: 'actions',
      header: () => <span className='sr-only'>{t('actions')}</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              disabled={busy || exporting}
              aria-label={t('actionsFor', { title: title(t, row.original) })}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuGroup>
              {row.original.visibility === 'private' &&
                row.original.hasResults && (
                  <DropdownMenuItem onSelect={() => onPublish(row.original)}>
                    {t('publish')}
                  </DropdownMenuItem>
                )}
              {row.original.visibility === 'public' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href={`/public/assessments/${row.original.id}`}>
                      {t('viewPublic')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void copyPublicLink(row.original.id)}
                  >
                    {t('copyPublic')}
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
                    {t('downloadImage')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => void exportResults(row.original.id, 'copy')}
                  >
                    {t('copyImage')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() =>
                      void exportResults(row.original.id, 'report')
                    }
                  >
                    {t('downloadReport')}
                  </DropdownMenuItem>
                </>
              )}
              {row.original.visibility === 'public' && (
                <DropdownMenuItem onSelect={() => onMakePrivate(row.original)}>
                  {t('makePrivate')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant='destructive'
                onSelect={() => onDelete(row.original)}
              >
                {t('delete')}
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
    columns: readOnly
      ? columns.filter((column) => column.id !== 'actions')
      : columns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (item) => item.id,
    enableMultiSort: false
  })
  return (
    <div className='flex min-w-0 flex-col gap-2'>
      <div
        className='flex flex-wrap items-center gap-3 sm:hidden'
        aria-label={t('sortAssessments')}
      >
        <span className='text-sm text-muted-foreground'>{t('sortBy')}</span>
        <SortHeader column={table.getColumn('createdAt')!}>
          {datePresentation?.heading ?? t('dateCreated')}
        </SortHeader>
        <SortHeader column={table.getColumn('status')!}>
          {t('statusHeading')}
        </SortHeader>
      </div>
      <div className='min-w-0 rounded-md border'>
        <Table aria-label={t('title')}>
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
