'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LogOutIcon, ListIcon } from 'lucide-react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { profileImageUrl } from '@/lib/auth/profile-image'
import { api } from '@/lib/assessments/client'
import { WorldviewCta } from '@/components/worldview-cta'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

export function HeaderAccount() {
  const { data: session, isPending } = authClient.useSession()
  const [busy, setBusy] = useState(false)
  const user = session?.user
  async function signOut() {
    setBusy(true)
    try {
      await api('/api/auth/sign-out', { method: 'POST', body: '{}' })
      window.location.assign('/assessments')
    } catch {
      toast.error('Couldn’t log out. Please try again.')
      setBusy(false)
    }
  }
  if (isPending)
    return <div className='hidden size-9 sm:ml-2 sm:block' aria-hidden='true' />
  if (!user || user.isAnonymous)
    return (
      <div className='hidden sm:ml-2 sm:block'>
        <WorldviewCta size='sm' />
      </div>
    )
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='ml-2 rounded-full select-none'
          aria-label='Account menu'
          disabled={busy}
        >
          <Avatar>
            <AvatarImage
              src={profileImageUrl(user.image) ?? undefined}
              alt=''
            />
            <AvatarFallback>
              {user.name.trim().slice(0, 1).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel className='truncate'>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href='/assessments'>
              <ListIcon />
              My assessments
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={busy} onSelect={() => void signOut()}>
            <LogOutIcon />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
