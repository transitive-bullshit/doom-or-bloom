import { headers, cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { z } from 'zod'
import { getAuth } from '@/lib/auth/server'
import {
  loadAssessmentOrDraft,
  draftCookieName
} from '@/lib/assessments/drafts'
import { AssessmentError } from '@/lib/assessments/contracts'
import { PageTransition } from '@/components/page-transition'
import { Interview } from '@/components/assessment/interview'
import { loadBundle } from '@/lib/content/loader'
import { loadPersonaComparisons } from '@/components/landing/data'
import { serverEnv } from '@/lib/server/env'
import { AssessmentPage } from '@/components/assessment/assessment-page'
export const dynamic = 'force-dynamic'
export const metadata = {
  title: 'Your assessment',
  robots: { index: false, follow: false }
}

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const id = z.uuid().safeParse((await params).id)
  if (!id.success) notFound()
  const locale = await getLocale()
  const session = await getAuth().api.getSession({ headers: await headers() })
  if (!session) redirect({ href: '/assessments', locale })
  const initial = await loadAssessmentOrDraft(
    session.user.id,
    id.data,
    (await cookies()).get(draftCookieName(locale))?.value
  ).catch((err: unknown) => {
    if (err instanceof AssessmentError && err.status === 404) notFound()
    throw err
  })
  const env = serverEnv()
  const bundle = loadBundle(initial.assessment.versions.content)
  const personas = await loadPersonaComparisons()
  return (
    <PageTransition>
      <AssessmentPage>
        <h1 className='content-column pt-10'>Map your AI worldview</h1>
        <Interview
          personas={personas}
          initial={initial}
          fixtureMode={env.provider === 'fixture'}
          debugDefault={env.debug}
          debugAvailable={env.debug}
          analyticsEnabled={env.posthog}
          analyticsCatalog={{
            prompts: Object.fromEntries(
              bundle.prompts.map((p) => [p.id, p.family])
            ),
            resources: bundle.resources.map((r) => r.id)
          }}
          dimensions={[
            ...bundle.rubric.dimensions.map(({ id, label, meaning }) => ({
              id,
              label,
              meaning
            })),
            { id: 'catastrophic_risk', ...bundle.rubric.catastrophicRisk }
          ]}
          recoveryCopy={Object.fromEntries(
            bundle.prompts.map((p) => [p.id, p.recoveryVariants])
          )}
        />
      </AssessmentPage>
    </PageTransition>
  )
}
