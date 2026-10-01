import { headers } from 'next/headers'
import { getLocale, getTranslations } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { profileImageUrl } from '@/lib/auth/profile-image'
import { getAuth } from '@/lib/auth/server'
import { repository } from '@/lib/assessments/server'
import { AssessmentLibrary } from '@/components/assessment/library'
import { SurfaceMessages } from '@/components/surface-messages'
import { compareParam, parseCompareTarget } from '@/lib/sharing/compare'
export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  const t = await getTranslations('AssessmentPages')
  return {
    title: t('libraryTitle'),
    robots: { index: false, follow: false }
  }
}
export default async function Page({
  searchParams
}: {
  searchParams: Promise<{
    authError?: string
    start?: string
    compare?: string
  }>
}) {
  const session = await getAuth().api.getSession({ headers: await headers() })
  const { authError: error, start, compare: target } = await searchParams
  const compare = parseCompareTarget(target)
  const items = session ? await repository().list(session.user.id) : []
  // Returning visitors land on their library, keeping who they came to
  // compare with so they can use an existing result.
  if (start === '1' && items.length > 0)
    redirect({
      href: compare
        ? {
            pathname: '/assessments',
            query: { compare: compareParam(compare) }
          }
        : '/assessments',
      locale: await getLocale()
    })
  return (
    <SurfaceMessages surface='library'>
      <AssessmentLibrary
        autoStart={start === '1' && !error}
        compare={compare}
        signedIn={Boolean(session && !session.user.isAnonymous)}
        profile={
          session && !session.user.isAnonymous
            ? {
                name: session.user.name,
                image: profileImageUrl(session.user.image)
              }
            : null
        }
        authEnabled={Boolean(
          process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET
        )}
        authError={error === 'claim' ? 'claim' : error ? 'signin' : null}
        items={items.map((item) => ({
          ...item,
          updatedAt: item.updatedAt.toISOString(),
          createdAt: item.createdAt.toISOString()
        }))}
      />
    </SurfaceMessages>
  )
}
