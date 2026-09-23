import { notFound } from 'next/navigation'
import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { loadExamples, loadPersonaAssessment } from '@/components/landing/data'

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id: slug } = await params
  const person = (await loadExamples()).find((p) => p.slug === slug)
  if (!person) notFound()
  const assessment = await loadPersonaAssessment(person.id)
  if (!assessment) notFound()
  return (
    <div className='mx-auto w-full max-w-6xl px-6 py-10'>
      <PersonaPageContent person={person} assessment={assessment} />
    </div>
  )
}
