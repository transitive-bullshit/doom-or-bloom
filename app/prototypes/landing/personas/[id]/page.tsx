import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PersonaPageContent } from '@/components/landing/persona-page-content'
import { loadExamples, loadPersonaAssessment } from '@/components/landing/data'

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ v?: string }>
}) {
  const { id } = await params
  const person = (await loadExamples()).find((p) => p.id === id)
  const assessment = await loadPersonaAssessment(id)
  if (!person || !assessment) notFound()
  const v = Number((await searchParams).v)
  return (
    <div className='mx-auto w-full max-w-6xl px-6 py-10'>
      <Link
        href={`/prototypes/landing?v=${v >= 1 && v <= 3 ? v : 1}`}
        className='text-sm underline underline-offset-4'
      >
        Back to landing preview
      </Link>
      <PersonaPageContent person={person} assessment={assessment} />
    </div>
  )
}
