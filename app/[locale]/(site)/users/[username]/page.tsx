import { getLocale, getTranslations } from 'next-intl/server'
import { defaultLocale } from '@/i18n/config'
import { SurfaceMessages } from '@/components/surface-messages'
import { AssessmentPage } from '@/components/assessment/assessment-page'
import { pageMetadata } from '@/lib/metadata'
import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { PageTransition } from '@/components/page-transition'
import { notFound } from 'next/navigation'
import { loadPersona, loadPersonaPaths } from '@/components/landing/data'

export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 172800

// Publish the entire selected catalog with the build, including unfeatured users.
// Existing paths serve cached content during 48-hour background revalidation.
// New post-build slugs can render on demand so refreshed directory links work.
// Only English is pregenerated: other locales translate the chrome alone, are
// noindex, and render on first request, then cache like English. Next needs
// complete params under every parent locale, so each yields the English paths
// (an empty list would disable pregeneration); duplicates collapse.
export async function generateStaticParams() {
  return (await loadPersonaPaths()).map(({ username }) => ({
    locale: defaultLocale,
    username
  }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const profile = await loadPersona(username)
  if (!profile) notFound()
  const { person } = profile
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('Profiles')
  ])
  return pageMetadata({
    locale,
    translated: false,
    path: `/users/${person.slug}`,
    title: t('userTitle', { name: person.name }),
    description: t('userDescription', { name: person.name }),
    // Change the image URL so social crawlers do not reuse the earlier WebP.
    // Other languages add theirs, so a shared link previews in that language.
    image: `/users/${person.slug}/opengraph-image?v=png-1${locale === defaultLocale ? '' : `&locale=${locale}`}`,
    imageAlt: t('userImageAlt', { name: person.name })
  })
}

export default async function Page({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username: slug } = await params
  const profile = await loadPersona(slug)
  if (!profile) notFound()
  const { person, assessment } = profile
  return (
    <PageTransition>
      <AssessmentPage className='content-column pt-6 pb-10'>
        <SurfaceMessages surface='published'>
          <PersonaPageContent person={person} assessment={assessment} />
        </SurfaceMessages>
      </AssessmentPage>
    </PageTransition>
  )
}
