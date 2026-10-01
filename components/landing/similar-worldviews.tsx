import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export type SimilarWorldview = {
  id: string
  slug: string
  name: string
  avatar: string
}

/** Links a profile to the simulated users whose worldviews are nearest. */
export function SimilarWorldviews({
  name,
  people
}: {
  name: string
  people: SimilarWorldview[]
}) {
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
          {t('similarDescription', { name })}
        </p>
      </div>
      <ul className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {people.map((person) => (
          <li key={person.id} className='min-w-0'>
            {/* Like the map and directory, no automatic viewport prefetching. */}
            <Link
              href={`/users/${person.slug}`}
              prefetch={false}
              className='flex h-full items-center gap-2.5 rounded-lg border p-2.5 sm:gap-3 sm:p-3 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
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
              <span className='min-w-0 text-sm font-medium text-pretty'>
                {person.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
