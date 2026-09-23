import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
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
  searchParams: Promise<{ authError?: string; start?: string }>
}) {
  const session = await getAuth().api.getSession({ headers: await headers() })
  const { authError: error, start } = await searchParams
  const items = session ? await repository().list(session.user.id) : []
  if (start === '1' && items.length > 0) redirect('/assessments')
  return (
    <AssessmentLibrary
      autoStart={start === '1' && !error}
      signedIn={Boolean(session && !session.user.isAnonymous)}
      profile={
        session && !session.user.isAnonymous
          ? { name: session.user.name, image: session.user.image ?? null }
          : null
      }
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
