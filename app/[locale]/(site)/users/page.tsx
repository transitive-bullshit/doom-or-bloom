import { getLocale, getTranslations } from 'next-intl/server'
import followerSnapshot from '@/lib/personas/x-followers.json'
import { publicPageMetadata } from '@/lib/metadata'
import { usersJsonLd } from '@/lib/seo/json-ld'
import { loadExamples } from '@/components/landing/data'
import {
  compareUsers,
  directoryPdoom
} from '@/components/landing/directory-sort'
import { Prism } from '@/components/landing/prism'
import { PageTransition } from '@/components/page-transition'
import { BreadcrumbJsonLd, JsonLd } from '@/components/json-ld'
import '@/components/landing/landing.css'

const followerAccounts: Record<
  string,
  { followers: number; capturedAt?: string } | undefined
> = followerSnapshot.accounts
const followerAccount = (xUrl: string | null | undefined) =>
  xUrl
    ? followerAccounts[new URL(xUrl).pathname.slice(1).toLowerCase()]
    : undefined

export const dynamic = 'error'
export const revalidate = 172800
export function generateMetadata() {
  return publicPageMetadata('users')
}

export default async function Page() {
  const [locale, pages, people] = await Promise.all([
    getLocale(),
    getTranslations('Pages'),
    loadExamples(false)
  ])
  const examples = people.map(
    ({ result, id, slug, name, shortName, avatar, xUrl }) => ({
      id,
      slug,
      name,
      shortName,
      avatar,
      outlook: result.horizontal.value,
      transformation: result.experiment?.transformation.value ?? null,
      followers: followerAccount(xUrl)?.followers ?? null,
      // Accounts added after a full capture carry their own date.
      followersCapturedAt:
        followerAccount(xUrl)?.capturedAt ?? followerSnapshot.capturedAt,
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
    <>
      <BreadcrumbJsonLd path='/users' />
      <JsonLd
        data={usersJsonLd({
          locale,
          name: pages('users.title'),
          description: pages('users.description'),
          // The directory's default order.
          people: examples.toSorted((a, b) => compareUsers(a, b, 'name', 'asc'))
        })}
      />
      <PageTransition>
        <div className='map-lab-stage'>
          <Prism examples={examples} directory />
        </div>
      </PageTransition>
    </>
  )
}
