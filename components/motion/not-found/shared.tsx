'use client'
// Adapted from beui.dev/components/blocks/not-found
import type { ReactNode } from 'react'
import { cn } from 'cn'
import { useLocale, useTranslations } from 'next-intl'
import { getPathname } from '@/i18n/navigation'
import { ExpandingArrowLink } from '@/components/motion/expanding-arrow-button'

export interface NotFoundProps {
  className?: string
  code?: string
  title?: string
  description?: string
}

export function NotFoundActions() {
  const t = useTranslations('NotFound')
  const locale = useLocale()
  return (
    <ExpandingArrowLink href={getPathname({ href: '/', locale })}>
      {t('home')}
    </ExpandingArrowLink>
  )
}

export function NotFoundStage({
  className,
  children
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <section
      className={cn(
        'flex w-full flex-1 flex-col items-center justify-center gap-8 py-16 text-center',
        className
      )}
    >
      {children}
    </section>
  )
}
