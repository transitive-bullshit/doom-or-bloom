'use client'
import { useState } from 'react'
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
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(
    authError === 'claim'
      ? 'Your assessments could not be linked. Your browser still has access; try signing in again.'
      : authError
        ? 'Sign-in was not completed. You can try again whenever you’re ready.'
        : null
  )
  async function act() {
    setBusy(true)
    setError(null)
    try {
      if (signedIn) {
        await api('/api/auth/sign-out', { method: 'POST', body: '{}' })
        window.location.assign('/assessments')
      } else {
        const result = await api<{ url: string }>('/api/auth/sign-in/social', {
          method: 'POST',
          body: JSON.stringify({
            provider: 'twitter',
            callbackURL: '/assessments',
            errorCallbackURL: '/assessments?authError=signin'
          })
        })
        window.location.assign(result.url)
      }
    } catch {
      setError(
        'Unable to sign in or out right now. Your saved assessments are unchanged.'
      )
      setBusy(false)
    }
  }
  return (
    <div className='flex flex-col items-start gap-3'>
      <div className='flex w-full items-center gap-3'>
        {!signedIn && (
          <p className='text-muted-foreground'>
            Your assessments are saved for this browser.
          </p>
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
        {(signedIn || enabled) && (
          <Button
            variant='outline'
            className='shrink-0'
            disabled={busy}
            onClick={() => void act()}
          >
            {busy ? 'Please wait…' : signedIn ? 'Sign out' : 'Sign in with X'}
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
