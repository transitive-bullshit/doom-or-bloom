import { Interview } from '@/components/assessment/interview'
import { loadBundle } from '@/lib/content/loader'
import { serverEnv } from '@/lib/server/env'
export default function Page() {
  const env = serverEnv()
  const bundle = loadBundle()
  return (
    <Interview
      model={env.model}
      debugDefault={env.debug}
      debugAvailable={env.debug}
      recoveryCopy={Object.fromEntries(
        bundle.prompts.map((p) => [p.id, p.recoveryVariants])
      )}
    />
  )
}
