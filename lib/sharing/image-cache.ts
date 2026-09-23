/** Public previews are fresh for seven days, with one extra day of stale reuse. */
export const publicImageCacheHeaders = {
  'Cache-Control':
    'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400'
}
