'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/assessments/client'

export function AccountAccess({
  signedIn,
  enabled,
  authError
}: {
  signedIn: boolean
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
      <p className='text-muted-foreground'>
        {signedIn
          ? 'Your assessments are linked to your X account. Sign in to recover them in another browser.'
          : 'Your assessments are saved for this browser. Clearing cookies loses anonymous access.'}
        {!signedIn &&
          enabled &&
          ' Optionally sign in with X to keep access across browsers.'}
      </p>
      {(signedIn || enabled) && (
        <Button variant='outline' disabled={busy} onClick={() => void act()}>
          {busy ? 'Please wait…' : signedIn ? 'Sign out' : 'Keep access with X'}
        </Button>
      )}
      {error && (
        <p role='alert' className='text-sm text-destructive'>
          {error}
        </p>
      )}
    </div>
  )
}
