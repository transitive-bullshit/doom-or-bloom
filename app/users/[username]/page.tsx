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
export function generateStaticParams() {
  return loadPersonaPaths()
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
  return pageMetadata({
    path: `/users/${person.slug}`,
    title: `${person.name}’s AI worldview`,
    description: `Explore ${person.name}’s simulated AI worldview, map placement, and source-grounded answers. An experimental interpretation, not their own assessment.`,
    // Change the image URL so social crawlers do not reuse the earlier WebP.
    image: `/users/${person.slug}/opengraph-image?v=png-1`,
    imageType: 'image/png',
    imageAlt: `${person.name}’s simulated AI worldview on the Doom–Bloom and scale of transformation map`
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
        <PersonaPageContent person={person} assessment={assessment} />
      </AssessmentPage>
    </PageTransition>
  )
}
