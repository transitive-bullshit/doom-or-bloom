'use client'
// Adapted from beui.dev/components/blocks/not-found
import type { ReactNode } from 'react'
import { cn } from 'cn'
import { ExpandingArrowLink } from '@/components/motion/expanding-arrow-button'

export interface NotFoundProps {
  className?: string
  code?: string
  title?: string
  description?: string
}

export const NOT_FOUND_DEFAULTS = {
  code: '404',
  title: 'Page not found',
  description: 'Looks like you got lost in latent space'
} as const

export function NotFoundActions() {
  return <ExpandingArrowLink href='/'>Back to home</ExpandingArrowLink>
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
