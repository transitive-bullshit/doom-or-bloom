import followerSnapshot from '@/lib/personas/x-followers.json'
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
    transformation: result.experiment?.transformation.value ?? null,
    followers:
      (followerSnapshot.accounts as Record<string, { followers: number }>)[
        person.xUrl ? new URL(person.xUrl).pathname.slice(1).toLowerCase() : ''
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
    pdoom:
      result.experiment?.pdoom?.estimate ??
      (result.experiment?.pdoom?.bounds
        ? (result.experiment.pdoom.bounds[0] +
            result.experiment.pdoom.bounds[1]) /
          2
        : null),
    pdoomLabel: result.experiment?.pdoom?.token
  }))
  return (
    <PageTransition>
      <div className='map-lab-stage'>
        <Prism examples={examples} directory />
      </div>
    </PageTransition>
  )
}
