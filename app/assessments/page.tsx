import { headers } from 'next/headers'
import { getAuth } from '@/lib/auth/server'
import { repository } from '@/lib/assessments/server'
import { AssessmentLibrary } from '@/components/assessment/library'
export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'My assessments',
  robots: { index: false, follow: false }
}
export default async function Page() {
  const session = await getAuth().api.getSession({ headers: await headers() })
  const items = session ? await repository().list(session.user.id) : []
  return (
    <AssessmentLibrary
      items={items.map((item) => ({
        ...item,
        updatedAt: item.updatedAt.toISOString()
      }))}
    />
  )
}
