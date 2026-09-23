import { headers } from 'next/headers'
import { getAuth } from '@/lib/auth/server'
import { repository } from '@/lib/assessments/server'
import { AssessmentLibrary } from '@/components/assessment/library'
export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'My assessments',
  robots: { index: false, follow: false }
}
export default async function Page({
  searchParams
}: {
  searchParams: Promise<{ authError?: string }>
}) {
  const session = await getAuth().api.getSession({ headers: await headers() })
  const error = (await searchParams).authError
  const items = session ? await repository().list(session.user.id) : []
  return (
    <AssessmentLibrary
      signedIn={Boolean(session && !session.user.isAnonymous)}
      authEnabled={Boolean(
        process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET
      )}
      authError={error === 'claim' ? 'claim' : error ? 'signin' : null}
      items={items.map((item) => ({
        ...item,
        updatedAt: item.updatedAt.toISOString()
      }))}
    />
  )
}
