import { publicPageMetadata } from '@/lib/metadata'
import { loadExamples } from '@/components/landing/data'
import { Prism } from '@/components/landing/prism'
import { PageTransition } from '@/components/page-transition'
import '@/components/landing/landing.css'

// Only public persona data belongs in this shared page cache.
export const dynamic = 'error'
export const revalidate = 172800
export function generateMetadata() {
  return publicPageMetadata('home')
}

export default async function Page() {
  const examples = (await loadExamples()).map(
    ({ result, id, slug, name, shortName, avatar }) => ({
      id,
      slug,
      name,
      shortName,
      avatar,
      outlook: result.horizontal.value,
      transformation: result.experiment?.transformation.value ?? null
    })
  )
  return (
    <PageTransition>
      <div className='map-lab-stage'>
        <Prism examples={examples} />
      </div>
    </PageTransition>
  )
}
