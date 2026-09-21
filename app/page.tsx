import { loadExamples } from '@/components/landing/data'
import { MapFirst } from '@/components/landing/map-first'
import { PageTransition } from '@/components/page-transition'
import '@/components/landing/landing.css'

export default async function Page() {
  const examples = (await loadExamples()).map(({ result, ...person }) => ({
    ...person,
    outlook: result.horizontal.value,
    transformation: result.experiment?.transformation.value ?? null
  }))
  return (
    <PageTransition>
      <div className='landing-stage'>
        <MapFirst examples={examples} />
      </div>
    </PageTransition>
  )
}
