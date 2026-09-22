import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { PageTransition } from '@/components/page-transition'
import { notFound } from 'next/navigation'
import { loadExamples, loadPersonaAssessment } from '@/components/landing/data'

export default async function Page({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username: slug } = await params
  const person = (await loadExamples()).find((p) => p.slug === slug)
  if (!person) notFound()
  const assessment = await loadPersonaAssessment(person.id)
  if (!assessment) notFound()
  return (
    <PageTransition>
      <div className='mx-auto w-full max-w-6xl px-6 py-10'>
        <PersonaPageContent person={person} assessment={assessment} />
      </div>
    </PageTransition>
  )
}
