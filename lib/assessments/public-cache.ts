import 'server-only'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { authUrls } from '@/lib/auth/urls'
import { reportServerError } from '@/lib/server/error-reporting'

/** Call only after an authorized visibility change/delete has committed. */
export function refreshPublicAssessment(id: string, published: boolean) {
  const path = `/public/assessments/${id}`
  // Explicit path invalidation expires cached HTML/RSC, including an earlier
  // private/unknown 404. Never use stale-while-revalidate for a visibility change.
  revalidatePath(path)
  if (!published || process.env.NODE_ENV !== 'production') return

  // After the response flushes invalidation, warm the newly public page without
  // delaying publication. Never forward owner cookies or trust request hosts.
  after(async () => {
    try {
      const origin = authUrls().origins[0]!
      const response = await fetch(new URL(path, origin), {
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(15_000)
      })
      if (response.status === 404) return // May have been unpublished meanwhile.
      if (!response.ok) throw new Error('Public page warmup failed')
      await response.arrayBuffer()
    } catch (err) {
      // Warming is an optimization; publication remains available on demand.
      reportServerError(
        'public_assessment_warmup_failed',
        err,
        { assessmentId: id },
        'warn'
      )
    }
  })
}
