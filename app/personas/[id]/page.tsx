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
        <header className='my-8'>
          <p className='mb-2 text-sm text-muted-foreground'>
            Example journey · simulated persona
          </p>
          <h1 className='text-4xl font-semibold tracking-tight'>
            {person.name}
          </h1>
          <p className='mt-3 max-w-xl text-muted-foreground'>
            {person.description} These are results from a fictional proxy’s
            answers, not an assessment of the person.
          </p>
          <Link
            href='/assessment'
            className='mt-5 inline-block font-medium underline underline-offset-4'
          >
            Map your own worldview
          </Link>
        </header>
        <ExperimentalResults subject={person.name} result={person.result} />
      </div>
    </PageTransition>
  )
}
