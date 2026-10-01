import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import {
  closestPersonas,
  type PersonaComparison
} from '@/lib/assessment/persona-matches'
import type { Result } from '@/lib/assessment/schema'

export function ClosestPersonas({
  result,
  personas
}: {
  result: Result
  personas: PersonaComparison[]
}) {
  const t = useTranslations('Results.closest')
  const matches = closestPersonas(result, personas)
  return (
    <Card role='region' aria-labelledby='closest-personas-title'>
      <CardHeader>
        <CardTitle>
          <h3 id='closest-personas-title'>{t('title')}</h3>
        </CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length ? (
          <ol className='grid gap-3 sm:grid-cols-3'>
            {matches.map((person, index) => (
              <li key={person.id} className='min-w-0'>
                <Link
                  href={`/users/${person.slug}`}
                  aria-label={t('view', { name: person.name })}
                  className='flex h-full flex-col gap-4 rounded-lg border p-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
                >
                  <div className='flex items-center justify-between gap-3'>
                    <Image
                      src={person.avatar}
                      alt={person.name}
                      width={56}
                      height={56}
                      className='image-outline size-14 rounded-full object-cover'
                    />
                    <span className='text-sm text-muted-foreground'>
                      <span className='sr-only'>
                        {t('rank', { number: index + 1 })}
                      </span>
                      <span aria-hidden='true'>{index + 1}</span>
                    </span>
                  </div>
                  <span className='font-medium'>{person.name}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className='text-sm text-body-foreground'>
            {personas.length ? t('insufficient') : t('unavailable')}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <p className='text-xs text-muted-foreground'>{t('note')}</p>
      </CardFooter>
    </Card>
  )
}
