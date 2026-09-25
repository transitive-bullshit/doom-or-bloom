import { loadPersonaComparisons } from '@/components/landing/data'
import { ProfileHeader } from '@/components/profile-header'
import { AssessmentPage } from '@/components/assessment/assessment-page'
import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { simulationPresentation } from '@/lib/personas/payload'
import { loadPublished } from '@/lib/assessments/public-server'
import { pageMetadata } from '@/lib/metadata'
import { PublishedResult } from '@/components/assessment/published-result'
import { Separator } from '@/components/ui/separator'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
import { repository } from '@/lib/assessments/server'

export const dynamic = 'force-static'
export const dynamicParams = true
export const revalidate = 172800

// Only explicitly published participant snapshots are enumerated. New shares
// are warmed at publication; historical simulation URLs can render on demand.
export function generateStaticParams() {
  return repository().publishedParticipantPaths()
}
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const saved = await loadPublished(id)
  return {
    ...pageMetadata({
      path: `/public/assessments/${id}`,
      title:
        saved.kind === 'simulation'
          ? `${saved.profile.name}’s AI worldview`
          : saved.publisher
            ? `${saved.publisher.name}’s AI worldview`
            : saved.title,
      description:
        'Explore this AI worldview: expectations, risks, closest perspectives, and the answers behind the assessment.',
      image: `/public/assessments/${id}/social-image.webp`,
      imageAlt: 'AI worldview assessment with interpretation ranges'
    }),
    robots: {
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
        <PersonaPageContent
          person={{
            ...saved.profile,
            result: presentation.result,
            sources: sources.map(({ title, url }) => ({ title, url })),
            sourceBriefUpdated: false
          }}
          assessment={presentation.assessment}
        />
      </AssessmentPage>
    )
  }
  const state = saved.assessment
  const publicationDate = new Intl.DateTimeFormat('en-US', {
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
          description={`A map of your AI worldview as of ${publicationDate}.`}
          profileUrl={saved.publisher.profileUrl}
          profileLabel={
            saved.publisher.username
              ? `x.com/${saved.publisher.username}`
              : 'Profile'
          }
        />
      ) : (
        <h1>Your AI worldview</h1>
      )}
      <PublishedResult
        state={{ ...state, draft: '', eventMarkers: [] }}
        personas={personas}
      />
      <Separator className='my-12' />
      <WorldviewCtaCard />
    </AssessmentPage>
  )
}
