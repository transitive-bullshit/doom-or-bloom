import { pageMetadata } from '@/lib/metadata'
import { loadExamples } from '@/components/landing/data'
import { Prism } from '@/components/landing/prism'
import { PageTransition } from '@/components/page-transition'
import '@/components/landing/landing.css'

export const dynamic = 'error'
export const revalidate = 86400
export const metadata = pageMetadata({
  path: '/users',
  title: 'Simulated users',
  description:
    'Explore and search source-grounded simulated AI worldviews, including users beyond the featured map.'
})

export default async function Page() {
  const examples = (await loadExamples(false)).map(({ result, ...person }) => ({
    ...person,
    outlook: result.horizontal.value,
    transformation: result.experiment?.transformation.value ?? null
  }))
  return (
    <PageTransition>
      <div className='map-lab-stage'>
        <Prism examples={examples} directory />
      </div>
    </PageTransition>
  )
}
