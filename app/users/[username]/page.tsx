import { AssessmentPage } from '@/components/assessment/assessment-page'
import { pageMetadata } from '@/lib/metadata'
import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { PageTransition } from '@/components/page-transition'
import { notFound } from 'next/navigation'
import { loadExamples, loadPersonaAssessment } from '@/components/landing/data'

export const dynamic = 'error'
export const dynamicParams = true
export const revalidate = 86400

// Generate public profiles on first visit, including personas added after build.
export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const person = (await loadExamples(false)).find(
    (person) => person.slug === username
  )
  if (!person) notFound()
  return pageMetadata({
    path: `/users/${person.slug}`,
    title: `${person.name}’s AI worldview`,
    description: `Explore ${person.name}’s simulated AI worldview, map placement, and source-grounded answers. An experimental interpretation, not their own assessment.`,
    image: `/users/${person.slug}/opengraph-image`,
    imageAlt: `${person.name}’s simulated AI worldview on the Doom–Bloom and scale of transformation map`
  })
}

export default async function Page({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username: slug } = await params
  const person = (await loadExamples(false)).find((p) => p.slug === slug)
  if (!person) notFound()
  const assessment = await loadPersonaAssessment(person.id)
  if (!assessment) notFound()
  return (
    <PageTransition>
      <AssessmentPage className='content-column pt-6 pb-10'>
        <PersonaPageContent person={person} assessment={assessment} />
      </AssessmentPage>
    </PageTransition>
  )
}
