'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useState, useSyncExternalStore } from 'react'
import { LogOutIcon, ListIcon } from 'lucide-react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth/client'
import { profileImageUrl } from '@/lib/auth/profile-image'
import { api } from '@/lib/assessments/client'
import { getPathname, Link } from '@/i18n/navigation'
import { WorldviewCta } from '@/components/worldview-cta'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

// Match the server's public navigation until this client has hydrated.
const subscribeToHydration = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export function HeaderAccount() {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    clientSnapshot,
    serverSnapshot
  )
  const { data: session, isPending } = authClient.useSession()
  const t = useTranslations('Header')
  const locale = useLocale()
  const [busy, setBusy] = useState(false)
  const [failedImage, setFailedImage] = useState<string | null>(null)
  const user = session?.user
  const image = profileImageUrl(user?.image)
  async function signOut() {
    setBusy(true)
    try {
      await api('/api/auth/sign-out', { method: 'POST', body: '{}' })
      window.location.assign(getPathname({ href: '/assessments', locale }))
    } catch {
      toast.error(t('logOutFailed'))
      setBusy(false)
    }
  }
  if (!hydrated || isPending || !user || user.isAnonymous)
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
          aria-label={t('accountMenu')}
          disabled={busy}
        >
          <Avatar>
            <AvatarFallback>
              {user.name.trim().slice(0, 1).toUpperCase() || '?'}
            </AvatarFallback>
            {image && image !== failedImage && (
              <Image
                key={image}
                src={image}
                alt=''
                width={32}
                height={32}
                className='absolute inset-0 size-full object-cover'
                onError={() => setFailedImage(image)}
              />
            )}
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
              {t('myAssessments')}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled={busy} onSelect={() => void signOut()}>
            <LogOutIcon />
            {t('logOut')}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
