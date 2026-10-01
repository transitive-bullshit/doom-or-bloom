'use client'
import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { getPathname } from '@/i18n/navigation'
import { cn } from 'cn'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/assessments/client'

export function AccountAccess({
  signedIn,
  profile,
  enabled,
  authError
}: {
  signedIn: boolean
  profile: { name: string; image: string | null } | null
  enabled: boolean
  authError: 'claim' | 'signin' | null
}) {
  const t = useTranslations('Library')
  const locale = useLocale()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(
    authError === 'claim'
      ? t('claimError')
      : authError
        ? t('signinError')
        : null
  )
  async function act() {
    setBusy(true)
    setError(null)
    try {
      const result = await api<{ url: string }>('/api/auth/sign-in/social', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'twitter',
          // Return to the library in the visitor's language.
          callbackURL: getPathname({ href: '/assessments', locale }),
          errorCallbackURL: getPathname({
            href: '/assessments?authError=signin',
            locale
          })
        })
      })
      window.location.assign(result.url)
    } catch {
      setError(t('signinUnavailable'))
      setBusy(false)
    }
  }
  return (
    <div className='flex flex-col items-start gap-3'>
      <div
        className={cn(
          'flex w-full gap-3',
          signedIn
            ? 'items-center'
            : 'flex-col items-start sm:flex-row sm:items-center'
        )}
      >
        {!signedIn && (
          <p className='text-muted-foreground'>{t('browserSaved')}</p>
        )}
        {signedIn && profile && (
          <>
            <Avatar size='lg'>
              <AvatarImage src={profile.image ?? undefined} alt='' />
              <AvatarFallback>
                {profile.name.trim().slice(0, 1).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <span className='font-medium'>{profile.name}</span>
          </>
        )}
        {!signedIn && enabled && (
          <Button
            variant='outline'
            className='shrink-0'
            disabled={busy}
            onClick={() => void act()}
          >
            {busy ? t('wait') : t('signIn')}
          </Button>
        )}
      </div>
      {error && (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      )}
    </div>
  )
}
