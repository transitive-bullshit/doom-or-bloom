import { ProfilePortrait } from '@/components/profile-portrait'
import type { ReactNode } from 'react'

export function ProfileHeader({
  name,
  avatar,
  profileUrl,
  profileLabel = 'Profile',
  description,
  children
}: {
  name: string
  avatar?: string | null
  profileUrl?: string | null
  profileLabel?: string
  description?: string
  children?: ReactNode
}) {
  const portrait = avatar && (
    <ProfilePortrait key={avatar} src={avatar} alt={name} />
  )
  return (
    <header>
      <div className='flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between'>
        <div className='relative flex min-w-0 items-center gap-4'>
          {/* On wide screens the portrait hangs in the margin so the name,
              link and description share the column's left edge. */}
          {portrait && (
            <div className='shrink-0 lg:absolute lg:top-1/2 lg:right-full lg:mr-6 lg:-translate-y-1/2'>
              {profileUrl ? (
                <a
                  href={profileUrl}
                  target='_blank'
                  rel='noreferrer'
                  aria-label={`${name}: ${profileLabel}`}
                  className='block rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
                >
                  {portrait}
                </a>
              ) : (
                portrait
              )}
            </div>
          )}
          <div className='min-w-0'>
            <h1>{name}</h1>
            {profileUrl && (
              <a
                href={profileUrl}
                target='_blank'
                rel='noreferrer'
                className='mt-0.5 inline-block text-sm text-muted-foreground underline underline-offset-4'
              >
                {profileLabel}
              </a>
            )}
          </div>
        </div>
        {children}
      </div>
      {/* One rhythm for name, link and description once the portrait no
          longer shares their row. */}
      {description && (
        <p
          className={`text-body-foreground ${portrait ? 'mt-4 lg:mt-1.5' : 'mt-1.5'}`}
        >
          {description}
        </p>
      )}
    </header>
  )
}
