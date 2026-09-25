import followerSnapshot from '@/lib/personas/x-followers.json'
import { pageMetadata } from '@/lib/metadata'
import { loadExamples } from '@/components/landing/data'
import { directoryPdoom } from '@/components/landing/directory-sort'
import { Prism } from '@/components/landing/prism'
import { PageTransition } from '@/components/page-transition'
import '@/components/landing/landing.css'

export const dynamic = 'error'
export const revalidate = 172800
export const metadata = pageMetadata({
  path: '/users',
  title: 'Simulated users',
  description:
    'Explore and search source-grounded simulated AI worldviews, including users beyond the featured map.'
})

export default async function Page() {
  const examples = (await loadExamples(false)).map(
    ({ result, id, slug, name, shortName, avatar, xUrl }) => ({
      id,
      slug,
      name,
      shortName,
      avatar,
      outlook: result.horizontal.value,
      transformation: result.experiment?.transformation.value ?? null,
      followers:
        (followerSnapshot.accounts as Record<string, { followers: number }>)[
          xUrl ? new URL(xUrl).pathname.slice(1).toLowerCase() : ''
        ]?.followers ?? null,
      followersCapturedAt: followerSnapshot.capturedAt,
      reasoning: result.vertical.value,
      upside:
        result.components.find(
          (component) => component.vector === 'beneficial_potential'
        )?.value ?? null,
      harm:
        result.components.find(
          (component) => component.vector === 'risk_landscape'
        )?.value ?? null,
      influence: result.experiment?.influence.value ?? null,
      pdoom: directoryPdoom(result),
      pdoomLabel: result.experiment?.pdoom?.token
    })
  )
  return (
    <PageTransition>
      <div className='map-lab-stage'>
        <Prism examples={examples} directory />
      </div>
    </PageTransition>
  )
}
