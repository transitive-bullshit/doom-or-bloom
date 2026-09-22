import { pageMetadata } from '@/lib/metadata'
import { publicPages } from '@/lib/site'
import { PageTransition } from '@/components/page-transition'
import { Interview } from '@/components/assessment/interview'
import { loadBundle } from '@/lib/content/loader'
import { serverEnv } from '@/lib/server/env'
export const metadata = pageMetadata(publicPages[1]!)

export default function Page() {
  const env = serverEnv()
  const bundle = loadBundle()
  return (
    <PageTransition>
      <Interview
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
