import { loadPersonaComparisons } from '@/components/landing/data'
import { ProfileHeader } from '@/components/profile-header'
import { AssessmentPage } from '@/components/assessment/assessment-page'
import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { simulationPresentation } from '@/lib/personas/payload'
import { loadPublished } from '@/lib/assessments/public-server'
import { pageMetadata } from '@/lib/metadata'
import { PublishedResult } from '@/components/assessment/published-result'
import { WorldviewCtaCard } from '@/components/worldview-cta-card'
export const dynamic = 'force-dynamic'
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const saved = await loadPublished(id)
  return {
    ...pageMetadata({
      path: `/assessments/public/${id}`,
      title: saved.title,
      description:
        'A shared assessment: the participant’s full conversation and inferred AI worldview.',
      image: `/assessments/public/${id}/social-image.webp`,
      imageAlt: 'AI worldview assessment with interpretation ranges'
    }),
    robots: { index: false, follow: false }
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
      <AssessmentPage
        as='main'
        className='content-column flex flex-col gap-8 py-14'
      >
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
  const personas = await loadPersonaComparisons()
  return (
    <AssessmentPage
      as='main'
      className='content-column flex flex-col gap-8 py-14'
    >
      {saved.publisher ? (
        <ProfileHeader
          name={saved.publisher.name}
          avatar={saved.publisher.image}
          profileUrl={saved.publisher.profileUrl}
          profileLabel='View on X'
        />
      ) : (
        <h1>Your AI worldview</h1>
      )}
      <PublishedResult
        state={{ ...state, draft: '', eventMarkers: [] }}
        personas={personas}
      />
      <WorldviewCtaCard />
    </AssessmentPage>
  )
}
