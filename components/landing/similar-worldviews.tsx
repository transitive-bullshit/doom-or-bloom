import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

type SimilarWorldview = {
  id: string
  slug: string
  name: string
  avatar: string
}

/**
 * Nearest simulated users, and what they were compared on: the whole
 * worldview, or only the few positions a sparse simulation expresses.
 */
export type SimilarWorldviewList = {
  basis: 'worldview' | 'positions'
  people: SimilarWorldview[]
}

/** Links a profile to the simulated users whose worldviews are nearest. */
export function SimilarWorldviews({
  name,
  basis,
  people
}: { name: string } & SimilarWorldviewList) {
  const t = useTranslations('Persona')
  return (
    <section
      data-slot='similar-worldviews'
      aria-labelledby='similar-worldviews-title'
      className='flex flex-col gap-4'
    >
      <div className='flex flex-col gap-1'>
        <h2 id='similar-worldviews-title'>{t('similarTitle')}</h2>
        <p className='text-sm text-muted-foreground'>
          {basis === 'worldview'
            ? t('similarDescription', { name })
            : t('similarPositionsDescription', { name })}
        </p>
      </div>
      <ul className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {people.map((person) => (
          <li key={person.id} className='min-w-0'>
            {/* Like the map and directory, no automatic viewport prefetching. */}
            <Link
              href={`/users/${person.slug}`}
              prefetch={false}
              className='flex h-full min-w-0 items-center gap-2.5 overflow-hidden rounded-lg border p-2.5 sm:gap-3 sm:p-3 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
            >
              <Image
                src={person.avatar}
                alt=''
                width={40}
                height={40}
                sizes='40px'
                quality={90}
                className='image-outline size-10 shrink-0 rounded-full object-cover'
              />
              {/* Long single-word names (pseudonymous accounts) break and
                  clamp instead of overflowing the card. */}
              <span className='line-clamp-2 min-w-0 text-sm font-medium text-pretty wrap-anywhere'>
                {person.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
