import { PersonaHeader } from '@/components/landing/persona-header'
import { PersonaSources } from '@/components/landing/persona-sources'
import { PageTransition } from '@/components/page-transition'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExperimentalResults } from '@/components/assessment/experimental-results'
import { loadExamples } from '@/components/landing/data'

export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const person = (await loadExamples()).find((p) => p.id === id)
  if (!person) notFound()
  return (
    <PageTransition>
      <div className='mx-auto w-full max-w-6xl px-6 py-10'>
        <Link href='/' className='text-sm underline underline-offset-4'>
          Back to the map
        </Link>
        <PersonaHeader person={person} />
        <ExperimentalResults subject={person} result={person.result} />
        <PersonaSources
          sources={person.sources}
          sourceBriefUpdated={person.sourceBriefUpdated}
        />
      </div>
    </PageTransition>
  )
}
