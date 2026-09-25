export type PrefetchIntent = 'nearby' | 'hover' | 'explicit'

/** At most three eligible profile Links. Next owns transport and cache reuse. */
export function createPrefetchIntent() {
  const active = new Set<string>()
  const pending = new Map<
    string,
    { timer: ReturnType<typeof setTimeout>; due: number }
  >()
  let lastStarted = -Infinity
  const listeners = new Set<() => void>()
  const notify = () => {
    for (const listener of listeners) listener()
  }
  const cancel = (key: string) => {
    clearTimeout(pending.get(key)?.timer)
    pending.delete(key)
  }
  return {
    subscribe(this: void, listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    isActive(key: string) {
      return active.has(key)
    },
    select(keys: readonly string[], intent: PrefetchIntent = 'nearby') {
      const wanted = new Set([...new Set(keys)].slice(0, 3))
      for (const key of pending.keys()) if (!wanted.has(key)) cancel(key)
      let changed = false
      for (const key of active) {
        if (!wanted.has(key)) {
          active.delete(key)
          changed = true
        }
      }
      // Disabling Link prefetch cancels queued/blocked work. Next retains any
      // started requests in its shared cache; public APIs cannot abort them.
      if (changed) notify()
      const now = Date.now()
      for (const key of wanted) {
        if (active.has(key)) continue
        const delay = intent === 'explicit' ? 0 : intent === 'hover' ? 60 : 100
        const due =
          intent === 'explicit' ? now : Math.max(now + delay, lastStarted + 300)
        // Keep each surviving candidate's original deadline during pointer motion.
        if (due >= (pending.get(key)?.due ?? Infinity)) continue
        cancel(key)
        const start = () => {
          pending.delete(key)
          lastStarted = Date.now()
          active.add(key)
          notify()
        }
        if (due <= now) start()
        else pending.set(key, { due, timer: setTimeout(start, due - now) })
      }
    },
    clear() {
      for (const key of pending.keys()) cancel(key)
      if (active.size) {
        active.clear()
        notify()
      }
    }
  }
}

export type NearbyPortrait = {
  key: string
  x: number
  y: number
  radius: number
}

/** Measure from the actual laid-out portrait edges, including collision displacement. */
export function nearbyPortraits(
  points: NearbyPortrait[],
  x: number,
  y: number
) {
  return points
    .map((point) => ({
      key: point.key,
      distance: Math.max(0, Math.hypot(x - point.x, y - point.y) - point.radius)
    }))
    .filter((point) => point.distance < 72)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((point) => point.key)
}
