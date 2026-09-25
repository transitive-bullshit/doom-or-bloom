import Image from 'next/image'
import Link from 'next/link'
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
  const matches = closestPersonas(result, personas)
  return (
    <Card role='region' aria-labelledby='closest-personas-title'>
      <CardHeader>
        <CardTitle>
          <h3 id='closest-personas-title'>Your closest worldviews</h3>
        </CardTitle>
        <CardDescription>
          Explore the thought leaders whose simulated worldviews are closest to
          your views across capabilities, risks, upside, control, and policy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {matches.length ? (
          <ol className='grid gap-3 sm:grid-cols-3'>
            {matches.map((person, index) => (
              <li key={person.id} className='min-w-0'>
                <Link
                  href={`/users/${person.slug}`}
                  aria-label={`View ${person.name}’s persona`}
                  className='flex h-full flex-col gap-4 rounded-lg border p-4 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
                >
                  <div className='flex items-center justify-between gap-3'>
                    <Image
                      src={person.avatar}
                      alt={person.name}
                      width={56}
                      height={56}
                      className='image-outline size-14 rounded-full object-cover'
                      unoptimized
                    />
                    <span className='text-sm text-muted-foreground'>
                      <span className='sr-only'>Rank </span>
                      {index + 1}
                    </span>
                  </div>
                  <span className='font-medium'>{person.name}</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className='text-sm text-body-foreground'>
            {personas.length
              ? 'There isn’t enough shared worldview evidence to suggest personas yet. Comparisons need at least three dimensions. Answering more questions can help.'
              : 'Persona comparisons are temporarily unavailable. Your assessment results are still available.'}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <p className='text-xs text-muted-foreground'>
          Matches reflect simulated views based on recent sources and may change
          over time.
        </p>
      </CardFooter>
    </Card>
  )
}
