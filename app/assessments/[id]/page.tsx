import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { getAuth } from '@/lib/auth/server'
import { repository } from '@/lib/assessments/server'
import { AssessmentError } from '@/lib/assessments/contracts'
import { PageTransition } from '@/components/page-transition'
import { Interview } from '@/components/assessment/interview'
import { loadBundle } from '@/lib/content/loader'
import { loadExamples } from '@/components/landing/data'
import { worldviewValues } from '@/lib/assessment/persona-matches'
import { serverEnv } from '@/lib/server/env'
import styles from '../assessment.module.css'
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
  const session = await getAuth().api.getSession({ headers: await headers() })
  if (!session) redirect('/assessments')
  const initial = await repository()
    .load(session.user.id, id.data)
    .catch((err: unknown) => {
      if (err instanceof AssessmentError && err.status === 404) notFound()
      throw err
    })
  const env = serverEnv()
  const bundle = loadBundle(initial.assessment.versions.content)
  const personas = (
    await loadExamples().catch((err: unknown) => {
      console.error('Unable to load persona comparisons', err)
      return []
    })
  ).map(({ id, name, slug, avatar, result }) => ({
    id,
    name,
    slug,
    avatar,
    values: worldviewValues(result)
  }))
  return (
    <PageTransition>
      <div className={styles.page}>
        <h1 className='mx-auto w-full max-w-2xl px-6 pt-10'>
          Map your AI worldview
        </h1>
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
      </div>
    </PageTransition>
  )
}
