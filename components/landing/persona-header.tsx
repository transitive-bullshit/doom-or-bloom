import Image from 'next/image'
import Link from 'next/link'

export function PersonaHeader({
  person
}: {
  person: {
    name: string
    avatar?: string
    xUrl?: string | null
    description: string
  }
}) {
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
    <header className='my-8'>
      <p className='mb-4 text-sm text-muted-foreground'>
        Example journey · simulated persona
      </p>
      <div className='flex items-center gap-4'>
        {portrait &&
          (person.xUrl ? (
            <a
              href={person.xUrl}
              target='_blank'
              rel='noreferrer'
              aria-label={`${person.name} on X`}
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
          {person.xUrl && (
            <a
              href={person.xUrl}
              target='_blank'
              rel='noreferrer'
              className='mt-2 inline-block text-sm text-muted-foreground underline underline-offset-4'
            >
              @{person.xUrl.split('/').at(-1)} on X
            </a>
          )}
        </div>
      </div>
      <p className='mt-4 max-w-xl text-muted-foreground'>
        {person.description} These are results from a fictional proxy’s answers,
        not an assessment of the person.
      </p>
      <Link
        href='/assessment'
        className='mt-5 inline-block font-medium underline underline-offset-4'
      >
        Map your own worldview
      </Link>
    </header>
  )
}
