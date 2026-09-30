import { AdminDate, AdminTimeZone } from '@/components/admin/local-time'
import Link from 'next/link'
import { requireLocalAdmin } from '@/lib/admin/guard'
import { adminFilters, type AdminSearch } from '@/lib/admin/filters'
import { listUsers } from '@/lib/admin/queries'
import {
  AdminHeading,
  AdminFiltersForm,
  AdminPagination,
  AdminEmpty,
  ownerLabel
} from '@/components/admin/common'
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
export default async function Page({
  searchParams
}: {
  searchParams: Promise<AdminSearch>
}) {
  await requireLocalAdmin()
  const filters = adminFilters(await searchParams)
  const result = await listUsers(filters)
  return (
    <>
      <AdminHeading
        title='Users'
        description='Current owners of matching assessments. Anonymous identities are browser identities, not unique people.'
      />
      <AdminFiltersForm filters={filters} action='/admin/users' />
      {!result.rows.length ? (
        <AdminEmpty />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Identity</TableHead>
              <TableHead>Assessments</TableHead>
              <TableHead>Completed</TableHead>
              <TableHead>
                Last activity · <AdminTimeZone />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.rows.map((row) => (
              <TableRow key={row.owner_id}>
                <TableCell>
                  <Link
                    prefetch={false}
                    className='font-medium hover:underline'
                    href={`/admin/users/${encodeURIComponent(row.owner_id)}`}
                  >
                    {ownerLabel(row)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant='outline'>
                    {row.is_anonymous ? 'Anonymous' : 'Non-anonymous'}
                  </Badge>
                </TableCell>
                <TableCell>{row.assessments}</TableCell>
                <TableCell>{row.completed}</TableCell>
                <TableCell>
                  <AdminDate value={new Date(row.last_activity)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <AdminPagination
        total={result.total}
        filters={filters}
        path='/admin/users'
      />
    </>
  )
}
