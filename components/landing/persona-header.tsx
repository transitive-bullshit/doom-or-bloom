import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function PersonaHeader({
  person
}: {
  person: {
    name: string
    avatar?: string
    xUrl?: string | null
    profileUrl?: string
    profileLabel?: string
    description: string
  }
}) {
  const profileUrl = person.xUrl ?? person.profileUrl
  const profileLabel = person.xUrl
    ? `@${person.xUrl.split('/').at(-1)} on X`
    : (person.profileLabel ?? 'Profile')
  const portrait = person.avatar && (
    <Image
      src={person.avatar}
      alt={person.name}
      width={80}
      height={80}
      className='size-16 rounded-full object-cover sm:size-20'
      unoptimized
    />
  )
  return (
    <header className='my-8 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between'>
      <div className='min-w-0'>
        <div className='flex items-center gap-4'>
          {portrait &&
            (profileUrl ? (
              <a
                href={profileUrl}
                target='_blank'
                rel='noreferrer'
                aria-label={`${person.name}: ${profileLabel}`}
                className='shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
              >
                {portrait}
              </a>
            ) : (
              portrait
            ))}
          <div className='min-w-0'>
            <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
              {person.name}
            </h1>
            {profileUrl && (
              <a
                href={profileUrl}
                target='_blank'
                rel='noreferrer'
                className='mt-2 inline-block text-sm text-muted-foreground underline underline-offset-4'
              >
                {profileLabel}
              </a>
            )}
          </div>
        </div>
        <p className='mt-4 max-w-xl text-muted-foreground'>
          {person.description}
        </p>
      </div>
      <Button asChild size='lg' className='shrink-0'>
        <Link href='/assessment'>Map your own worldview</Link>
      </Button>
    </header>
  )
}
