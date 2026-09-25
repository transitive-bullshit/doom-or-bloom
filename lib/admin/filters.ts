export type AdminSearch = Record<string, string | string[] | undefined>
export function adminFilters(params: AdminSearch, now = new Date()) {
  const value = (key: string) =>
    typeof params[key] === 'string' ? params[key] : ''
  const range = ['24h', '7d', '30d'].includes(value('range'))
    ? value('range')
    : 'all'
  const days = range === '24h' ? 1 : range === '7d' ? 7 : 30
  const state = ['completed', 'active', 'recovery', 'attention'].includes(
    value('state')
  )
    ? value('state')
    : 'all'
  const origin = ['all', 'simulation'].includes(value('origin'))
    ? value('origin')
    : 'participant'
  const identity = ['anonymous', 'signed-in'].includes(value('identity'))
    ? value('identity')
    : 'all'
  return {
    range,
    state,
    origin,
    identity,
    since:
      range === 'all'
        ? null
        : new Date(now.getTime() - days * 86400_000).toISOString(),
    query: value('q').trim().slice(0, 120),
    page: Math.min(
      100_000,
      Math.max(1, Number.parseInt(value('page'), 10) || 1)
    ),
    sort: value('sort') === 'created' ? 'created' : 'updated'
  }
}
export type AdminFilters = ReturnType<typeof adminFilters>
export function adminHref(
  path: string,
  filters: AdminFilters,
  updates: Record<string, string | number> = {}
) {
  const query = new URLSearchParams({
    range: filters.range,
    state: filters.state,
    origin: filters.origin,
    identity: filters.identity,
    q: filters.query,
    sort: filters.sort,
    page: String(filters.page),
    ...Object.fromEntries(
      Object.entries(updates).map(([key, value]) => [key, String(value)])
    )
  })
  return `${path}?${query}`
}
