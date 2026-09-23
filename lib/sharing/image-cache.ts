/** Public previews may remain available for seven days after unpublishing. */
export const publicImageCacheHeaders = {
  'Cache-Control': 'public, max-age=604800, s-maxage=604800, must-revalidate'
}
