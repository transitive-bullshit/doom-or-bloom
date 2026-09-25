'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const clientReady = () => true
const serverReady = () => false

// The server cannot know the viewer's browser locale/timezone. Keep the first
// client render identical to SSR, then format locally without hydration drift.
function useLocalTimeReady() {
  return useSyncExternalStore(subscribe, clientReady, serverReady)
}

export function AdminTimeZone() {
  const ready = useLocalTimeReady()
  return (
    <span>
      {ready
        ? new Intl.DateTimeFormat().resolvedOptions().timeZone
        : 'local time'}
    </span>
  )
}

export function AdminDate({
  value,
  showZone = false
}: {
  value: Date | string
  showZone?: boolean
}) {
  const ready = useLocalTimeReady()
  const date = new Date(value)
  return (
    <>
      <time dateTime={date.toISOString()}>
        {ready
          ? new Intl.DateTimeFormat(navigator.languages, {
              dateStyle: 'medium',
              timeStyle: 'short'
            }).format(date)
          : '—'}
      </time>
      {showZone && (
        <>
          {' '}
          · <AdminTimeZone />
        </>
      )}
    </>
  )
}
