'use client'

import Link from 'next/link'
import { useSyncExternalStore, type ComponentProps } from 'react'
import type { createPrefetchIntent } from '@/lib/landing/prefetch-intent'

const serverSnapshot = () => false

/** Only the old/new candidate links rerender; pointer movement never rerenders the map. */
export function PersonaLink({
  intent,
  prefetchKey,
  ...props
}: Omit<ComponentProps<typeof Link>, 'prefetch'> & {
  intent: ReturnType<typeof createPrefetchIntent>
  prefetchKey: string
}) {
  const active = useSyncExternalStore(
    intent.subscribe,
    () => intent.isActive(prefetchKey),
    serverSnapshot
  )
  return <Link {...props} data-prefetch-key={prefetchKey} prefetch={active} />
}
