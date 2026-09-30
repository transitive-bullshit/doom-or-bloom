'use client'
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { play } from 'cuelume'
import { Moon, Sun } from 'lucide-react'
import { SiteSocialLinks } from '@/components/site-social-links'
import { HeaderAccount } from '@/components/header-account'
import { Button } from '@/components/ui/button'
export function SiteActions() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations('Header')
  return (
    <nav
      className='flex max-w-full flex-wrap items-center justify-end gap-1'
      aria-label={t('navigation')}
    >
      <SiteSocialLinks className='hidden lg:inline-flex' />
      <Button
        variant='ghost'
        size='icon'
        className='size-11'
        aria-label={t('toggleTheme')}
        onClick={() => {
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
          play('toggle', { volume: 0.35 })
        }}
      >
        <Sun className='dark:hidden' />
        <Moon className='hidden dark:block' />
      </Button>
      <HeaderAccount />
    </nav>
  )
}
