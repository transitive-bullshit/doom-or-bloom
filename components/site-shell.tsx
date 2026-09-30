import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { DevelopmentFeedback } from '@/components/development-feedback'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { SiteBreadcrumbs } from '@/components/site-breadcrumbs'
import { SiteSocialLinks } from '@/components/site-social-links'
import { SiteActions } from '@/components/site-actions'
import { SiteAnalytics } from '@/components/analytics'
import { FirstTouch } from '@/components/first-touch'
import { LanguageSelect } from '@/components/language-select'
import { serverEnv } from '@/lib/server/env'

/** Header, footer and site-wide clients shared by every root layout. */
export function SiteShell({
  children,
  languageSelect
}: {
  children: ReactNode
  // Local tools and admin exist only in English, so they omit the selector.
  languageSelect: boolean
}) {
  const t = useTranslations('Footer')
  return (
    <ThemeProvider>
      <div className='flex min-h-dvh flex-col'>
        <header
          style={{ viewTransitionName: 'site-header' }}
          className='mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-5 sm:gap-3 sm:px-6'
        >
          <Link
            href='/'
            className='site-logo inline-flex items-center gap-2 rounded-sm text-sm font-semibold tracking-tight'
          >
            <Image
              src='/icon.svg'
              alt=''
              width={24}
              height={24}
              className='size-6 shrink-0'
              loading='eager'
              unoptimized
            />
            Doom or Bloom
          </Link>
          <SiteActions />
        </header>
        <main className='flex flex-1 flex-col'>
          <SiteBreadcrumbs />
          {children}
        </main>
        <footer
          style={{ viewTransitionName: 'site-footer' }}
          className='flex flex-col items-center gap-3 px-6 py-6 text-base text-muted-foreground'
        >
          <div className='flex flex-wrap justify-center gap-x-5 gap-y-2'>
            <Link href='/about'>{t('about')}</Link>
            <Link href='/privacy'>{t('privacy')}</Link>
          </div>
          <div className='flex flex-wrap items-center justify-center gap-1'>
            <SiteSocialLinks />
            {languageSelect && <LanguageSelect />}
          </div>
        </footer>
      </div>
      <Toaster />
      <FirstTouch />
      <SiteAnalytics enabled={serverEnv().analytics} />
      {process.env.NODE_ENV === 'development' && <DevelopmentFeedback />}
    </ThemeProvider>
  )
}
