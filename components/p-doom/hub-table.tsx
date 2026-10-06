import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { Citation as CitationData } from '@/lib/p-doom/citations'
import type { HubRow } from '@/lib/p-doom/hub'
import { Citation } from './citation'

/**
 * Curated thought leaders, lowest stated P(doom) first, then those who decline
 * to give one. Each row shows the number or "No number", then the person's
 * exact words with the footnote for their source. A row with nothing to quote
 * footnotes the number instead and adds a note on what it is a chance of. Ranges and lower bounds keep their order and are never reduced
 * to a midpoint; the sortable catalog is /users.
 */
export function HubTable({
  rows
}: {
  rows: (HubRow & { citation: CitationData })[]
}) {
  const t = useTranslations('PdoomHub')
  return (
    <Table data-slot='pdoom-table' className='table-fixed'>
      <colgroup>
        <col className='w-[34%] sm:w-[32%]' />
        <col />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead scope='col' className='h-auto py-2 whitespace-normal'>
            {t('name')}
          </TableHead>
          <TableHead scope='col' className='h-auto py-2 whitespace-normal'>
            {t('stated')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.slug}>
            {/* The row header attributes the number and quote beside it. */}
            <th
              scope='row'
              className='px-2 py-3 text-left align-top font-medium'
            >
              <Link
                href={`/users/${row.slug}`}
                prefetch={false}
                className='flex flex-col items-start gap-1.5 rounded-sm underline-offset-4 hover:underline sm:flex-row sm:items-center sm:gap-3'
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
            </th>
            <TableCell className='py-3 align-top whitespace-normal'>
              <div className='flex flex-col gap-1.5'>
                <span
                  className={
                    row.token
                      ? 'font-semibold tabular-nums'
                      : 'font-semibold text-muted-foreground'
                  }
                >
                  {row.token ?? t('declined')}
                  {/* Without a quote, the number carries the footnote. */}
                  {!row.quote && <Citation {...row.citation} />}
                </span>
                {row.quote && (
                  <span className='border-l-2 border-coral pl-3 text-pretty text-body-foreground'>
                    <q lang='en' cite={row.source.url} className='italic'>
                      {row.quote}
                    </q>
                    <Citation {...row.citation} />
                  </span>
                )}
                {row.note && (
                  <span
                    lang='en'
                    className='text-sm text-pretty text-muted-foreground'
                  >
                    {row.note}
                  </span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
