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
import type { Citation as CitationData } from '@/lib/sources/citations'
import type { HubRow } from '@/lib/p-doom/hub'
import { Citation } from '@/components/sources/citation'

/**
 * Curated thought leaders, lowest stated P(doom) first, then those who decline
 * to give one. Ranges and lower bounds keep their order and are never reduced
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
        <col className='w-[42%] sm:w-[36%]' />
        <col />
      </colgroup>
      <TableHeader>
        <TableRow>
          <TableHead className='h-auto py-2 whitespace-normal'>
            {t('name')}
          </TableHead>
          <TableHead className='h-auto py-2 whitespace-normal'>
            {t('stated')}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
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
              <div className='flex flex-col gap-1'>
                <span
                  className={
                    row.token
                      ? 'font-semibold tabular-nums'
                      : 'font-semibold text-muted-foreground'
                  }
                >
                  {row.token ?? t('declined')}
                  <Citation {...row.citation} />
                </span>
                {row.quote && (
                  <q
                    lang='en'
                    className='border-l-2 border-coral pl-3 text-body-foreground italic'
                  >
                    {row.quote}
                  </q>
                )}
                <span lang='en' className='text-sm text-muted-foreground'>
                  {row.note}
                </span>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
