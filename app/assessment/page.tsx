import { pageMetadata } from '@/lib/metadata'
import { publicPages } from '@/lib/site'
import { PageTransition } from '@/components/page-transition'
import { Interview } from '@/components/assessment/interview'
import { loadBundle } from '@/lib/content/loader'
import { loadExamples } from '@/components/landing/data'
import { worldviewValues } from '@/lib/assessment/persona-matches'
import { serverEnv } from '@/lib/server/env'
export const metadata = pageMetadata(publicPages[1]!)

export default async function Page() {
  const env = serverEnv()
  const bundle = loadBundle()
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
      <h1 className='mx-auto w-full max-w-2xl px-6 pt-10 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl'>
        Map your AI worldview
      </h1>
      <Interview
        personas={personas}
        model={env.provider === 'fixture' ? 'fixture-v1' : env.model}
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
    </PageTransition>
  )
}
