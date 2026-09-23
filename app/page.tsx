import { pageMetadata } from '@/lib/metadata'
import { publicPages } from '@/lib/site'
import { loadExamples } from '@/components/landing/data'
import { Prism } from '@/components/landing/prism'
import { PageTransition } from '@/components/page-transition'
import '@/components/landing/landing.css'

// Only public persona data belongs in this shared page cache.
export const dynamic = 'error'
export const revalidate = 86400
export const metadata = pageMetadata(publicPages[0]!)

export default async function Page() {
  const examples = (await loadExamples()).map(({ result, ...person }) => ({
    ...person,
    outlook: result.horizontal.value,
    transformation: result.experiment?.transformation.value ?? null
  }))
  return (
    <PageTransition>
      <div className='map-lab-stage'>
        <Prism examples={examples} />
      </div>
    </PageTransition>
  )
}
