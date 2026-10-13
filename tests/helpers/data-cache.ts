import { vi } from 'vitest'

/**
 * Backs Next's actual unstable_cache with an in-memory store. Advance the
 * returned clock (in seconds) to age entries; restore with vi.unstubAllGlobals.
 */
export function stubDataCache() {
  const clock = { now: 0 }
  const entries = new Map<string, { value: unknown; at: number }>()
  vi.stubGlobal('__incrementalCache', {
    generateSimpleCacheKey: async (key: string) => key,
    get: async (key: string, options: { revalidate: number | false }) => {
      const entry = entries.get(key)
      return entry
        ? {
            value: entry.value,
            isStale:
              options.revalidate !== false &&
              clock.now - entry.at >= options.revalidate
          }
        : null
    },
    set: async (key: string, value: unknown) => {
      entries.set(key, { value, at: clock.now })
    }
  })
  return clock
}
