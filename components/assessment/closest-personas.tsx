import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
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
          <h2 id='closest-personas-title'>Your closest worldviews</h2>
        </CardTitle>
        <CardDescription>
          Explore the pre-built personas closest to your views across
          capabilities, risks, benefits, control, institutions, agency and
          policy.
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
                  <div className='flex flex-col gap-1'>
                    <span className='font-medium'>{person.name}</span>
                    <span className='text-xs text-muted-foreground'>
                      {person.dimensions} shared dimensions
                    </span>
                  </div>
                  <span className='mt-auto flex items-center gap-1 text-sm'>
                    View persona{' '}
                    <ArrowUpRight aria-hidden='true' className='size-4' />
                  </span>
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
          Ranked by distance across shared worldview dimensions, with equal
          weight for each. Unanswered dimensions and reasoning scores are
          excluded. These are simulated views, not the real people’s own
          assessment results. Matches may change as you clarify your answers.
        </p>
      </CardFooter>
    </Card>
  )
}
