'use client'
// beui.dev/components/motion/expanding-arrow-button

import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from '@/lib/ease'
import { useHoverCapable } from '@/lib/hooks/use-hover-capable'
import { cn } from 'cn'
import Link from 'next/link'

const MotionLink = motion.create(Link)

const ARROW_OPACITY = [1, 0.78, 0.54, 0.32, 0.16] as const

function DottedChevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 20 28'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <circle cx='4' cy='4' r='2' fill='currentColor' />
      <circle cx='10' cy='9' r='2' fill='currentColor' />
      <circle cx='16' cy='14' r='2' fill='currentColor' />
      <circle cx='10' cy='19' r='2' fill='currentColor' />
      <circle cx='4' cy='24' r='2' fill='currentColor' />
    </svg>
  )
}

function ArrowContent({
  active,
  reduce,
  accentClassName,
  labelClassName,
  children
}: {
  active: boolean
  reduce: boolean
  accentClassName?: string
  labelClassName?: string
  children: ReactNode
}) {
  const layoutTransition = reduce ? { duration: 0 } : SPRING_LAYOUT
  return (
    <>
      {' '}
      <motion.span
        layout='size'
        aria-hidden='true'
        transition={layoutTransition}
        style={{
          width: active ? 'calc(100% - 8px)' : 40,
          borderRadius: 9999
        }}
        className={cn(
          'absolute inset-y-1 left-1 z-10 overflow-hidden bg-primary-foreground text-primary',
          accentClassName
        )}
      >
        <motion.span
          animate={{ opacity: active ? 0 : 1 }}
          transition={{ duration: reduce ? 0 : 0.1, ease: EASE_OUT }}
          className='absolute inset-0 grid place-items-center'
        >
          <DottedChevron className='h-[22px] w-4' />
        </motion.span>

        <span className='absolute inset-0 flex items-center justify-around px-3'>
          {ARROW_OPACITY.map((opacity, index) => (
            <motion.span
              key={opacity}
              animate={{
                opacity: active ? 1 : 0,
                transform:
                  active && !reduce ? 'translateX(0px)' : 'translateX(-6px)'
              }}
              transition={{
                duration: reduce ? 0 : 0.18,
                delay: active && !reduce ? 0.04 + index * 0.025 : 0,
                ease: EASE_OUT
              }}
              style={{
                color: `color-mix(in srgb, currentColor ${opacity * 100}%, transparent)`
              }}
              className='inline-grid place-items-center'
            >
              <DottedChevron className='h-[22px] w-4' />
            </motion.span>
          ))}
        </span>
      </motion.span>
      <motion.span
        animate={{
          opacity: active ? 0 : 1,
          transform: active && !reduce ? 'translateX(6px)' : 'translateX(0px)'
        }}
        transition={{ duration: reduce ? 0 : 0.12, ease: EASE_OUT }}
        className={cn(
          'relative z-0 ml-14 mr-4 text-sm font-medium tracking-tight',
          labelClassName ?? 'whitespace-nowrap'
        )}
      >
        {children}
      </motion.span>
    </>
  )
}

export function ExpandingArrowAction({
  children,
  disabled,
  className,
  ...props
}: Omit<HTMLMotionProps<'button'>, 'children'> & { children: ReactNode }) {
  const reduce = useReducedMotion()
  const canHover = useHoverCapable()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = !disabled && ((canHover && hovered) || focused)
  return (
    <motion.button
      {...props}
      type='button'
      disabled={disabled}
      data-slot='primary-cta'
      data-expanded={active}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      whileTap={disabled ? undefined : { scale: reduce ? 1 : 0.97 }}
      transition={SPRING_PRESS}
      className={cn(
        'relative inline-flex h-12 w-fit max-w-full shrink-0 items-center overflow-hidden rounded-full bg-primary p-1 text-primary-foreground select-none',
        'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      <ArrowContent
        active={active}
        reduce={Boolean(reduce)}
        labelClassName='min-w-0 whitespace-normal text-left leading-tight'
      >
        {children}
      </ArrowContent>
    </motion.button>
  )
}

export function ExpandingArrowLink({
  href,
  children
}: {
  href: string
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  const canHover = useHoverCapable()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = (canHover && hovered) || focused
  return (
    <MotionLink
      href={href}
      data-slot='primary-cta'
      data-expanded={active}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      whileTap={{ scale: reduce ? 1 : 0.97 }}
      transition={SPRING_PRESS}
      className='relative inline-flex h-12 w-fit max-w-full shrink-0 items-center overflow-hidden rounded-full bg-primary p-1 text-primary-foreground select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'
    >
      <ArrowContent
        active={active}
        reduce={Boolean(reduce)}
        labelClassName='min-w-0 whitespace-normal text-left leading-tight'
      >
        {children}
      </ArrowContent>
    </MotionLink>
  )
}
