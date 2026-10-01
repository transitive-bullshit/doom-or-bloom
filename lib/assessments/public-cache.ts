import 'server-only'
import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { defaultLocale, locales } from '@/i18n/config'
import { authUrls } from '@/lib/auth/urls'
import { reportServerError } from '@/lib/server/error-reporting'

/** Call only after an authorized visibility change/delete has committed. */
export function refreshPublicAssessment(id: string, published: boolean) {
  const page = `/public/assessments/${id}`
  // The social image is cached like the page, so it is revoked with it.
  const paths = [page, `${page}/social-image.png`]
  // Explicit path invalidation expires cached HTML/RSC and images, including an
  // earlier private/unknown 404. Never use stale-while-revalidate for a visibility change.
  // The page renders in app/[locale], so expire the rendered path of every
  // locale variant as well as the public URL (English is served from /en).
  // English images keep the unprefixed route; other languages render their
  // own card under their prefix.
  for (const path of [
    ...paths,
    ...locales.flatMap((locale) =>
      locale === defaultLocale
        ? [`/${locale}${page}`]
        : [`/${locale}${page}`, `/${locale}${page}/social-image.png`]
    )
  ])
    revalidatePath(path)
  if (!published || process.env.NODE_ENV !== 'production') return

  // After the response flushes invalidation, warm the newly public English page
  // and image without delaying publication, so a share made right away is ready.
  // Other locales render on their first request.
  after(() => Promise.all(paths.map((path) => warm(id, path))))
}

// Never forward owner cookies or trust request hosts.
async function warm(id: string, path: string) {
  try {
    const origin = authUrls().origins[0]!
    const response = await fetch(new URL(path, origin), {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(15_000)
    })
    if (response.status === 404) return // May have been unpublished meanwhile.
    if (!response.ok) throw new Error('Public assessment warmup failed')
    await response.arrayBuffer()
  } catch (err) {
    // Warming is an optimization; publication remains available on demand.
    reportServerError(
      'public_assessment_warmup_failed',
      err,
      { assessmentId: id, path },
      'warn'
    )
  }
}
