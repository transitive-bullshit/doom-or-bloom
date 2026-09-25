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
        <div className='flex min-w-0 items-center gap-4'>
          {portrait &&
            (profileUrl ? (
              <a
                href={profileUrl}
                target='_blank'
                rel='noreferrer'
                aria-label={`${name}: ${profileLabel}`}
                className='shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring'
              >
                {portrait}
              </a>
            ) : (
              portrait
            ))}
          <div className='min-w-0'>
            <h1>{name}</h1>
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
        {children}
      </div>
      {description && (
        <p className='mt-4 text-body-foreground'>{description}</p>
      )}
    </header>
  )
}
