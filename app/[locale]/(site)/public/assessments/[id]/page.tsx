import { getLocale, getTranslations } from 'next-intl/server'
import { defaultLocale, languageTag } from '@/i18n/config'
import { SurfaceMessages } from '@/components/surface-messages'
import { loadPersonaComparisons } from '@/components/landing/data'
import { ProfileHeader } from '@/components/profile-header'
import { AssessmentPage } from '@/components/assessment/assessment-page'
import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { simulationPresentation } from '@/lib/personas/payload'
import { loadPublished } from '@/lib/assessments/public-server'
import { pageMetadata } from '@/lib/metadata'
import { publicShareCard, publicShareCardPath } from '@/lib/sharing/public-card'
import { PublishedResult } from '@/components/assessment/published-result'
import { Separator } from '@/components/ui/separator'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
import { CompareCta } from '@/components/compare-cta'
import { MobileCta } from '@/components/mobile-cta'
import { repository } from '@/lib/assessments/server'

export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 172800

// Only explicitly published participant snapshots are enumerated. New shares
// are warmed at publication; historical simulation URLs can render on demand.
// Other locales translate only the chrome, are noindex, and render on demand;
// every parent locale yields the English paths (see users/[username]/page.tsx).
export async function generateStaticParams() {
  return (await repository().publishedParticipantPaths()).map(({ id }) => ({
    locale: defaultLocale,
    id
  }))
}
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const saved = await loadPublished(id)
  const [locale, t] = await Promise.all([getLocale(), getTranslations()])
  const name =
    saved.kind === 'simulation' ? saved.profile.name : saved.publisher?.name
  const metadata = pageMetadata({
    locale,
    translated: false,
    path: `/public/assessments/${id}`,
    title: name
      ? t('Profiles.publicTitle', { name })
      : t('Profiles.sharedTitle'),
    description: t('Profiles.publicDescription'),
    image: publicShareCardPath(id, await publicShareCard(saved, t), locale),
    imageAlt: t('Profiles.publicImageAlt')
  })
  return {
    ...metadata,
    // Non-English variants keep pageMetadata's noindex.
    robots: metadata.robots ?? {
      index: true,
      follow: true,
      googleBot: { 'max-image-preview': 'large' }
    }
  }
}
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const saved = await loadPublished(id)
  if (saved.kind === 'simulation') {
    const presentation = simulationPresentation(saved.simulation)
    const sources = saved.simulation.journey.personaSnapshot?.sources ?? []
    return (
      <AssessmentPage className='content-column pt-6 pb-14'>
        <SurfaceMessages surface='published'>
          <PersonaPageContent
            person={{
              ...saved.profile,
              result: presentation.result,
              sources: sources.map(({ title, url }) => ({ title, url })),
              sourceBriefUpdated: false
            }}
            assessment={presentation.assessment}
          />
        </SurfaceMessages>
      </AssessmentPage>
    )
  }
  const state = saved.assessment
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations('Profiles')
  ])
  const publicationDate = new Intl.DateTimeFormat(languageTag(locale), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(new Date(saved.publishedAt))
  const personas = await loadPersonaComparisons()
  return (
    <AssessmentPage className='content-column flex flex-col gap-8 pt-6 pb-14'>
      {saved.publisher ? (
        <ProfileHeader
          name={saved.publisher.name}
          avatar={saved.publisher.image}
          description={t('asOf', { date: publicationDate })}
          profileUrl={saved.publisher.profileUrl}
          profileLabel={
            saved.publisher.username
              ? `x.com/${saved.publisher.username}`
              : t('profile')
          }
        />
      ) : (
        <h1>{t('sharedTitle')}</h1>
      )}
      {/* Phones hide the header CTA, so the invitation leads there. Wider
          screens already show one in the header; a second, after the
          results, replaces the closing card rather than adding to it. */}
      <div className='sm:hidden'>
        <CompareCta name={saved.publisher?.name} />
      </div>
      <SurfaceMessages surface='published'>
        <PublishedResult
          state={{ ...state, draft: '', eventMarkers: [] }}
          personas={personas}
          afterResults={
            <div key='compare' className='hidden sm:block'>
              <CompareCta name={saved.publisher?.name} />
            </div>
          }
        />
      </SurfaceMessages>
      <div className='flex flex-col sm:hidden'>
        <Separator className='my-12' />
        <WorldviewCtaCard />
      </div>
      <MobileCta />
    </AssessmentPage>
  )
}
