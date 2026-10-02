import { getLocale, getTranslations } from 'next-intl/server'
import { defaultLocale } from '@/i18n/config'
import { SurfaceMessages } from '@/components/surface-messages'
import { AuthoredTextProvider } from '@/components/assessment/authored-text'
import { authoredTextFor } from '@/lib/content/l10n-loader'
import { AssessmentPage } from '@/components/assessment/assessment-page'
import { pageMetadata } from '@/lib/metadata'
import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { PageTransition } from '@/components/page-transition'
import { notFound } from 'next/navigation'
import {
  loadPersona,
  loadPersonaPaths,
  loadSimilarWorldviews
} from '@/components/landing/data'
import { BreadcrumbJsonLd, JsonLd } from '@/components/json-ld'
import { profileJsonLd } from '@/lib/seo/json-ld'
import { publicStatements } from '@/lib/personas/public-statements'
import { profileTitle } from '@/lib/seo/profile-titles'

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

// Titles name the topics people search with the person, else where they land
// on the map (docs/SEO.md#profile-titles).
const titleSubject = (person: {
  slug: string
  name: string
  result: { horizontal: { value: number | null } }
}) => ({
  slug: person.slug,
  name: person.name,
  outlook: person.result.horizontal.value
})

export async function generateMetadata({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const profile = await loadPersona(username)
  if (!profile) notFound()
  const { person } = profile
  const [locale, t, root] = await Promise.all([
    getLocale(),
    getTranslations('Profiles'),
    getTranslations()
  ])
  return pageMetadata({
    locale,
    translated: false,
    path: `/users/${person.slug}`,
    title: profileTitle(root, locale, titleSubject(person)),
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
  const [locale, similar, t, root] = await Promise.all([
    getLocale(),
    loadSimilarWorldviews(person),
    getTranslations('Profiles'),
    getTranslations()
  ])
  const authored = authoredTextFor(locale, person.result.versions, {
    promptIds: assessment.answers.map(({ promptId }) => promptId)
  })
  const path = `/users/${person.slug}`
  return (
    <>
      <JsonLd
        data={profileJsonLd({
          person,
          locale,
          title: profileTitle(root, locale, titleSubject(person)),
          description: t('userDescription', { name: person.name }),
          personDescription: t('personDescription', { name: person.name }),
          dateModified: person.result.experiment?.generatedAt
        })}
      />
      <BreadcrumbJsonLd path={path} />
      <PageTransition>
        <AssessmentPage className='content-column pt-6 pb-10'>
          <SurfaceMessages surface='published'>
            <AuthoredTextProvider value={authored}>
              <PersonaPageContent
                person={person}
                assessment={assessment}
                similar={similar}
                statements={publicStatements.get(person.slug)}
              />
            </AuthoredTextProvider>
          </SurfaceMessages>
        </AssessmentPage>
      </PageTransition>
    </>
  )
}
